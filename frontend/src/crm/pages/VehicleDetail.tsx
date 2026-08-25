import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Car, Pencil, Plus, User } from 'lucide-react';
import { getVehicle, formatPlate } from '../services/vehicles';
import {
  SERVICE_STATUS_CLASS, SERVICE_STATUS_LABEL, listServices,
} from '../services/services';
import { getClient } from '../services/clients';
import { date, daysAgo, eur } from '../lib/format';
import { Alert, Button, Card, PageTitle, Spinner } from '../components/ui';
import type { ClientOverview, ServiceWithRelations, Vehicle } from '../types';

/** Especificacoes so aparecem se estiverem preenchidas: uma grelha de tracos
 *  ocupa o ecra a dizer que nao se sabe nada. */
function Spec({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div>
      <div className="text-[9px] tracking-[0.25em] text-white/40 uppercase">{label}</div>
      <div className="text-white text-sm mt-1">{value}</div>
    </div>
  );
}

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [owner, setOwner] = useState<ClientOverview | null>(null);
  const [history, setHistory] = useState<ServiceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const v = await getVehicle(id);
      if (!v) { setError('Viatura não encontrada.'); return; }
      setVehicle(v);

      // O dono e o historico so fazem sentido depois de haver viatura, e
      // pedi-los antes era ir buscar coisas para uma pagina que nao abre.
      const [c, h] = await Promise.all([
        getClient(v.client_id),
        listServices({ filter: 'todos', vehicleId: id, pageSize: 100 }),
      ]);
      setOwner(c);
      setHistory(h.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar a viatura.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="py-20 flex justify-center"><Spinner size={26} /></div>;
  if (error) return <Alert tone="error">{error}</Alert>;
  if (!vehicle) return null;

  // Contas sobre o que este carro deu, nao sobre o cliente: quem tem tres
  // viaturas tem tres historias diferentes, e a ficha do cliente mistura-as.
  const feitos = history.filter((s) => ['concluido', 'entregue'].includes(s.status));
  const gasto = feitos.reduce((t, s) => t + Number(s.total ?? 0), 0);
  const ultimo = feitos.find((s) => s.completed_at) ?? feitos[0];
  const diasDesde = ultimo?.completed_at
    ? Math.floor((Date.now() - new Date(ultimo.completed_at).getTime()) / 86_400_000)
    : null;

  const nome = [vehicle.make, vehicle.model, vehicle.variant].filter(Boolean).join(' ');

  return (
    <>
      <Link
        to={owner ? `/crm/clientes/${owner.id}` : '/crm/clientes'}
        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs mb-6 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> {owner ? owner.name : 'Clientes'}
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageTitle sub={nome || undefined}>{formatPlate(vehicle.plate)}</PageTitle>
        <div className="flex gap-2">
          <Link to={`/crm/clientes/${vehicle.client_id}/viaturas/${vehicle.id}`}>
            <Button variant="secondary"><Pencil className="w-4 h-4" /> Editar</Button>
          </Link>
          <Link to={`/crm/servicos/novo?viatura=${vehicle.id}`}>
            <Button><Plus className="w-4 h-4" /> Novo serviço</Button>
          </Link>
        </div>
      </div>

      <Card className="p-4 mt-6">
        <div className="flex items-start gap-3">
          <Car className="w-5 h-5 text-blue-400/70 mt-0.5 shrink-0" strokeWidth={1.5} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 min-w-0">
            <Spec label="Ano" value={vehicle.year} />
            <Spec label="Cor" value={vehicle.color} />
            <Spec label="Combustível" value={vehicle.fuel_type} />
            <Spec label="Quilómetros" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString('pt-PT')} km` : null} />
          </div>
        </div>

        {vehicle.notes && (
          <p className="text-white/60 text-sm mt-4 pt-4 border-t border-white/10 whitespace-pre-wrap">
            {vehicle.notes}
          </p>
        )}
      </Card>

      {owner && (
        <Link
          to={`/crm/clientes/${owner.id}`}
          className="flex items-center gap-3 mt-3 px-4 py-3 bg-[#0e0e0e] border border-white/10 hover:border-blue-700/60 rounded-md transition"
        >
          <User className="w-4 h-4 text-white/40 shrink-0" />
          <span className="text-white text-sm truncate">{owner.name}</span>
          <span className="text-white/35 text-xs ml-auto shrink-0">{owner.phone}</span>
        </Link>
      )}

      <div className="grid grid-cols-3 gap-3 mt-6">
        <Card className="p-4">
          <div className="text-[9px] tracking-[0.25em] text-white/40 uppercase">Serviços</div>
          <div className="text-white font-display text-2xl font-bold mt-1 tabular-nums">{feitos.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[9px] tracking-[0.25em] text-white/40 uppercase">Faturado</div>
          <div className="text-white font-display text-2xl font-bold mt-1 tabular-nums">{eur(gasto)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[9px] tracking-[0.25em] text-white/40 uppercase">Última vez</div>
          <div className="text-white font-display text-2xl font-bold mt-1">{daysAgo(diasDesde)}</div>
        </Card>
      </div>

      <div className="text-[10px] tracking-[0.28em] text-white/50 uppercase mt-8 mb-4">
        Histórico desta viatura
      </div>

      {history.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-md p-10 text-center">
          <p className="text-white/60 text-sm">Este carro ainda não passou por cá.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((s) => (
            <Link
              key={s.id}
              to={`/crm/servicos/${s.id}`}
              className="flex items-center gap-3 px-4 py-3 bg-[#0e0e0e] border border-white/10 hover:border-blue-700/60 rounded-md transition"
            >
              <span className="text-white/45 text-xs tabular-nums w-24 shrink-0">
                {date(s.completed_at ?? s.scheduled_at ?? s.created_at)}
              </span>
              <span className="text-white text-sm truncate flex-1">{s.service_name}</span>
              <span className={`shrink-0 px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm ${SERVICE_STATUS_CLASS[s.status]}`}>
                {SERVICE_STATUS_LABEL[s.status]}
              </span>
              <span className="text-white/70 text-sm tabular-nums w-20 text-right shrink-0">{eur(s.total)}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
