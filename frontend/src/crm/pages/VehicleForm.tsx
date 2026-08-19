import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import {
  createVehicle, formatPlate, getVehicle, softDeleteVehicle, updateVehicle,
} from '../services/vehicles';
import { useAuth } from '../contexts/AuthContext';
import {
  Alert, Button, Card, Field, PageTitle, Select, Spinner, TextArea,
} from '../components/ui';

const FUELS = [
  { value: '', label: '—' },
  { value: 'gasolina', label: 'Gasolina' },
  { value: 'gasoleo', label: 'Gasóleo' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'eletrico', label: 'Elétrico' },
  { value: 'gpl', label: 'GPL' },
];

export default function VehicleForm() {
  const { id: clientId, vehicleId } = useParams<{ id: string; vehicleId: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isEdit = Boolean(vehicleId);

  const [plate, setPlate] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [fuel, setFuel] = useState('');
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plateError, setPlateError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId) return;
    getVehicle(vehicleId)
      .then((v) => {
        if (!v) { setError('Viatura não encontrada.'); return; }
        setPlate(v.plate);
        setMake(v.make ?? '');
        setModel(v.model ?? '');
        setVariant(v.variant ?? '');
        setYear(v.year ? String(v.year) : '');
        setColor(v.color ?? '');
        setFuel(v.fuel_type ?? '');
        setMileage(v.mileage ? String(v.mileage) : '');
        setNotes(v.notes ?? '');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar.'))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const back = () => navigate(clientId ? `/crm/clientes/${clientId}` : '/crm/clientes');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const clean = plate.replace(/[^A-Za-z0-9]/g, '');
    if (clean.length < 6) { setPlateError('Matrícula incompleta.'); return; }
    setPlateError(null);
    setError(null);
    setSaving(true);

    // Campos numericos vazios vao como undefined, nao NaN: o Postgres rejeita
    // NaN num integer com um erro incompreensivel.
    const payload = {
      plate: formatPlate(plate),
      make: make.trim() || undefined,
      model: model.trim() || undefined,
      variant: variant.trim() || undefined,
      color: color.trim() || undefined,
      fuel_type: fuel || undefined,
      notes: notes.trim() || undefined,
      year: year ? Number(year) : undefined,
      mileage: mileage ? Number(mileage) : undefined,
    };

    try {
      if (isEdit && vehicleId) {
        await updateVehicle(vehicleId, payload);
      } else {
        if (!clientId) throw new Error('Cliente em falta.');
        await createVehicle({ ...payload, client_id: clientId });
      }
      back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível guardar a viatura.');
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!vehicleId) return;
    const ok = window.confirm(
      `Eliminar a viatura ${plate}?\n\n`
      + 'Os serviços já registados mantêm-se no histórico.',
    );
    if (!ok) return;

    setDeleting(true);
    try {
      await softDeleteVehicle(vehicleId);
      back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível eliminar.');
      setDeleting(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Spinner size={26} /></div>;

  return (
    <>
      <button
        onClick={back}
        className="inline-flex items-center gap-2 text-white/45 hover:text-blue-400 text-xs tracking-[0.15em] uppercase mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <PageTitle>{isEdit ? 'Editar viatura' : 'Nova viatura'}</PageTitle>

      <form onSubmit={submit} className="max-w-2xl">
        <Card className="p-5 md:p-6 space-y-5">
          <Field
            label="Matrícula *"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            onBlur={() => plate && setPlate(formatPlate(plate))}
            error={plateError}
            placeholder="12-AB-34"
            autoFocus={!isEdit}
            className="max-w-xs"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="Marca" value={make} onChange={(e) => setMake(e.target.value)} placeholder="BMW" />
            <Field label="Modelo" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Série 3" />
            <Field label="Versão" value={variant} onChange={(e) => setVariant(e.target.value)} placeholder="320d" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <Field label="Ano" type="number" min={1900} max={2100} value={year} onChange={(e) => setYear(e.target.value)} placeholder="2020" />
            <Field label="Cor" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Preto" />
            <Select label="Combustível" value={fuel} onChange={(e) => setFuel(e.target.value)} options={FUELS} />
            <Field label="Km" type="number" min={0} value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="120000" />
          </div>

          <TextArea
            label="Observações"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Riscos conhecidos, cuidados especiais…"
          />
        </Card>

        {error && <div className="mt-5"><Alert tone="error">{error}</Alert></div>}

        <div className="flex gap-3 mt-6 flex-wrap">
          <Button type="submit" size="lg" loading={saving}>
            <Save className="w-4 h-4" /> {isEdit ? 'Guardar alterações' : 'Guardar viatura'}
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={back} disabled={saving}>
            Cancelar
          </Button>
          {isEdit && hasRole('admin', 'manager') && (
            <Button type="button" variant="danger" size="lg" onClick={remove} loading={deleting} className="ml-auto">
              <Trash2 className="w-4 h-4" /> Eliminar
            </Button>
          )}
        </div>
      </form>
    </>
  );
}
