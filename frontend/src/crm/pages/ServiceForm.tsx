import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Search, Check } from 'lucide-react';
import { useDebounced } from '../hooks/useDebounced';
import { listClients } from '../services/clients';
import { listVehiclesByClient } from '../services/vehicles';
import { listServiceTypes, CATEGORY_LABEL } from '../services/serviceTypes';
import { createService } from '../services/services';
import { useAuth } from '../contexts/AuthContext';
import { eur } from '../lib/format';
import {
  Alert, Button, Card, Field, PageTitle, Select, Spinner, TextArea,
} from '../components/ui';
import type { ClientOverview, ServiceType, Vehicle } from '../types';

export default function ServiceForm() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [params] = useSearchParams();

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
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [extraSlugs, setExtraSlugs] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listServiceTypes()
      .then(setCatalogue)
      .catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar o catálogo.'))
      .finally(() => setLoadingCatalogue(false));
  }, []);

  // Cliente pre-selecionado quando se chega a partir da ficha dele
  useEffect(() => {
    const preset = params.get('cliente');
    if (!preset) return;
    listClients({ query: '', pageSize: 100 })
      .then((r) => {
        const found = r.rows.find((c) => c.id === preset);
        if (found) setClient(found);
      })
      .catch(() => { /* segue sem pre-seleccao */ });
  }, [params]);

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
    if (t) setPrice(String(t.base_price));
  };

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
    try {
      const created = await createService({
        client_id: client.id,
        vehicle_id: vehicleId || null,
        employee_id: profile?.id ?? null,
        service_type_id: type.id,
        service_name: type.name,
        price: Number(price) || 0,
        extras: selectedExtras.map((x) => ({ slug: x.slug, name: x.name, price: Number(x.base_price) })),
        extras_total: extrasTotal,
        discount: Number(discount) || 0,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        notes: notes.trim() || null,
      });
      navigate(`/crm/servicos/${created.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o serviço.');
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

      <PageTitle>Novo serviço</PageTitle>

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
              <button
                type="button"
                onClick={() => { setClient(null); setClientSearch(''); }}
                className="text-white/45 hover:text-blue-400 text-xs uppercase tracking-[0.15em] shrink-0 transition"
              >
                Trocar
              </button>
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

          <div className="space-y-4">
            {Object.entries(grouped).map(([category, types]) => (
              <div key={category}>
                <div className="text-white/35 text-[10px] tracking-[0.2em] uppercase mb-2">
                  {CATEGORY_LABEL[category] ?? category}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {types.map((t) => (
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
                      <div className="text-blue-400/80 text-xs mt-1 font-semibold">{eur(t.base_price)}</div>
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

          <Field
            label="Data e hora agendada"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />

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
            <Save className="w-4 h-4" /> Criar serviço
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </form>
    </>
  );
}
