from fastapi import FastAPI, APIRouter, HTTPException, Query, Header, Request, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import re
import html
import logging
import httpx
import asyncio
from pathlib import Path
from collections import defaultdict, deque
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ─── Google Calendar config ──────────────────────────────────────────────────
GOOGLE_CLIENT_ID     = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
GOOGLE_REFRESH_TOKEN = os.environ.get('GOOGLE_REFRESH_TOKEN', '')
GOOGLE_CALENDAR_ID   = os.environ.get('GOOGLE_CALENDAR_ID', '')

# ─── Email config ────────────────────────────────────────────────────────────
BREVO_API_KEY     = os.environ.get('BREVO_API_KEY', '')
BREVO_FROM_EMAIL  = os.environ.get('BREVO_FROM_EMAIL', 'cleanstationcar@gmail.com')
BREVO_FROM_NAME   = 'Clean Station Car'

# ─── Admin config ────────────────────────────────────────────────────────────
# Os endpoints de listagem/cancelamento só funcionam com esta chave no header
# X-Admin-Key. Sem ADMIN_API_KEY definido, ficam bloqueados.
ADMIN_API_KEY = os.environ.get('ADMIN_API_KEY', '')

def require_admin(x_admin_key: str = Header(default='')):
    if not ADMIN_API_KEY or x_admin_key != ADMIN_API_KEY:
        raise HTTPException(status_code=403, detail="Acesso não autorizado.")

# ─── Email helpers ────────────────────────────────────────────────────────────

def _build_confirmation_html(b: dict) -> str:
    # Tudo o que vem do utilizador é escapado antes de entrar no HTML.
    e = {k: html.escape(str(b.get(k, '') or '')) for k in
         ('name', 'id', 'serviceTitle', 'dateLabel', 'time', 'durationLabel', 'car', 'price')}
    return f"""<!DOCTYPE html>
<html lang="pt">
<head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:40px 20px;margin:0">
  <div style="max-width:520px;margin:0 auto">

    <div style="text-align:center;margin-bottom:32px">
      <h1 style="font-size:20px;letter-spacing:.22em;margin:0;font-weight:700">CLEAN STATION CAR</h1>
      <p style="color:#666;font-size:11px;letter-spacing:.3em;margin:6px 0 0">LAVAGEM DETALHADA PREMIUM · BRAGA</p>
    </div>

    <div style="border:1px solid #222;padding:32px;margin-bottom:24px">
      <h2 style="font-size:16px;letter-spacing:.18em;margin:0 0 6px">MARCAÇÃO CONFIRMADA ✓</h2>
      <p style="color:#888;font-size:14px;margin:0 0 28px">Olá {e['name']}, a tua marcação foi registada com sucesso.</p>

      <table style="width:100%;font-size:14px;border-collapse:collapse">
        <tr><td style="color:#555;padding:7px 0;border-top:1px solid #1a1a1a">Referência</td>
            <td style="text-align:right;font-family:monospace;color:#aaa">{e['id']}</td></tr>
        <tr><td style="color:#555;padding:7px 0;border-top:1px solid #1a1a1a">Serviço</td>
            <td style="text-align:right">{e['serviceTitle']}</td></tr>
        <tr><td style="color:#555;padding:7px 0;border-top:1px solid #1a1a1a">Data</td>
            <td style="text-align:right">{e['dateLabel']}</td></tr>
        <tr><td style="color:#555;padding:7px 0;border-top:1px solid #1a1a1a">Hora</td>
            <td style="text-align:right">{e['time']}</td></tr>
        <tr><td style="color:#555;padding:7px 0;border-top:1px solid #1a1a1a">Duração</td>
            <td style="text-align:right">{e['durationLabel']}</td></tr>
        <tr><td style="color:#555;padding:7px 0;border-top:1px solid #1a1a1a">Veículo</td>
            <td style="text-align:right">{e['car'] or '—'}</td></tr>
        <tr><td style="color:#fff;padding:14px 0 6px;border-top:1px solid #333;font-weight:600">Total</td>
            <td style="text-align:right;font-size:20px;font-weight:700;padding-top:14px;border-top:1px solid #333">{e['price']}€</td></tr>
      </table>
    </div>

    <p style="color:#444;font-size:12px;text-align:center;line-height:1.8">
      Para cancelar ou alterar a marcação contacta-nos:<br>
      <a href="tel:+351934177308" style="color:#777;text-decoration:none">+351 934 177 308</a>
      &nbsp;·&nbsp;
      <a href="mailto:geral@cleanstationcar.pt" style="color:#777;text-decoration:none">geral@cleanstationcar.pt</a>
    </p>

  </div>
</body>
</html>"""

