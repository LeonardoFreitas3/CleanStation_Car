import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Car, User, MessageCircle, Ban, Calendar, UserPlus, Pencil,
} from 'lucide-react';
import {
  SERVICE_STATUS_CLASS, SERVICE_STATUS_LABEL, getService, nextStatus,
  updateServiceStatus,
} from '../services/services';
import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import { ServiceTimeline } from '../components/ServiceTimeline';
import { PhotoUploader } from '../components/PhotoUploader';
import { MessageSender } from '../components/MessageSender';
import { useAuth } from '../contexts/AuthContext';
import { date, eur, whatsappNumber } from '../lib/format';
import { Alert, Button, Card, Spinner } from '../components/ui';
import type { ServiceWithRelations } from '../types';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [service, setService] = useState<ServiceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messaging, setMessaging] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const s = await getService(id);
      if (!s) setError('Serviço não encontrado.');
      setService(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar o serviço.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const advance = async () => {
    if (!service) return;
    const next = nextStatus(service.status);
    if (!next) return;

    setBusy(true);
    setError(null);
    try {
      await updateServiceStatus(service.id, next);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível atualizar o estado.');
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!service) return;
    if (!window.confirm('Cancelar este serviço? O registo mantém-se no histórico.')) return;

    setBusy(true);
    setError(null);
    try {
      await updateServiceStatus(service.id, 'cancelado');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível cancelar.');
    } finally {
      setBusy(false);
    }
  };

  // Atalho para quem pega no trabalho: evita ter de abrir o formulario de
  // edicao so para se atribuir a si proprio.
  const assignToMe = async () => {
    if (!service || !profile) return;
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await getSupabase()
        .from('services')
        .update({ employee_id: profile.id })
        .eq('id', service.id);
      if (err) throw new Error(friendlyError(err));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível atribuir.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Spinner size={26} /></div>;
  if (!service) return <Alert tone="error">{error ?? 'Serviço não encontrado.'}</Alert>;

  const next = nextStatus(service.status);
  const wa = whatsappNumber(service.client?.phone);
  const finished = service.status === 'entregue' || service.status === 'cancelado';

  return (
    <>
      <button
        onClick={() => navigate('/crm/servicos')}
        className="inline-flex items-center gap-2 text-white/45 hover:text-blue-400 text-xs tracking-[0.15em] uppercase mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Serviços
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/30 text-sm font-mono">#{service.reference}</span>
            <span className={`px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm ${SERVICE_STATUS_CLASS[service.status]}`}>
              {SERVICE_STATUS_LABEL[service.status]}
            </span>
          </div>
          <h1 className="font-display text-white text-xl md:text-2xl font-black tracking-wide mt-2">
            {service.service_name}
          </h1>
        </div>
        <div className="flex items-start gap-4 shrink-0">
          <div className="text-right">
            <div className="text-[9px] tracking-[0.25em] text-white/40 uppercase">Total</div>
            <div className="text-white font-display text-2xl font-bold">{eur(service.total)}</div>
          </div>
          <Link to={`/crm/servicos/${service.id}/editar`}>
            <Button variant="secondary"><Pencil className="w-4 h-4" /> Editar</Button>
          </Link>
        </div>
      </div>

      {/* Identificacao: quem, que carro, que matricula */}
      <Card className="p-4 mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="min-w-0">
            <div className="text-[9px] tracking-[0.25em] text-white/40 uppercase">Cliente</div>
            {service.client ? (
              <Link to={`/crm/clientes/${service.client.id}`} className="text-white hover:text-blue-400 transition font-semibold truncate block mt-1">
                {service.client.name}
              </Link>
            ) : <div className="text-white/40 mt-1">—</div>}
            {service.client?.phone && <div className="text-white/45 text-xs mt-0.5">{service.client.phone}</div>}
          </div>

          <div className="min-w-0">
            <div className="text-[9px] tracking-[0.25em] text-white/40 uppercase">Viatura</div>
            {service.vehicle ? (
              <>
                <div className="text-white font-display font-bold tracking-wider mt-1 inline-flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-400/70" />{service.vehicle.plate}
                </div>
                <div className="text-white/45 text-xs mt-0.5 truncate">
                  {[service.vehicle.make, service.vehicle.model].filter(Boolean).join(' ') || '—'}
                </div>
              </>
            ) : <div className="text-white/40 mt-1">—</div>}
          </div>

          <div className="min-w-0">
            <div className="text-[9px] tracking-[0.25em] text-white/40 uppercase">Funcionário</div>
            {service.employee ? (
              <div className="text-white mt-1 inline-flex items-center gap-2 truncate">
                <User className="w-4 h-4 text-blue-400/70 shrink-0" />{service.employee.full_name}
              </div>
            ) : (
              <button
                onClick={assignToMe}
                disabled={busy}
                className="text-blue-400 hover:text-blue-300 text-sm mt-1 inline-flex items-center gap-2 transition disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" /> Atribuir a mim
              </button>
            )}
          </div>
        </div>

        {(service.scheduled_at || service.completed_at) && (
          <div className="flex gap-6 mt-4 pt-4 border-t border-white/10 text-xs text-white/50 flex-wrap">
            {service.scheduled_at && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Agendado: {date(service.scheduled_at)}
              </span>
            )}
            {service.completed_at && <span>Concluído: {date(service.completed_at)}</span>}
          </div>
        )}
      </Card>

      <div className="mt-6">
        <div className="text-[10px] tracking-[0.28em] text-white/50 uppercase mb-4">Progresso</div>
        <ServiceTimeline status={service.status} />
      </div>

      {error && <div className="mt-5"><Alert tone="error">{error}</Alert></div>}

      {/* Accao principal: botao grande, para usar com uma mao molhada */}
      {!finished && (
        <div className="mt-6 space-y-3">
          {next && (
            <Button size="lg" onClick={advance} loading={busy} className="w-full">
              Avançar para {SERVICE_STATUS_LABEL[next]} <ArrowRight className="w-4 h-4" />
            </Button>
          )}

          <div className="flex gap-3 flex-wrap">
            {wa && (
              <div className="flex-1 min-w-[140px]">
                <Button variant="whatsapp" size="lg" onClick={() => setMessaging(true)} className="w-full">
                  <MessageCircle className="w-4 h-4" /> Mensagem
                </Button>
              </div>
            )}
            <Button variant="danger" size="lg" onClick={cancel} disabled={busy} className="flex-1 min-w-[140px]">
              <Ban className="w-4 h-4" /> Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="text-[10px] tracking-[0.28em] text-white/50 uppercase mb-4">Fotografias</div>
        <PhotoUploader serviceId={service.id} />
      </div>

      {messaging && <MessageSender service={service} onClose={() => setMessaging(false)} />}

      {service.extras.length > 0 && (
        <Card className="p-4 mt-6">
          <div className="text-[9px] tracking-[0.25em] text-white/40 uppercase mb-3">Extras</div>
          <ul className="space-y-2">
            {service.extras.map((x) => (
              <li key={x.slug} className="flex justify-between text-sm">
                <span className="text-white/75">{x.name}</span>
                <span className="text-white">{eur(x.price)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-4 mt-4">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/55">Preço base</dt>
            <dd className="text-white">{eur(service.price)}</dd>
          </div>
          {service.extras_total > 0 && (
            <div className="flex justify-between">
              <dt className="text-white/55">Extras</dt>
              <dd className="text-white">{eur(service.extras_total)}</dd>
            </div>
          )}
          {service.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-white/55">Desconto</dt>
              <dd className="text-emerald-400">− {eur(service.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-white/10">
            <dt className="text-white font-semibold">Total</dt>
            <dd className="text-white font-display text-lg font-bold">{eur(service.total)}</dd>
          </div>
        </dl>
      </Card>

      {service.notes && (
        <Card className="p-4 mt-4">
          <div className="text-[9px] tracking-[0.25em] text-white/40 uppercase mb-2">Observações</div>
          <p className="text-white/75 text-sm whitespace-pre-wrap leading-relaxed">{service.notes}</p>
        </Card>
      )}
    </>
  );
}
