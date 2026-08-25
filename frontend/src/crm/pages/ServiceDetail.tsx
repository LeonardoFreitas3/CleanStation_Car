import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Car, MessageCircle, Ban, Calendar, Pencil,
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
import { listAssignable } from '../services/team';
import type { Assignable } from '../services/team';
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
  const [team, setTeam] = useState<Assignable[]>([]);
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

  // Falhar a lista nao pode esconder a ficha: fica so sem trocar o funcionario.
  useEffect(() => { listAssignable().then(setTeam).catch(() => setTeam([])); }, []);

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

  // Atribuir sem ter de abrir o formulario de edicao: e o que se faz de pe na
  // oficina, quando alguem pega no trabalho ou se troca a quem estava.
  const assign = async (employeeId: string | null) => {
    if (!service) return;
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await getSupabase()
        .from('services')
        .update({ employee_id: employeeId })
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
            {/* Editável aqui mesmo, mas só para o admin: distribuir trabalho é
                decisão de quem manda, e o trigger services_protect_assignment
                reverte a alteração de qualquer outra pessoa. Mostrar a caixa a
                quem não pode usá-la era prometer o que não se cumpre. */}
            {profile?.role === 'admin' ? (
              <select
                value={service.employee_id ?? ''}
                onChange={(e) => assign(e.target.value || null)}
                disabled={busy}
                aria-label="Funcionário atribuído"
                className="w-full bg-black/60 border border-white/15 focus:border-blue-500 outline-none mt-1 px-2 py-1.5 text-white text-sm rounded-sm transition disabled:opacity-50"
              >
                <option value="">— por atribuir —</option>
                {team.map((t) => (
                  <option key={t.id} value={t.id}>{t.full_name || '(sem nome)'}</option>
                ))}
              </select>
            ) : (
              <div className="text-white text-sm mt-1 truncate">
                {service.employee?.full_name || '— por atribuir —'}
              </div>
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