async def send_confirmation_email(booking: dict):
    email = (booking.get('email') or '').strip()
    if not email or not BREVO_API_KEY:
        return
    try:
        html = _build_confirmation_html(booking)
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.post(
                'https://api.brevo.com/v3/smtp/email',
                headers={'api-key': BREVO_API_KEY, 'content-type': 'application/json'},
                json={
                    'sender':      {'name': BREVO_FROM_NAME, 'email': BREVO_FROM_EMAIL},
                    'to':          [{'email': email}],
                    'subject':     'Confirmação de Marcação – Clean Station Car',
                    'htmlContent': html,
                }
            )
            r.raise_for_status()
        logger.info(f"Email enviado para {email}")
    except Exception as e:
        logger.error(f"Erro ao enviar email: {e}")

# Catálogo autoritativo — preço, título e duração nunca vêm do cliente.
SERVICES_CATALOG = {
    'lavagem':   {'title': 'LAVAGEM DETALHADA',     'price': 25.0,  'duration': 120, 'durationLabel': '2 horas'},
    'interior':  {'title': 'HIGIENIZAÇÃO INTERIOR', 'price': 40.0,  'duration': 180, 'durationLabel': '3 horas'},
    'polimento': {'title': 'POLIMENTO',             'price': 80.0,  'duration': 240, 'durationLabel': '4 horas'},
    'ceramica':  {'title': 'PROTEÇÃO CERÂMICA',     'price': 120.0, 'duration': 480, 'durationLabel': '1 dia'},
}

SERVICE_DURATIONS = {k: v['duration'] for k, v in SERVICES_CATALOG.items()}

TIME_SLOTS_LIST = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']

DATE_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
MAX_DAYS_AHEAD = 180

def _slot_to_min(slot: str) -> int:
    h, m = map(int, slot.split(':'))
    return h * 60 + m

def _dt_to_min(dt: datetime) -> int:
    return dt.hour * 60 + dt.minute

# ─── Google Calendar helpers ─────────────────────────────────────────────────

async def get_access_token() -> str:
    async with httpx.AsyncClient() as hc:
        r = await hc.post('https://oauth2.googleapis.com/token', data={
            'client_id':     GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            'refresh_token': GOOGLE_REFRESH_TOKEN,
            'grant_type':    'refresh_token',
        })
        r.raise_for_status()
        return r.json()['access_token']

async def get_events(date_iso: str) -> list:
    token = await get_access_token()
    url = f"https://www.googleapis.com/calendar/v3/calendars/{GOOGLE_CALENDAR_ID}/events"
    async with httpx.AsyncClient() as hc:
        r = await hc.get(url, headers={'Authorization': f'Bearer {token}'}, params={
            'timeMin': f"{date_iso}T00:00:00Z",
            'timeMax': f"{date_iso}T23:59:59Z",
            'singleEvents': 'true',
        })
        r.raise_for_status()
        return r.json().get('items', [])

async def get_event_ranges(date_iso: str) -> list:
    """Returns list of (start_min, end_min) for all CSC events on the day."""
    events = await get_events(date_iso)
    ranges = []
    for ev in events:
        start_str = ev.get('start', {}).get('dateTime', '')
        end_str   = ev.get('end',   {}).get('dateTime', '')
        if start_str and end_str:
            try:
                s = datetime.fromisoformat(start_str)
                e = datetime.fromisoformat(end_str)
                ranges.append((_dt_to_min(s), _dt_to_min(e)))
            except Exception:
                pass
    return ranges

async def get_busy_slots(date_iso: str, new_duration: int = 60) -> List[str]:
    """Returns slots that would overlap with existing bookings given the new service duration."""
    ranges = await get_event_ranges(date_iso)
    busy = []
    for slot in TIME_SLOTS_LIST:
        slot_start = _slot_to_min(slot)
        slot_end   = slot_start + new_duration
        for (b_start, b_end) in ranges:
            if slot_start < b_end and slot_end > b_start:
                busy.append(slot)
                break
    return busy

async def create_calendar_event(booking: dict) -> str:
    token = await get_access_token()
    duration = SERVICE_DURATIONS.get(booking['serviceId'], 120)
    start_dt = datetime.fromisoformat(f"{booking['date']}T{booking['time']}:00")
    end_dt   = start_dt + timedelta(minutes=duration)
    event = {
        'summary': f"[CSC] {booking['serviceTitle']} — {booking['name']}",
        'description': (
            f"Serviço: {booking['serviceTitle']}\n"
            f"Veículo: {booking.get('car', '-')}\n"
            f"Telefone: {booking['phone']}\n"
            f"Email: {booking.get('email', '-')}\n"
            f"Notas: {booking.get('notes', '-')}\n"
            f"Ref: {booking['id']}"
        ),
        'start': {'dateTime': start_dt.isoformat(), 'timeZone': 'Europe/Lisbon'},
        'end':   {'dateTime': end_dt.isoformat(),   'timeZone': 'Europe/Lisbon'},
        'colorId': '6',
    }
    url = f"https://www.googleapis.com/calendar/v3/calendars/{GOOGLE_CALENDAR_ID}/events"
    async with httpx.AsyncClient() as hc:
        r = await hc.post(url, headers={'Authorization': f'Bearer {token}'}, json=event)
        r.raise_for_status()
        return r.json()['id']

