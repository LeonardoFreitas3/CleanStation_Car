import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Search, Check } from 'lucide-react';
import { useDebounced } from '../hooks/useDebounced';
import { getClient, listClients } from '../services/clients';
import { listVehiclesByClient } from '../services/vehicles';
import { listServiceTypes, CATEGORY_LABEL } from '../services/serviceTypes';
import { createService, getService, updateService } from '../services/services';
import { listAssignable } from '../services/team';
import type { Assignable } from '../services/team';
import { useAuth } from '../contexts/AuthContext';
import { eur } from '../lib/format';
import {
  Alert, Button, Card, Field, PageTitle, Select, Spinner, TextArea,
} from '../components/ui';
import type { ClientOverview, ServiceType, Vehicle } from '../types';

// Meia hora a dia inteiro. São as durações reais da oficina; um campo livre em
// minutos dava margem para enganos que se pagam com marcações em cima.
const DURATION_OPTIONS = [30, 60, 90, 120, 180, 240, 360, 480, 660].map((m) => ({
  value: String(m),
  label: m >= 660 ? 'Dia inteiro' : m % 60 === 0 ? `${m / 60}h` : `${Math.floor(m / 60)}h30`,
}));

/** Duas horas é a lavagem comum. Igual ao valor por omissão da Edge Function. */
const DEFAULT_DURATION = 120;

/** Portes com preco proprio. Alinhado com a tabela do site publico. */
const SIZES = [
  { id: 'carro',  label: 'Carro / Carrinha' },
  { id: 'grande', label: 'Carrinha Grande' },
  { id: 'suv',    label: 'SUV / Monovolume' },
  { id: 'mota',   label: 'Mota' },
];

/**
 * Preco de um servico para um porte.
 *
 * Nem todo o servico varia com o veiculo: ceramica e polimentos tem preco
 * unico e chegam com prices vazio. Nesses, e sempre base_price.
 */
function priceOf(type: ServiceType, size: string): number {
  const byVehicle = type.prices?.[size];
  return byVehicle !== undefined ? byVehicle : type.base_price;
}

