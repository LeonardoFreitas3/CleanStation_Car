import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { createVehicle, formatPlate } from '../services/vehicles';
import { Alert, Button, Card, Field, PageTitle, Select } from '../components/ui';

const FUELS = [
  { value: '', label: '—' },
  { value: 'gasolina', label: 'Gasolina' },
  { value: 'gasoleo', label: 'Gasóleo' },
  { value: 'hibrido', label: 'Híbrido' },
  { value: 'eletrico', label: 'Elétrico' },
  { value: 'gpl', label: 'GPL' },
];

export default function VehicleForm() {
  const { id: clientId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [plate, setPlate] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [fuel, setFuel] = useState('');
  const [mileage, setMileage] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plateError, setPlateError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    const clean = plate.replace(/[^A-Za-z0-9]/g, '');
    if (clean.length < 6) {
      setPlateError('Matrícula incompleta.');
      return;
    }
    setPlateError(null);
    setError(null);
    setSaving(true);

    try {
      await createVehicle({
        client_id: clientId,
        plate: formatPlate(plate),
        make: make.trim() || undefined,
        model: model.trim() || undefined,
        color: color.trim() || undefined,
        fuel_type: fuel || undefined,
        // Campos numericos vazios tem de ir como undefined, nao NaN: o
        // Postgres rejeita NaN num integer e o erro seria incompreensivel.
        year: year ? Number(year) : undefined,
        mileage: mileage ? Number(mileage) : undefined,
      });
      navigate(`/crm/clientes/${clientId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível guardar a viatura.');
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-white/45 hover:text-blue-400 text-xs tracking-[0.15em] uppercase mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <PageTitle>Nova viatura</PageTitle>

      <form onSubmit={submit} className="max-w-2xl">
        <Card className="p-5 md:p-6 space-y-5">
          <Field
            label="Matrícula *"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            onBlur={() => plate && setPlate(formatPlate(plate))}
            error={plateError}
            placeholder="12-AB-34"
            autoFocus
            className="max-w-xs"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Marca" value={make} onChange={(e) => setMake(e.target.value)} placeholder="BMW" />
            <Field label="Modelo" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Série 3" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <Field label="Ano" type="number" min={1900} max={2100} value={year} onChange={(e) => setYear(e.target.value)} placeholder="2020" />
            <Field label="Cor" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Preto" />
            <Select label="Combustível" value={fuel} onChange={(e) => setFuel(e.target.value)} options={FUELS} />
            <Field label="Km" type="number" min={0} value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="120000" />
          </div>
        </Card>

        {error && <div className="mt-5"><Alert tone="error">{error}</Alert></div>}

        <div className="flex gap-3 mt-6">
          <Button type="submit" size="lg" loading={saving}>
            <Save className="w-4 h-4" /> Guardar viatura
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </form>
    </>
  );
}