async def delete_calendar_event(event_id: str):
    token = await get_access_token()
    url = f"https://www.googleapis.com/calendar/v3/calendars/{GOOGLE_CALENDAR_ID}/events/{event_id}"
    async with httpx.AsyncClient() as hc:
        r = await hc.delete(url, headers={'Authorization': f'Bearer {token}'})
        if r.status_code not in (200, 204, 404):
            r.raise_for_status()

async def list_all_bookings() -> list:
    """Lê todos os eventos futuros do calendário e converte em marcações."""
    token = await get_access_token()
    url = f"https://www.googleapis.com/calendar/v3/calendars/{GOOGLE_CALENDAR_ID}/events"
    now = datetime.now(timezone.utc).isoformat()
    async with httpx.AsyncClient() as hc:
        r = await hc.get(url, headers={'Authorization': f'Bearer {token}'}, params={
            'timeMin': now,
            'singleEvents': 'true',
            'orderBy': 'startTime',
            'maxResults': 250,
        })
        r.raise_for_status()
        events = r.json().get('items', [])

    bookings = []
    for ev in events:
        desc = ev.get('description', '')
        start = ev.get('start', {}).get('dateTime', '')
        if not start or '[CSC]' not in ev.get('summary', ''):
            continue
        try:
            dt = datetime.fromisoformat(start)
            date_iso = dt.strftime('%Y-%m-%d')
            time_str = dt.strftime('%H:%M')
            date_label = dt.strftime('%d/%m/%Y')
            # Parse description
            lines = {l.split(':')[0].strip(): ':'.join(l.split(':')[1:]).strip() for l in desc.split('\n') if ':' in l}
            bookings.append({
                'id': lines.get('Ref', ev['id']),
                'calendarEventId': ev['id'],
                'serviceTitle': lines.get('Serviço', ''),
                'serviceId': '',
                'car': lines.get('Veículo', ''),
                'phone': lines.get('Telefone', ''),
                'email': lines.get('Email', ''),
                'notes': lines.get('Notas', ''),
                'name': ev.get('summary', '').replace('[CSC] ', '').split(' — ')[-1] if ' — ' in ev.get('summary','') else '',
                'date': date_iso,
                'dateLabel': date_label,
                'time': time_str,
                'price': 0,
                'durationLabel': '',
                'status': 'confirmed',
                'createdAt': ev.get('created', ''),
            })
        except Exception:
            continue
    return bookings

# ─── Modelos ─────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    # Campos extra (price, serviceTitle, ...) enviados pelo cliente são ignorados;
    # o catálogo do servidor é a única fonte de preço/título/duração.
    model_config = ConfigDict(extra="ignore")
    serviceId: str
    date:      str
    time:      str
    name:      str = Field(min_length=1, max_length=100)
    phone:     str = Field(min_length=3, max_length=30)
    email:     str = Field(min_length=5, max_length=120)
    car:       Optional[str] = Field(default='', max_length=100)
    notes:     Optional[str] = Field(default='', max_length=1000)

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id:              str
    calendarEventId: Optional[str] = None
    serviceId:       str
    serviceTitle:    str
    price:           float
    durationLabel:   str
    date:            str
    dateLabel:       str
    time:            str
    name:            str
    phone:           str
    email:           Optional[str] = ''
    car:             Optional[str] = ''
    notes:           Optional[str] = ''
    status:          str = 'confirmed'
    createdAt:       str = ''

# ─── Rate limiting (em memória, por IP) ──────────────────────────────────────

RATE_LIMITS = {'bookings': (5, 3600)}  # 5 marcações por hora por IP
_rate_buckets: dict = defaultdict(deque)

def _client_ip(request: Request) -> str:
    # No Render a app está atrás de proxy; o primeiro IP do X-Forwarded-For é o real.
    fwd = request.headers.get('x-forwarded-for', '')
    if fwd:
        return fwd.split(',')[0].strip()
    return request.client.host if request.client else 'unknown'

def check_rate_limit(request: Request, bucket: str):
    max_calls, window = RATE_LIMITS[bucket]
    now = datetime.now(timezone.utc).timestamp()
    q = _rate_buckets[(bucket, _client_ip(request))]
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= max_calls:
        raise HTTPException(status_code=429, detail="Demasiados pedidos. Tenta novamente mais tarde.")
    q.append(now)

