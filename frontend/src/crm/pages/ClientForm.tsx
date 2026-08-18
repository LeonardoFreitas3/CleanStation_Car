import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { createClient, getClient, updateClient } from '../services/clients';
import type { ClientInput } from '../services/clients';
import {
  Alert, Button, Card, Checkbox, Field, PageTitle, Select, Spinner, TextArea,
} from '../components/ui';
import type { ClientType } from '../types';

const TYPES: Array<{ value: ClientType; label: string }> = [
  { value: 'particular', label: 'Particular' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'stand', label: 'Stand' },
];

const EMPTY: ClientInput = {
  name: '',
  phone: '',
  email: '',
  client_type: 'particular',
  notes: '',
  data_consent: false,
  marketing_consent: false,
};

export default function ClientForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<ClientInput>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!id) return;
    getClient(id)
      .then((c) => {
        if (!c) { setError('Cliente não encontrado.'); return; }
        setForm({
          name: c.name,
          phone: c.phone ?? '',
          email: c.email ?? '',
          client_type: c.client_type,
          notes: c.notes ?? '',
          data_consent: c.data_consent,
          marketing_consent: c.marketing_consent,
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar o cliente.'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = useCallback(<K extends keyof ClientInput>(key: K, value: ClientInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  // Validacao na fronteira: o RLS protege o acesso, nao a qualidade dos dados.
  // Um cliente sem forma de contacto e inutil para follow-ups.
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.name?.trim()) errors.name = 'O nome é obrigatório.';
    if (!form.phone?.trim() && !form.email?.trim()) {
      errors.phone = 'Indique pelo menos um contacto, telefone ou email.';
    }
    if (form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Email inválido.';
    }
    if (form.marketing_consent && !form.data_consent) {
      errors.data_consent = 'Sem consentimento de dados não pode haver consentimento de marketing.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setSaving(true);
    try {
      // Strings vazias viram null: '' num campo de email estraga a pesquisa
      // e nao e o mesmo que "nao tenho email".
      const payload: ClientInput = {
        ...form,
        name: form.name.trim(),
        phone: form.phone?.trim() || undefined,
        email: form.email?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      };

      const saved = isEdit && id ? await updateClient(id, payload) : await createClient(payload);
      navigate(`/crm/clientes/${saved.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível guardar.');
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Spinner size={26} /></div>;

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-white/45 hover:text-blue-400 text-xs tracking-[0.15em] uppercase mb-4 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <PageTitle>{isEdit ? 'Editar cliente' : 'Novo cliente'}</PageTitle>

      <form onSubmit={submit} className="max-w-2xl">
        <Card className="p-5 md:p-6 space-y-5">
          <Field
            label="Nome *"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={fieldErrors.name}
            placeholder="Nome do cliente"
            autoFocus={!isEdit}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Telefone"
              type="tel"
              value={form.phone ?? ''}
              onChange={(e) => set('phone', e.target.value)}
              error={fieldErrors.phone}
              placeholder="+351 …"
            />
            <Field
              label="Email"
              type="email"
              value={form.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
              error={fieldErrors.email}
              placeholder="email@exemplo.pt"
            />
          </div>

          <Select
            label="Tipo de cliente"
            value={form.client_type}
            onChange={(e) => set('client_type', e.target.value as ClientType)}
            options={TYPES}
          />

          <TextArea
            label="Observações"
            value={form.notes ?? ''}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Notas internas sobre o cliente"
          />
        </Card>

        <Card className="p-5 md:p-6 mt-5 space-y-4">
          <div className="text-[10px] tracking-[0.28em] text-white/50 uppercase">Consentimentos (RGPD)</div>

          <Checkbox
            label="Consentimento para tratamento de dados"
            hint="Necessário para guardar os dados pessoais deste cliente. A data do consentimento é registada automaticamente."
            checked={form.data_consent ?? false}
            onChange={(e) => set('data_consent', e.target.checked)}
          />
          {fieldErrors.data_consent && <p className="text-red-400 text-xs">{fieldErrors.data_consent}</p>}

          <Checkbox
            label="Consentimento para marketing"
            hint="Sem isto, o cliente não recebe campanhas nem promoções — só mensagens necessárias à execução do serviço."
            checked={form.marketing_consent ?? false}
            onChange={(e) => set('marketing_consent', e.target.checked)}
          />
        </Card>

        {error && <div className="mt-5"><Alert tone="error">{error}</Alert></div>}

        <div className="flex gap-3 mt-6">
          <Button type="submit" size="lg" loading={saving}>
            <Save className="w-4 h-4" /> {isEdit ? 'Guardar alterações' : 'Criar cliente'}
          </Button>
          <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)} disabled={saving}>
            Cancelar
          </Button>
        </div>
      </form>
    </>
  );
}
