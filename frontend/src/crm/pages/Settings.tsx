import { useCallback, useEffect, useState } from 'react';
import { Check, Info, Save } from 'lucide-react';
import {
  CATEGORY_LABEL, VEHICLE_PRICE_KEYS, listAllServiceTypes, updateServiceType,
} from '../services/serviceTypes';
import { getSettings, updateSettings } from '../services/settings';
import { setVipThresholds } from '../services/clients';
import { eur } from '../lib/format';
import { Alert, Button, Card, Field, PageTitle, Spinner } from '../components/ui';
import type { ServiceType } from '../types';

/** Campo de preço vazio = "este veículo não faz este serviço", não zero. */
const priceValue = (v: number | undefined) => (v === undefined ? '' : String(v));

export default function Settings() {
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const [totalSpent, setTotalSpent] = useState('');
  const [serviceCount, setServiceCount] = useState('');
  const [savingVip, setSavingVip] = useState(false);

  // Edições por linha, só as que o utilizador tocou. Guardar tudo de uma vez
  // escrevia por cima de alterações de outra pessoa que nem sequer vi.
  const [draft, setDraft] = useState<Record<string, { base_price: string; prices: Record<string, string> }>>({});
  const [savingType, setSavingType] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, settings] = await Promise.all([listAllServiceTypes(), getSettings()]);
      setTypes(list);
      setTotalSpent(String(Number(settings.vip_total_spent)));
      setServiceCount(String(Number(settings.vip_service_count)));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar as definições.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
      await updateSettings({ vip_total_spent: spent, vip_service_count: count });
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

  const editing = (t: ServiceType) => draft[t.id] ?? {
    base_price: String(Number(t.base_price)),
    prices: Object.fromEntries(
      VEHICLE_PRICE_KEYS.map(({ key }) => [key, priceValue(t.prices?.[key])]),
    ),
  };

  const patchDraft = (t: ServiceType, patch: Partial<{ base_price: string; prices: Record<string, string> }>) =>
    setDraft((d) => ({ ...d, [t.id]: { ...editing(t), ...patch } }));

  const saveType = async (t: ServiceType) => {
    const row = editing(t);
    const base = Number(row.base_price);
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
      await updateServiceType(t.id, { base_price: base, prices });
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

      <h2 className="text-white text-sm font-semibold mb-1">Catálogo de preços</h2>
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
                    <div className="min-w-0">
                      <span className="text-white text-sm font-semibold">{t.name}</span>
                      {!t.active && (
                        <span className="ml-2 px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm bg-red-950/30 text-red-300/80 border-red-900/40">
                          Inativo
                        </span>
                      )}
                      <div className="text-white/30 text-xs mt-1">
                        Atual: {eur(t.base_price)}
                        {Object.keys(t.prices ?? {}).length > 0 && ' · preço por veículo'}
                      </div>
                    </div>
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
