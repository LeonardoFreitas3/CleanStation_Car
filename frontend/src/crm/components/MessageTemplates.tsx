import { useCallback, useEffect, useState } from 'react';
import { Check, Eye, EyeOff, Save } from 'lucide-react';
import {
  MESSAGE_CATEGORY_LABEL, listAllTemplates, unknownVars, updateTemplate, varsForCategory,
  type MessageTemplate,
} from '../services/messages';
import { SERVICE_FLOW, SERVICE_STATUS_LABEL } from '../services/services';
import type { ServiceStatus } from '../types';
import { Alert, Button, Card, Field, Select, Spinner, TextArea } from './ui';

/**
 * Fases que podem disparar uma mensagem.
 *
 * O 'agendado' fica de fora: ainda nao aconteceu nada ao carro, e o cliente ja
 * recebeu o email de confirmacao quando marcou.
 */
const FASES = SERVICE_FLOW.filter((f) => f !== 'agendado');

/**
 * As mensagens editaveis no proprio ecra.
 *
 * A 0020 tirou os textos de reativacao do codigo com este argumento: mudar a
 * mensagem obrigava a recompilar e publicar o site. Mas sem sitio nenhum para
 * as escrever, o que aconteceu foi trocar o codigo pelo SQL Editor — que para
 * quem manda na oficina e igualmente inacessivel. Isto fecha a promessa.
 *
 * Nao ha criar nem apagar: os modelos nascem nas migracoes, onde o slug e a
 * categoria sao decisoes de codigo. O que se muda aqui e o texto, o nome e se
 * aparece — que e o que muda mesmo, e o que obrigava a abrir o SQL.
 */
