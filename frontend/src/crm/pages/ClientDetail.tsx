import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Plus, MessageCircle, Mail, Phone, Car, Trash2,
} from 'lucide-react';
import {
  CLIENT_STATUS_CLASS, CLIENT_STATUS_LABEL, clientStatus, getClient, softDeleteClient,
} from '../services/clients';
import { listVehiclesByClient } from '../services/vehicles';
import { listServices } from '../services/services';
import { SERVICE_STATUS_CLASS, SERVICE_STATUS_LABEL } from '../services/services';
import { daysAgo, date, eur, whatsappNumber } from '../lib/format';
import { useAuth } from '../contexts/AuthContext';
import { Alert, Button, Card, Spinner } from '../components/ui';
import type { ClientOverview, ServiceWithRelations, Vehicle } from '../types';

type Tab = 'dados' | 'viaturas' | 'historico';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'dados', label: 'Dados' },
  { id: 'viaturas', label: 'Viaturas' },
  { id: 'historico', label: 'Histórico' },
];

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [client, setClient] = useState<ClientOverview | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [history, setHistory] = useState<ServiceWithRelations[]>([]);
  const [tab, setTab] = useState<Tab>('dados');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // Em paralelo: sao tres consultas independentes e encadea-las triplicava
      // o tempo de abertura da ficha.
      const [c, v, h] = await Promise.all([
        getClient(id),
        listVehiclesByClient(id),
        listServices({ filter: 'todos', clientId: id, pageSize: 50 }),
      ]);
      if (!c) { setError('Cliente não encontrado.'); return; }
      setClient(c);
      setVehicles(v);
      setHistory(h.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar a ficha.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!id || !client) return;
    const ok = window.confirm(
      `Tem a certeza que pretende eliminar ${client.name}?\n\n`
      + 'O histórico de serviços associado é preservado, mas o cliente deixa de aparecer nas listagens.',
    );
    if (!ok) return;

    setDeleting(true);
    try {
      await softDeleteClient(id);
      navigate('/crm/clientes', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível eliminar.');
      setDeleting(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Spinner size={26} /></div>;
  if (error && !client) return <Alert tone="error">{error}</Alert>;
  if (!client) return null;

  const status = clientStatus(client);
  const wa = whatsappNumber(client.phone);

  return (
    <>
      <button
        onClick={() => navigate('/crm/clientes')}
        className="inline-flex items-center gap-2 text-white/45 hover:text-blue-400 text-xs tracking-[0.15em] uppercase mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Clientes
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-white text-2xl md:text-3xl font-black tracking-wide">{client.name}</h1>
            <span className={`px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm ${CLIENT_STATUS_CLASS[status]}`}>
              {CLIENT_STATUS_LABEL[status]}
            </span>
          </div>
          <span className="accent-bar-left mt-3 block" />
        </div>

        <div className="flex gap-2 flex-wrap">
          {wa && (
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">
              <Button variant="whatsapp"><MessageCircle className="w-4 h-4" /> WhatsApp</Button>
            </a>
          )}
          <Link to={`/crm/clientes/${client.id}/editar`}>
            <Button variant="secondary"><Pencil className="w-4 h-4" /> Editar</Button>
          </Link>
        </div>
      </div>

      {/* Numeros que importam, sempre visiveis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {[
          { label: 'Visitas', value: String(client.visit_count) },
          { label: 'Total gasto', value: eur(client.total_spent) },
          { label: 'Última visita', value: daysAgo(client.days_since_last_visit) },
          {
            label: 'Intervalo médio',
            value: client.avg_days_between_visits ? `${client.avg_days_between_visits} dias` : '—',
          },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="text-[9px] tracking-[0.25em] text-white/40 uppercase">{s.label}</div>
            <div className="text-white font-display text-lg font-bold mt-1.5">{s.value}</div>
          </Card>
        ))}
      </div>

      {client.avg_days_between_visits && client.days_since_last_visit !== null && (
        <p className="text-white/45 text-xs mt-3">
          Próxima visita sugerida: cerca de {client.avg_days_between_visits} dias após a última
          {client.days_since_last_visit > client.avg_days_between_visits && (
            <span className="text-amber-400"> — já passaram {client.days_since_last_visit}.</span>
          )}
        </p>
      )}

      <div className="flex gap-1 border-b border-white/10 mt-8 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-5 py-3 text-[11px] tracking-[0.18em] uppercase font-semibold border-b-2 transition ${
              tab === t.id ? 'border-blue-500 text-white' : 'border-transparent text-white/45 hover:text-white'
            }`}
          >
            {t.label}
            {t.id === 'viaturas' && vehicles.length > 0 && <span className="text-white/30 ml-1.5">{vehicles.length}</span>}
            {t.id === 'historico' && history.length > 0 && <span className="text-white/30 ml-1.5">{history.length}</span>}
          </button>
        ))}
      </div>

      {error && <div className="mt-5"><Alert tone="error">{error}</Alert></div>}

      <div className="mt-6">
        {tab === 'dados' && (
          <Card className="p-5 md:p-6 max-w-2xl">
            <dl className="space-y-4 text-sm">
              {[
                { k: 'Telefone', v: client.phone, icon: Phone, href: client.phone ? `tel:${client.phone}` : null },
                { k: 'Email', v: client.email, icon: Mail, href: client.email ? `mailto:${client.email}` : null },
              ].map(({ k, v, icon: Icon, href }) => (
                <div key={k} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-blue-400/70 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-[9px] tracking-[0.25em] text-white/40 uppercase">{k}</dt>
                    <dd className="text-white mt-0.5">
                      {v ? (href ? <a href={href} className="hover:text-blue-400 transition">{v}</a> : v) : '—'}
                    </dd>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-white/10">
                <dt className="text-[9px] tracking-[0.25em] text-white/40 uppercase">Tipo</dt>
                <dd className="text-white mt-0.5 capitalize">{client.client_type}</dd>
              </div>

              <div>
                <dt className="text-[9px] tracking-[0.25em] text-white/40 uppercase">Cliente desde</dt>
                <dd className="text-white mt-0.5">{date(client.created_at)}</dd>
              </div>

              {client.notes && (
                <div className="pt-4 border-t border-white/10">
                  <dt className="text-[9px] tracking-[0.25em] text-white/40 uppercase">Observações</dt>
                  <dd className="text-white/75 mt-1.5 whitespace-pre-wrap leading-relaxed">{client.notes}</dd>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 space-y-2">
                <dt className="text-[9px] tracking-[0.25em] text-white/40 uppercase">Consentimentos</dt>
                <dd className="flex flex-col gap-1.5 mt-1.5">
                  <span className={client.data_consent ? 'text-emerald-400' : 'text-white/40'}>
                    {client.data_consent ? '✓' : '✕'} Tratamento de dados
                  </span>
                  <span className={client.marketing_consent ? 'text-emerald-400' : 'text-white/40'}>
                    {client.marketing_consent ? '✓' : '✕'} Marketing
                  </span>
                </dd>
                {!client.marketing_consent && (
                  <p className="text-white/35 text-xs pt-1">
                    Não enviar campanhas nem promoções a este cliente.
                  </p>
                )}
              </div>
            </dl>

            {hasRole('admin') && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <Button variant="danger" onClick={handleDelete} loading={deleting}>
                  <Trash2 className="w-4 h-4" /> Eliminar cliente
                </Button>
              </div>
            )}
          </Card>
        )}

        {tab === 'viaturas' && (
          <>
            <div className="flex justify-end mb-4">
              <Link to={`/crm/clientes/${client.id}/viaturas/nova`}>
                <Button><Plus className="w-4 h-4" /> Nova viatura</Button>
              </Link>
            </div>

            {vehicles.length === 0 ? (
              <div className="border border-dashed border-white/15 rounded-md p-10 text-center">
                <p className="text-white/60 text-sm">Este cliente ainda não tem viaturas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicles.map((v) => (
                  <Card key={v.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Car className="w-5 h-5 text-blue-400/70 mt-0.5 shrink-0" strokeWidth={1.5} />
                      <div className="min-w-0">
                        <div className="text-white font-display font-bold tracking-wider">{v.plate}</div>
                        <div className="text-white/60 text-sm mt-0.5 truncate">
                          {[v.make, v.model, v.variant].filter(Boolean).join(' ') || 'Sem marca indicada'}
                        </div>
                        <div className="text-white/35 text-xs mt-1">
                          {[v.year, v.color, v.fuel_type].filter(Boolean).join(' · ') || '—'}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'historico' && (
          history.length === 0 ? (
            <div className="border border-dashed border-white/15 rounded-md p-10 text-center">
              <p className="text-white/60 text-sm">Ainda não há serviços para este cliente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((s) => (
                <Link
                  key={s.id}
                  to={`/crm/servicos/${s.id}`}
                  className="block bg-[#0e0e0e] border border-white/10 hover:border-blue-700/60 transition rounded-md p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white/30 text-xs font-mono">#{s.reference}</span>
                        <span className={`px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm ${SERVICE_STATUS_CLASS[s.status]}`}>
                          {SERVICE_STATUS_LABEL[s.status]}
                        </span>
                      </div>
                      <div className="text-white font-semibold mt-2">{s.service_name}</div>
                      <div className="text-white/45 text-xs mt-1">
                        {date(s.completed_at ?? s.scheduled_at ?? s.created_at)}
                        {s.vehicle && ` · ${s.vehicle.plate}`}
                        {s.employee && ` · ${s.employee.full_name}`}
                      </div>
                    </div>
                    <div className="text-white font-display text-lg font-bold shrink-0">{eur(s.total)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
}