export default function ServiceForm() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [params] = useSearchParams();
  const { id: serviceId } = useParams<{ id: string }>();
  const isEdit = Boolean(serviceId);

  const [catalogue, setCatalogue] = useState<{ services: ServiceType[]; extras: ServiceType[] }>({
    services: [], extras: [],
  });
  const [loadingCatalogue, setLoadingCatalogue] = useState(true);

  // Cliente
  const [clientSearch, setClientSearch] = useState('');
  const [clientResults, setClientResults] = useState<ClientOverview[]>([]);
  const [client, setClient] = useState<ClientOverview | null>(null);
  const debouncedSearch = useDebounced(clientSearch);

  // Viatura
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState('');

  // Servico
  const [typeId, setTypeId] = useState('');
  const [vehicleSize, setVehicleSize] = useState('carro');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [extraSlugs, setExtraSlugs] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(DEFAULT_DURATION);
  // Vazio = por atribuir. Ao criar, arranca em quem esta a registar, que e
  // quase sempre quem vai fazer o trabalho.
  const [employeeId, setEmployeeId] = useState('');
  const [team, setTeam] = useState<Assignable[]>([]);
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listServiceTypes()
      .then(setCatalogue)
      .catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar o catálogo.'))
      .finally(() => setLoadingCatalogue(false));
  }, []);

  // Falhar a lista da equipa não impede registar o serviço: fica por atribuir,
  // que é recuperável, ao contrário de perder o que já está preenchido.
  useEffect(() => { listAssignable().then(setTeam).catch(() => setTeam([])); }, []);

  // Num serviço novo, quem regista é quase sempre quem o vai fazer. Só se
  // aplica enquanto ninguém tiver escolhido, para não desfazer a escolha se o
  // perfil chegar depois.
  useEffect(() => {
    if (!isEdit && profile) setEmployeeId((cur) => cur || profile.id);
  }, [isEdit, profile]);

  // Cliente pre-selecionado quando se chega a partir da ficha dele
  useEffect(() => {
    const preset = params.get('cliente');
    if (!preset || isEdit) return;
    getClient(preset)
      .then((c) => { if (c) setClient(c); })
      .catch(() => { /* segue sem pre-seleccao */ });
  }, [params, isEdit]);

  // Data pre-preenchida quando se chega a partir de um dia da agenda. Vem no
  // formato do datetime-local (YYYY-MM-DDTHH:mm), que e o que o campo aceita.
  useEffect(() => {
    const preset = params.get('agendar');
    if (!preset || isEdit) return;
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(preset)) setScheduledAt(preset);
  }, [params, isEdit]);

  // Em edicao, carrega o servico existente. O cliente nao muda: trocar o dono
  // de um servico ja registado corrompia o historico e a faturacao dele.
  useEffect(() => {
    if (!serviceId) return;
    (async () => {
      try {
        const s = await getService(serviceId);
        if (!s) { setError('Serviço não encontrado.'); return; }
        const c = await getClient(s.client_id);
        if (c) setClient(c);
        setVehicleId(s.vehicle_id ?? '');
        setTypeId(s.service_type_id ?? '');
        setPrice(String(s.price));
        setDiscount(String(s.discount));
        setExtraSlugs(s.extras.map((x) => x.slug));
        setNotes(s.notes ?? '');
        setEmployeeId(s.employee_id ?? '');
        if (s.scheduled_at) {
          // datetime-local nao aceita ISO com fuso: precisa de YYYY-MM-DDTHH:mm
          // em hora local.
          const d = new Date(s.scheduled_at);
          const pad = (n: number) => String(n).padStart(2, '0');
          setScheduledAt(
            `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`,
          );
          // Serviços anteriores à 0013 não têm duração: mostram o valor por
          // omissão, que é o mesmo que a Edge Function lhes assume.
          setDurationMinutes(s.duration_minutes ?? DEFAULT_DURATION);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Não foi possível carregar o serviço.');
      }
    })();
  }, [serviceId]);

  useEffect(() => {
    if (!debouncedSearch.trim() || client) { setClientResults([]); return; }
    listClients({ query: debouncedSearch, pageSize: 8 })
      .then((r) => setClientResults(r.rows))
      .catch(() => setClientResults([]));
  }, [debouncedSearch, client]);

  useEffect(() => {
    if (!client) { setVehicles([]); setVehicleId(''); return; }
    listVehiclesByClient(client.id)
      .then((v) => {
        setVehicles(v);
        // Com uma so viatura nao ha escolha a fazer: poupa um toque.
        if (v.length === 1) setVehicleId(v[0].id);
      })
      .catch(() => setVehicles([]));
  }, [client]);

  // Escolher o serviço preenche o preço com o do catálogo, mas deixa editar:
  // o valor final depende do estado da viatura.
  const selectType = (id: string) => {
    setTypeId(id);
    const t = catalogue.services.find((s) => s.id === id);
    if (t) setPrice(String(priceOf(t, vehicleSize)));
  };

  // Trocar o porte com um serviço já escolhido reajusta o preço.
  const selectSize = (size: string) => {
    setVehicleSize(size);
    const t = catalogue.services.find((s) => s.id === typeId);
    if (t) setPrice(String(priceOf(t, size)));
  };

  const selectedType = catalogue.services.find((s) => s.id === typeId);

  const selectedExtras = useMemo(
    () => catalogue.extras.filter((x) => extraSlugs.includes(x.slug)),
    [catalogue.extras, extraSlugs],
  );

  const extrasTotal = useMemo(
    () => selectedExtras.reduce((sum, x) => sum + Number(x.base_price), 0),
    [selectedExtras],
  );

  const total = Math.max(0, (Number(price) || 0) + extrasTotal - (Number(discount) || 0));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!client) { setError('Escolha um cliente.'); return; }
    if (!typeId) { setError('Escolha um serviço.'); return; }

    const type = catalogue.services.find((s) => s.id === typeId);
    if (!type) { setError('Serviço inválido.'); return; }

    setSaving(true);
    const payload = {
      vehicle_id: vehicleId || null,
      service_type_id: type.id,
      service_name: type.name,
      price: Number(price) || 0,
      extras: selectedExtras.map((x) => ({ slug: x.slug, name: x.name, price: Number(x.base_price) })),
      extras_total: extrasTotal,
      discount: Number(discount) || 0,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      // Sem hora marcada não ocupa nada, e uma duração solta só confundia.
      duration_minutes: scheduledAt ? durationMinutes : null,
      employee_id: employeeId || null,
      notes: notes.trim() || null,
    };

    try {
      if (isEdit && serviceId) {
        await updateService(serviceId, payload);
        navigate(`/crm/servicos/${serviceId}`, { replace: true });
      } else {
        // employee_id ja vem no payload, escolhido no formulario. Antes era
        // sempre quem estava a registar, e nao havia forma de dar o trabalho a
        // outra pessoa.
        const created = await createService({ ...payload, client_id: client.id });
        navigate(`/crm/servicos/${created.id}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível guardar o serviço.');
      setSaving(false);
    }
  };

  if (loadingCatalogue) return <div className="py-20 flex justify-center"><Spinner size={26} /></div>;

  const grouped = catalogue.services.reduce<Record<string, ServiceType[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-white/45 hover:text-blue-400 text-xs tracking-[0.15em] uppercase mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <PageTitle>{isEdit ? 'Editar serviço' : 'Novo serviço'}</PageTitle>

      <form onSubmit={submit} className="max-w-2xl space-y-5">
        {/* 1. Cliente */}
        <Card className="p-5">
          <div className="text-[10px] tracking-[0.28em] text-white/50 uppercase mb-3">Cliente</div>

          {client ? (
            <div className="flex items-center justify-between gap-3 bg-blue-950/25 border border-blue-800/40 rounded-sm px-4 py-3">
              <div className="min-w-0">
                <div className="text-white font-semibold truncate">{client.name}</div>
                <div className="text-white/45 text-xs">{client.phone || client.email || 'Sem contacto'}</div>
              </div>
              {/* Em edicao o cliente e fixo: mudar o dono de um servico ja
                  registado corrompia o historico e a faturacao dele. */}
              {!isEdit && (
                <button
                  type="button"
                  onClick={() => { setClient(null); setClientSearch(''); }}
                  className="text-white/45 hover:text-blue-400 text-xs uppercase tracking-[0.15em] shrink-0 transition"
                >
                  Trocar
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Nome, telefone ou matrícula…"
                  aria-label="Pesquisar cliente"
                  className="w-full bg-black/60 border border-white/15 focus:border-blue-500 outline-none pl-10 pr-4 py-3 text-sm text-white rounded-sm placeholder:text-white/25"
                />
              </div>

              {clientResults.length > 0 && (
                <ul className="mt-2 border border-white/10 rounded-sm divide-y divide-white/8 max-h-60 overflow-y-auto">
                  {clientResults.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => { setClient(c); setClientResults([]); }}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition"
                      >
                        <div className="text-white text-sm">{c.name}</div>
                        <div className="text-white/40 text-xs">{c.phone || c.email || '—'}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {debouncedSearch.trim() && clientResults.length === 0 && (
                <p className="text-white/40 text-xs mt-3">
                  Nenhum cliente encontrado.{' '}
                  <button type="button" onClick={() => navigate('/crm/clientes/novo')} className="text-blue-400 hover:text-blue-300">
                    Criar novo
                  </button>
                </p>
              )}
            </>
          )}
        </Card>

        {/* 2. Viatura */}
        {client && (
          <Card className="p-5">
            <div className="text-[10px] tracking-[0.28em] text-white/50 uppercase mb-3">Viatura</div>
            {vehicles.length === 0 ? (
              <p className="text-white/45 text-sm">
                Este cliente não tem viaturas.{' '}
                <button
                  type="button"
                  onClick={() => navigate(`/crm/clientes/${client.id}/viaturas/nova`)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Adicionar
                </button>
              </p>
            ) : (
              <Select
                label="Escolher viatura"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                options={[
                  { value: '', label: '— sem viatura —' },
                  ...vehicles.map((v) => ({
                    value: v.id,
                    label: `${v.plate}${v.make ? ` · ${v.make} ${v.model ?? ''}`.trimEnd() : ''}`,
                  })),
                ]}
              />
            )}
          </Card>
        )}

        {/* 3. Servico */}
        <Card className="p-5">
          <div className="text-[10px] tracking-[0.28em] text-white/50 uppercase mb-3">Serviço</div>

          {/* Porte da viatura: as lavagens custam mais numa Sprinter que num
              citadino. Serviços de preço único ignoram isto. */}
          <div className="flex gap-2 flex-wrap mb-5">
            {SIZES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSize(s.id)}
                className={`px-3 py-2 text-[11px] tracking-[0.12em] uppercase font-semibold border rounded-sm transition ${
                  vehicleSize === s.id
                    ? 'bg-blue-950/40 border-blue-600 text-blue-300'
                    : 'border-white/15 text-white/50 hover:text-white hover:border-white/30'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {selectedType && Object.keys(selectedType.prices ?? {}).length === 0 && (
            <p className="text-white/35 text-xs mb-4">
              Este serviço tem preço único, independente do porte da viatura.
            </p>
          )}

          <div className="space-y-4">
            {Object.entries(grouped).map(([category, types]) => (
              <div key={category}>
                <div className="text-white/35 text-[10px] tracking-[0.2em] uppercase mb-2">
                  {CATEGORY_LABEL[category] ?? category}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {types
                    .filter((t) => {
                      const p = t.prices ?? {};
                      // Um nivel sem preco para este porte nao se vende:
                      // motas nao levam lavagem detalhada.
                      return Object.keys(p).length === 0 || p[vehicleSize] !== undefined;
                    })
                    .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => selectType(t.id)}
                      className={`text-left px-3 py-2.5 border rounded-sm transition ${
                        typeId === t.id
                          ? 'bg-blue-950/40 border-blue-600'
                          : 'border-white/12 hover:border-white/25'
                      }`}
                    >
                      <div className="text-white text-xs leading-snug">{t.name}</div>
                      <div className="text-blue-400/80 text-xs mt-1 font-semibold">{eur(priceOf(t, vehicleSize))}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 4. Extras */}
        {catalogue.extras.length > 0 && (
          <Card className="p-5">
            <div className="text-[10px] tracking-[0.28em] text-white/50 uppercase mb-3">Extras</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {catalogue.extras.map((x) => {
                const on = extraSlugs.includes(x.slug);
                return (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => setExtraSlugs((s) => (on ? s.filter((v) => v !== x.slug) : [...s, x.slug]))}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 border rounded-sm transition ${
                      on ? 'bg-blue-950/40 border-blue-600' : 'border-white/12 hover:border-white/25'
                    }`}
                  >
                    <span className="text-white text-xs text-left leading-snug">{x.name}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-blue-400/80 text-xs font-semibold">{eur(x.base_price)}</span>
                      {on && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* 5. Valores e agendamento */}
        <Card className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <Field
              label="Preço base (€)"
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
            />
            <Field
              label="Desconto (€)"
              type="number"
              min={0}
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Só o admin distribui trabalho. Para os outros o campo nem aparece:
              o trigger services_protect_assignment poe o employee_id a null na
              criacao e reverte-o na edicao, portanto mostrar a escolha era
              deixar escolher uma coisa que nao ia ser guardada. */}
          {profile?.role === 'admin' && (
            <Select
              label="Funcionário"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              options={[
                { value: '', label: '— por atribuir —' },
                ...team.map((t) => ({ value: t.id, label: t.full_name || '(sem nome)' })),
              ]}
            />
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Data e hora agendada"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <Select
              label="Duração"
              value={String(durationMinutes)}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              options={DURATION_OPTIONS}
              // Só conta se houver hora marcada: sem data, nada ocupa a oficina.
              disabled={!scheduledAt}
            />
          </div>
          {scheduledAt && (
            <p className="text-white/35 text-xs -mt-2">
              Estas horas deixam de aparecer nas marcações do site.
            </p>
          )}

          <TextArea
            label="Observações"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Estado da viatura, pedidos do cliente…"
          />

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <span className="text-white/55 text-sm">Total estimado</span>
            <span className="text-white font-display text-2xl font-bold">{eur(total)}</span>
          </div>
        </Card>

        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex gap-3">
          <Button type="submit" size="lg" loading={saving}>
            <Save className="w-4 h-4" /> {isEdit ? 'Guardar alterações' : 'Criar serviço'}
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </form>
    </>
  );
}