export default function MessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, { name: string; content: string }>>({});

  const load = useCallback(async () => {
    try {
      setTemplates(await listAllTemplates());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar as mensagens.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const editing = (t: MessageTemplate) => draft[t.id] ?? { name: t.name, content: t.content };

  const patchDraft = (t: MessageTemplate, patch: Partial<{ name: string; content: string }>) =>
    setDraft((d) => ({ ...d, [t.id]: { ...editing(t), ...patch } }));

  const save = async (t: MessageTemplate) => {
    const row = editing(t);
    const name = row.name.trim();
    const content = row.content.trim();

    if (!name) { setError('A mensagem tem de ter nome.'); return; }
    if (!content) { setError(`A mensagem "${t.name}" ficou vazia.`); return; }

    // Recusado e nao avisado: uma variavel que aquela categoria nao preenche
    // desaparece do texto no envio, levando com ela a frase a que pertencia.
    // Guardar assim era escolher que o erro so aparecesse ao cliente.
    const desconhecidas = unknownVars(content, t.category);
    if (desconhecidas.length) {
      setError(
        `"${t.name}" usa ${desconhecidas.map((v) => `{{${v}}}`).join(', ')}, que esta mensagem `
        + `não sabe preencher. Disponíveis: ${varsForCategory(t.category).map((v) => `{{${v}}}`).join(', ')}.`,
      );
      return;
    }

    setSaving(t.id);
    setError(null);
    try {
      await updateTemplate(t.id, { name, content });
      setDraft((d) => { const { [t.id]: _drop, ...rest } = d; return rest; });
      setSaved(t.id);
      setTimeout(() => setSaved(null), 2500);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível guardar a mensagem.');
    } finally {
      setSaving(null);
    }
  };

  /**
   * Liga (ou desliga) o envio automatico numa fase.
   *
   * Guarda logo, sem passar pelo rascunho: e uma escolha de uma caixa, nao um
   * texto a meio de ser escrito, e obrigar a carregar em Guardar a seguir era
   * so uma maneira de a pessoa pensar que ja tinha ficado.
   */
  const setAuto = async (t: MessageTemplate, valor: string) => {
    setSaving(t.id);
    setError(null);
    try {
      await updateTemplate(t.id, { auto_status: (valor || null) as ServiceStatus | null });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível guardar a fase.');
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (t: MessageTemplate) => {
    setSaving(t.id);
    setError(null);
    try {
      await updateTemplate(t.id, { active: !t.active });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível alterar a mensagem.');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="py-10 flex justify-center"><Spinner size={22} /></div>;

  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <>
      <h2 className="text-white text-sm font-semibold mb-1">Mensagens</h2>
      <p className="text-white/40 text-xs mb-4">
        O texto que sai ao cliente pelo WhatsApp, na ficha do serviço e na lista de reativação.
        Guardar aqui muda a próxima mensagem enviada — não é preciso publicar nada.
      </p>

      {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}

      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h3 className="text-white/50 text-[10px] tracking-[0.28em] uppercase mb-3">
            {MESSAGE_CATEGORY_LABEL[category] ?? category}
          </h3>

          <div className="space-y-3">
            {templates.filter((t) => t.category === category).map((t) => {
              const row = editing(t);
              const dirty = Boolean(draft[t.id]);

              return (
                <Card key={t.id} className={`p-4 ${t.active ? '' : 'opacity-60'}`}>
                  <div className="flex items-end justify-between gap-3 mb-3 flex-wrap">
                    <Field
                      label="Nome"
                      value={row.name}
                      onChange={(e) => patchDraft(t, { name: e.target.value })}
                      className="flex-1 min-w-[180px]"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        onClick={() => toggleActive(t)}
                        loading={saving === t.id}
                        title={t.active
                          ? 'Deixa de aparecer na lista de mensagens. O histórico mantém-se.'
                          : 'Volta a aparecer na lista de mensagens.'}
                      >
                        {t.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {t.active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        onClick={() => save(t)}
                        loading={saving === t.id}
                        disabled={!dirty}
                        variant={dirty ? 'primary' : 'secondary'}
                      >
                        {saved === t.id ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saved === t.id ? 'Guardado' : 'Guardar'}
                      </Button>
                    </div>
                  </div>

                  <TextArea
                    label="Texto"
                    rows={4}
                    value={row.content}
                    onChange={(e) => patchDraft(t, { content: e.target.value })}
                  />

                  {/* A categoria follow_up nao entra: a lista de reativacao e
                      por cliente e nao tem servico nenhum a mudar de fase. */}
                  {t.category !== 'follow_up' && (
                    <div className="mt-4 pt-4 border-t border-white/5 grid sm:grid-cols-5 gap-3 items-end">
                      <Select
                        label="Enviar sozinha quando o serviço passar a"
                        value={t.auto_status ?? ''}
                        disabled={saving === t.id}
                        onChange={(e) => setAuto(t, e.target.value)}
                        className="sm:col-span-2"
                        options={[
                          { value: '', label: '— nunca, só à mão —' },
                          // Quem ja usa cada fase vai no proprio rotulo. Quem
                          // recusa e o indice unico da 0028; isto so evita que
                          // se escolha as cegas uma fase ja ocupada.
                          ...FASES.map((f) => {
                            const dona = templates.find((o) => o.id !== t.id && o.auto_status === f);
                            return {
                              value: f,
                              label: dona
                                ? `${SERVICE_STATUS_LABEL[f]} — já usada por "${dona.name}"`
                                : SERVICE_STATUS_LABEL[f],
                            };
                          }),
                        ]}
                      />
                      <p className="sm:col-span-3 text-white/25 text-xs leading-relaxed">
                        O cliente recebe esta mensagem assim que o funcionário avançar o serviço
                        para essa fase. Uma fase só pode ter um modelo.{' '}
                        <span className="text-white/45">Vazio = nunca sai sozinha.</span>
                      </p>
                    </div>
                  )}

                  <p className="text-white/25 text-xs mt-2">
                    Variáveis:{' '}
                    <span className="font-mono text-white/45">
                      {varsForCategory(t.category).map((v) => `{{${v}}}`).join(' ')}
                    </span>
                    {' · '}
                    <span className="font-mono text-white/25">{t.slug}</span>
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