# ─── Validação de marcações ──────────────────────────────────────────────────

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

def validate_booking_input(data: 'BookingCreate') -> dict:
    """Valida serviceId/date/time/email e devolve o serviço do catálogo."""
    service = SERVICES_CATALOG.get(data.serviceId)
    if not service:
        raise HTTPException(status_code=400, detail="Serviço inválido.")

    if not DATE_RE.match(data.date):
        raise HTTPException(status_code=400, detail="Data inválida.")
    try:
        booking_date = datetime.strptime(data.date, '%Y-%m-%d').date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Data inválida.")

    today = datetime.now(timezone.utc).date()
    if booking_date < today:
        raise HTTPException(status_code=400, detail="A data já passou.")
    if (booking_date - today).days > MAX_DAYS_AHEAD:
        raise HTTPException(status_code=400, detail="Data demasiado distante.")
    if booking_date.weekday() == 6:
        raise HTTPException(status_code=400, detail="Domingos encerrado.")

    if data.time not in TIME_SLOTS_LIST:
        raise HTTPException(status_code=400, detail="Horário inválido.")

    if not EMAIL_RE.match(data.email.strip()):
        raise HTTPException(status_code=400, detail="Email inválido.")

    return service

# ─── Endpoints ───────────────────────────────────────────────────────────────

@api_router.get("/")
async def root():
    return {"message": "Clean Station Car API — só Google Calendar"}

@api_router.get("/availability/{date}")
async def get_availability(date: str, service_id: str = Query(default=None)):
    try:
        duration = SERVICE_DURATIONS.get(service_id, 60) if service_id else 60
        busy = await get_busy_slots(date, duration)
    except Exception as e:
        logger.error(f"Erro disponibilidade: {e}")
        busy = []
    return {"date": date, "busySlots": busy}

@api_router.post("/bookings", response_model=Booking)
async def create_booking(data: BookingCreate, request: Request):
    check_rate_limit(request, 'bookings')
    service = validate_booking_input(data)

    # Verificar sobreposição com marcações existentes
    try:
        duration  = service['duration']
        ranges    = await get_event_ranges(data.date)
        new_start = _slot_to_min(data.time)
        new_end   = new_start + duration
        for (b_start, b_end) in ranges:
            if new_start < b_end and new_end > b_start:
                raise HTTPException(status_code=409, detail="Horário já ocupado.")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao verificar disponibilidade: {e}")

    parts = data.date.split('-')
    date_label = f"{parts[2]}/{parts[1]}/{parts[0]}"

    booking_dict = data.model_dump()
    booking_dict['serviceTitle']  = service['title']
    booking_dict['price']         = service['price']
    booking_dict['durationLabel'] = service['durationLabel']
    booking_dict['id']        = f"BK-{str(uuid.uuid4())[:8].upper()}"
    booking_dict['dateLabel'] = date_label
    booking_dict['status']    = 'confirmed'
    booking_dict['createdAt'] = datetime.now(timezone.utc).isoformat()
    booking_dict['calendarEventId'] = None

    try:
        event_id = await create_calendar_event(booking_dict)
        booking_dict['calendarEventId'] = event_id
    except Exception as e:
        logger.error(f"Erro ao criar evento: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar evento no Google Calendar: {str(e)}")

    asyncio.create_task(send_confirmation_email(booking_dict))

    return Booking(**booking_dict)

EVENT_ID_RE = re.compile(r'^[A-Za-z0-9_-]+$')

@api_router.get("/bookings", response_model=List[Booking])
async def list_bookings(_=Depends(require_admin)):
    try:
        return await list_all_bookings()
    except Exception as e:
        logger.error(f"Erro ao listar: {e}")
        return []

@api_router.delete("/bookings/{event_id}")
async def cancel_booking(event_id: str, _=Depends(require_admin)):
    if not EVENT_ID_RE.match(event_id):
        raise HTTPException(status_code=400, detail="ID inválido.")
    try:
        await delete_calendar_event(event_id)
    except Exception as e:
        logger.error(f"Erro ao cancelar: {e}")
        raise HTTPException(status_code=500, detail="Erro ao cancelar no Google Calendar.")
    return {"ok": True}

# ─── App setup ───────────────────────────────────────────────────────────────

app.include_router(api_router)

# Sem wildcard: só as origens explicitamente permitidas chamam a API.
DEFAULT_CORS_ORIGINS = 'https://cleanstationcar.pt,https://www.cleanstationcar.pt'
CORS_ORIGINS = [
    o.strip()
    for o in os.environ.get('CORS_ORIGINS', DEFAULT_CORS_ORIGINS).split(',')
    if o.strip() and o.strip() != '*'
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=CORS_ORIGINS,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "X-Admin-Key"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)