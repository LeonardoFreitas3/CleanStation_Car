import { useCallback, useEffect, useState } from 'react';
import { Check, Info, Save, Plus, X, Eye, EyeOff } from 'lucide-react';
import {
  CATEGORY_LABEL, VEHICLE_PRICE_KEYS, createServiceType, listAllServiceTypes, updateServiceType,
} from '../services/serviceTypes';
import { getSettings, updateSettings } from '../services/settings';
import { setVipThresholds } from '../services/clients';
import { setHorario } from '../services/agenda';
import { eur } from '../lib/format';
import { Alert, Button, Card, Field, PageTitle, Select, Spinner } from '../components/ui';
import type { ServiceType } from '../types';

interface Draft {
  name: string;
  base_price: string;
  prices: Record<string, string>;
}

/** Campo de preço vazio = "este veículo não faz este serviço", não zero. */
const priceValue = (v: number | undefined) => (v === undefined ? '' : String(v));

export default function Settings() {
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [opens, setOpens] = useState('9');
  const [closes, setCloses] = useState('20');
  const [savingHorario, setSavingHorario] = useState(false);

  const [totalSpent, setTotalSpent] = useState('');
  const [serviceCount, setServiceCount] = useState('');
  const [savingVip, setSavingVip] = useState(false);

  // Edições por linha, só as que o utilizador tocou. Guardar tudo de uma vez
  // escrevia por cima de alterações de outra pessoa que nem sequer vi.
  const [draft, setDraft] = useState<Record<string, Draft>>({});
  const [savingType, setSavingType] = useState<string | null>(null);

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('lavagens');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    try {
      const [list, settings] = await Promise.all([listAllServiceTypes(), getSettings()]);
      setTypes(list);
      setTotalSpent(String(Number(settings.vip_total_spent)));
      setServiceCount(String(Number(settings.vip_service_count)));
      setOpens(String(Number(settings.opens_hour)));
      setCloses(String(Number(settings.closes_hour)));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar as definições.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    const abre = Number(opens);
    const fecha = Number(closes);

    // A base de dados tambem recusa, mas dizer aqui poupa a ida e volta e da
    // uma frase em portugues em vez de um erro de constraint.
    if (!Number.isInteger(abre) || !Number.isInteger(fecha) || !(fecha > abre)) {
      setError('O horário tem de ser em horas inteiras, e fechar depois de abrir.');
      return;
    }

    setSavingHorario(true);
    setError(null);
    try {
      await updateSettings({
        vip_total_spent: Number(totalSpent),
        vip_service_count: Number(serviceCount),
        opens_hour: abre,
        closes_hour: fecha,
      });
      // Aplica ja na sessao em curso, como os limiares: sem isto a ocupacao da
      // agenda so mudava ao voltar a entrar.
      setHorario(abre, fecha);
      setSaved('horario');
      setTimeout(() => setSaved(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível guardar o horário.');
    } finally {
      setSavingHorario(false);
    }
  };

  const saveVip = async (e: React.FormEvent) => {
    e.preventDefault();
    const spent = Number(totalSpent);
    const count = Number(serviceCount);

    if (!(spent >= 0) || !(count >= 1)) {
      setError('Os limiares têm de ser números: valor gasto a partir de 0, visitas a partir de 1.');
      return;
    }

    setSavingVip(true);
    setError(null);
    try {
      await updateSettings({
        vip_total_spent: spent,
        vip_service_count: count,
        opens_hour: Number(opens),
        closes_hour: Number(closes),
      });
      // Aplica já na sessão em curso: sem isto as etiquetas de VIP só mudavam
      // ao voltar a entrar, e parecia que não tinha guardado.
      setVipThresholds(spent, count);
      setSaved('vip');
      setTimeout(() => setSaved(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível guardar os limiares.');
    } finally {
      setSavingVip(false);
    }
  };

  const editing = (t: ServiceType): Draft => draft[t.id] ?? {
    name: t.name,
    base_price: String(Number(t.base_price)),
    prices: Object.fromEntries(
      VEHICLE_PRICE_KEYS.map(({ key }) => [key, priceValue(t.prices?.[key])]),
    ),
  };

  const patchDraft = (t: ServiceType, patch: Partial<Draft>) =>
    setDraft((d) => ({ ...d, [t.id]: { ...editing(t), ...patch } }));

  const addType = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(newPrice);
    if (!newName.trim()) { setError('O serviço tem de ter nome.'); return; }
    if (!(price >= 0)) { setError('Preço base inválido.'); return; }

    setAdding(true);
    setError(null);
    try {
      await createServiceType({ name: newName.trim(), category: newCategory, base_price: price });
      setNewOpen(false);
      setNewName('');
      setNewPrice('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o serviço.');
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (t: ServiceType) => {
    setSavingType(t.id);
    setError(null);
    try {
      await updateServiceType(t.id, { active: !t.active });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar o serviço.');
    } finally {
      setSavingType(null);
    }
  };

  const saveType = async (t: ServiceType) => {
    const row = editing(t);
    const base = Number(row.base_price);
    const name = row.name.trim();
    if (!name) { setError('O serviço tem de ter nome.'); return; }
    if (!(base >= 0)) { setError(`Preço base inválido em "${t.name}".`); return; }

    // Campo vazio sai do mapa: é assim que o site distingue "não disponível"
    // de "grátis". Ver o comentário da coluna prices na migração 0010.
    const prices: Record<string, number> = {};
    for (const { key } of VEHICLE_PRICE_KEYS) {
      const raw = row.prices[key]?.trim();
      if (!raw) continue;
      const n = Number(raw);
      if (!(n >= 0)) { setError(`Preço inválido em "${t.name}".`); return; }
      prices[key] = n;
    }

    setSavingType(t.id);
    setError(null);
    try {
      await updateServiceType(t.id, { name, base_price: base, prices });
      setDraft((d) => { const { [t.id]: _drop, ...rest } = d; return rest; });
      setSaved(t.id);
      setTimeout(() => setSaved(null), 2500);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível guardar o preço.');
    } finally {
      setSavingType(null);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><Spinner size={26} /></div>;

  const categories = [...new Set(types.map((t) => t.category))];

  return (
    <>
      <PageTitle sub="Limiares e catálogo de preços">Definições</PageTitle>

      {error && <div className="mb-6"><Alert tone="error">{error}</Alert></div>}

      <Card className="p-4 mb-8">
        <h2 className="text-white text-sm font-semibold mb-1">Cliente VIP</h2>
        <p className="text-white/40 text-xs mb-4">
          Um cliente fica VIP quando chega a qualquer um dos dois. A etiqueta aparece nas listas e na ficha.
        </p>
        <form onSubmit={saveVip} className="grid sm:grid-cols-3 gap-4 items-end">
          <Field
            label="Total gasto (€)"
            type="number"
            min={0}
            step="1"
            value={totalSpent}
            onChange={(e) => setTotalSpent(e.target.value)}
          />
          <Field
            label="Nº de serviços"
            type="number"
            min={1}
            step="1"
            value={serviceCount}
            onChange={(e) => setServiceCount(e.target.value)}
          />
          <Button type="submit" loading={savingVip}>
            {saved === 'vip' ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved === 'vip' ? 'Guardado' : 'Guardar'}
          </Button>
        </form>
      </Card>

      <Card className="p-5 mt-4">
        <div className="text-[10px] tracking-[0.28em] text-white/50 uppercase mb-2">Horário</div>
        <p className="text-white/45 text-xs mb-5 leading-relaxed">
          Decide as horas que o site oferece a quem marca e a janela que a agenda usa para
          calcular a ocupação. Domingo continua encerrado.
          {' '}
          <strong className="text-white/60">Os textos do site — FAQ, contactos, termos — são
          escritos à mão e não mudam com isto.</strong>
        </p>
        <form onSubmit={saveHorario} className="grid sm:grid-cols-3 gap-4 items-end">
          <Field
            label="Abre às"
            type="number"
            min={0}
            max={23}
            step="1"
            value={opens}
            onChange={(e) => setOpens(e.target.value)}
          />
          <Field
            label="Fecha às"
            type="number"
            min={1}
            max={24}
            step="1"
            value={closes}
            onChange={(e) => setCloses(e.target.value)}
          />
          <Button type="submit" loading={savingHorario}>
            {saved === 'horario' ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved === 'horario' ? 'Guardado' : 'Guardar'}
          </Button>
        </form>
      </Card>

      <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
        <h2 className="text-white text-sm font-semibold">Catálogo de preços</h2>
        <Button onClick={() => setNewOpen((o) => !o)}>
          {newOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {newOpen ? 'Cancelar' : 'Novo serviço'}
        </Button>
      </div>

      {newOpen && (
        <Card className="p-4 my-4">
          <form onSubmit={addType} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <Field
                label="Nome"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Lavagem rápida"
                className="sm:col-span-2"
                required
              />
              <Field
                label="Preço base (€)"
                type="number"
                min={0}
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
              />
            </div>
            <Select
              label="Categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              options={Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label }))}
            />
            <p className="text-white/35 text-xs">
              Fica no fim da categoria e sem preço por tipo de veículo — isso define-se a
              seguir, na linha dele. Categoria <span className="text-white/60">Extras</span> são
              os complementos faturáveis, não serviços principais.
            </p>
            <div className="flex justify-end">
              <Button type="submit" loading={adding}>Criar serviço</Button>
            </div>
          </form>
        </Card>
      )}
      <Card className="p-4 mb-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400/70 mt-0.5 shrink-0" />
        <div className="text-sm text-white/60 leading-relaxed">
          Isto muda os preços <span className="text-white/80">dentro do CRM</span>. Os preços do
          site público e do formulário de marcação vivem no código
          (<span className="text-white/80">booking/pricing.js</span> e{' '}
          <span className="text-white/80">functions/booking/catalogue.ts</span>) e têm de ser
          alterados lá. Serviços já registados mantêm o preço com que foram feitos.
        </div>
      </Card>

      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h3 className="text-white/50 text-[10px] tracking-[0.28em] uppercase mb-3">
            {CATEGORY_LABEL[category] ?? category}
          </h3>

          <div className="space-y-3">
            {types.filter((t) => t.category === category).map((t) => {
              const row = editing(t);
              const dirty = Boolean(draft[t.id]);

              return (
                <Card key={t.id} className={`p-4 ${t.active ? '' : 'opacity-60'}`}>
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {/* O nome editável no próprio sítio: renomear um serviço
                            era das poucas coisas que ainda obrigavam a SQL. O
                            slug não muda com ele, de propósito — é o que o site
                            usa para falar deste serviço. */}
                        <input
                          value={row.name}
                          onChange={(e) => patchDraft(t, { name: e.target.value })}
                          aria-label={`Nome de ${t.name}`}
                          className="flex-1 min-w-0 bg-transparent border-b border-white/10 focus:border-blue-500 outline-none text-white text-sm font-semibold py-1 transition"
                        />
                        {!t.active && (
                          <span className="px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm bg-red-950/30 text-red-300/80 border-red-900/40 shrink-0">
                            Inativo
                          </span>
                        )}
                      </div>
                      <div className="text-white/30 text-xs mt-1">
                        Atual: {eur(t.base_price)}
                        {Object.keys(t.prices ?? {}).length > 0 && ' · preço por veículo'}
                        {' · '}
                        <span className="font-mono text-white/25">{t.slug}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        onClick={() => toggleActive(t)}
                        loading={savingType === t.id}
                        title={t.active
                          ? 'Deixa de aparecer ao registar serviços. O histórico mantém-se.'
                          : 'Volta a aparecer ao registar serviços.'}
                      >
                        {t.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {t.active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        onClick={() => saveType(t)}
                        loading={savingType === t.id}
                        disabled={!dirty}
                        variant={dirty ? 'primary' : 'secondary'}
                      >
                        {saved === t.id ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved === t.id ? 'Guardado' : 'Guardar'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-5 gap-3">
                    <Field
                      label="Base (€)"
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.base_price}
                      onChange={(e) => patchDraft(t, { base_price: e.target.value })}
                    />
                    {VEHICLE_PRICE_KEYS.map(({ key, label }) => (
                      <Field
                        key={key}
                        label={label}
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="—"
                        value={row.prices[key] ?? ''}
                        onChange={(e) => patchDraft(t, { prices: { ...row.prices, [key]: e.target.value } })}
                      />
                    ))}
                  </div>
                  <p className="text-white/25 text-xs mt-2">
                    Campo vazio = este serviço não se faz nesse tipo de veículo.
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
