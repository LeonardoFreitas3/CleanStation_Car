import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Ban, Check } from 'lucide-react';
import {
  BUCKET_CLASS, BUCKET_LABEL, listFollowUps,
} from '../services/dashboard';
import type { FollowUp } from '../services/dashboard';
import { listTemplates, logMessage, renderFollowUp } from '../services/messages';
import type { MessageTemplate } from '../services/messages';
import { daysAgo, eur, whatsappNumber } from '../lib/format';
import { Alert, Card, PageTitle, Spinner } from '../components/ui';

/**
 * Usado enquanto nao houver modelos na base de dados — antes da 0020 ter
 * corrido, ou se alguem os desativar todos. Sem isto, a pagina ficava sem
 * mensagem nenhuma e o botao do WhatsApp abria vazio.
 */
const TEXTO_RESERVA = 'Olá {{nome}}! Já passou algum tempo desde a última visita à Clean Station Car. Quer agendar?';

const WINDOWS = [
  { value: 30, label: '30+ dias' },
  { value: 60, label: '60+ dias' },
  { value: 90, label: '90+ dias' },
  { value: 120, label: '120+ dias' },
];

/** Dias desde a data, ou null. O daysAgo pede dias, o registo guarda datas. */
function diasDesde(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export default function FollowUps() {
  const [minDays, setMinDays] = useState(30);
  const [rows, setRows] = useState<FollowUp[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    listFollowUps(minDays)
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar.'))
      .finally(() => setLoading(false));
  }, [minDays]);

  useEffect(() => { load(); }, [load]);

  // So os de reativacao: os outros falam de um servico em curso, que aqui nao
  // existe. Falhar a carregar nao pode partir a lista — fica-se com o texto de
  // reserva.
  useEffect(() => {
    listTemplates()
      .then((all) => {
        const followUp = all.filter((t) => t.category === 'follow_up');
        setTemplates(followUp);
        setTemplateId((id) => id || followUp[0]?.id || '');
      })
      .catch(() => setTemplates([]));
  }, []);

  /**
   * Regista a mensagem no momento em que se abre o WhatsApp.
   *
   * Nao prova que o cliente a recebeu — o WhatsApp abre noutra aplicacao e nao
   * ha retorno. Prova que foi preparada, por quem e quando, que e o que faz
   * falta para nao se ligar duas vezes a mesma pessoa. Marcada como marketing:
   * reativar nao e executar um servico, e o RGPD trata-as de forma diferente.
   *
   * O link abre na mesma se isto falhar: nao se estraga um contacto por causa
   * de uma linha de registo.
   */
  const registar = async (f: FollowUp, content: string) => {
    try {
      await logMessage({
        clientId: f.id,
        content,
        templateId: templateId || null,
        isMarketing: true,
      });
      setRows((rs) => rs.map((r) => (
        r.id === f.id ? { ...r, last_contacted_at: new Date().toISOString() } : r
      )));
    } catch {
      // Ver acima.
    }
  };

  return (
    <>
      <PageTitle sub={rows.length > 0 ? `${rows.length} ${rows.length === 1 ? 'cliente' : 'clientes'}` : undefined}>
        Follow-ups
      </PageTitle>

      <div className="flex gap-2 mb-6 flex-wrap">
        {WINDOWS.map((w) => (
          <button
            key={w.value}
            onClick={() => setMinDays(w.value)}
            className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-semibold border rounded-sm transition ${
              minDays === w.value
                ? 'bg-blue-950/40 border-blue-600 text-blue-300'
                : 'border-white/15 text-white/50 hover:text-white hover:border-white/30'
            }`}
          >
            {w.label}
          </button>
        ))}

        {/* Ao lado das janelas: escolher a quem se liga e escolher o que se diz
            sao a mesma decisao. Escondido quando so ha um modelo — nao ha
            escolha nenhuma a fazer. */}
        {templates.length > 1 && (
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            aria-label="Modelo de mensagem"
            className="bg-black/60 border border-white/15 focus:border-blue-500 outline-none px-3 py-2 text-[11px] tracking-[0.15em] uppercase font-semibold text-white/70 rounded-sm transition"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      <p className="text-white/40 text-xs mb-6 leading-relaxed">
        Só aparecem clientes que já passaram o seu próprio ritmo habitual. Quem costuma vir de
        60 em 60 dias não é listado aos 30.
      </p>

      {error && <div className="mb-6"><Alert tone="error">{error}</Alert></div>}
      {loading && <div className="py-20 flex justify-center"><Spinner size={26} /></div>}

      {!loading && !error && rows.length === 0 && (
        <div className="border border-dashed border-white/15 rounded-md p-10 text-center">
          <p className="text-white/60 text-sm">Nenhum cliente a contactar nesta janela.</p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((f) => {
            const wa = whatsappNumber(f.phone);
            const template = templates.find((t) => t.id === templateId);
            const message = renderFollowUp(template?.content ?? TEXTO_RESERVA, {
              name: f.name,
              lastServiceName: f.last_service_name,
              daysSinceLastVisit: f.days_since_last_visit,
            });

            return (
              <Card key={f.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/crm/clientes/${f.id}`} className="text-white font-semibold hover:text-blue-400 transition">
                      {f.name}
                    </Link>
                    <div className="text-white/45 text-xs mt-1 truncate">
                      {f.last_service_name ?? 'Sem serviços'} · {daysAgo(f.days_since_last_visit)}
                    </div>
                    <div className="text-white/30 text-xs mt-1">
                      {f.visit_count} {f.visit_count === 1 ? 'visita' : 'visitas'} · {eur(f.total_spent)}
                      {f.avg_days_between_visits && ` · costuma vir a cada ${f.avg_days_between_visits} dias`}
                    </div>
                  </div>

                  <span className={`shrink-0 px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm ${BUCKET_CLASS[f.bucket]}`}>
                    {BUCKET_LABEL[f.bucket]}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
                  {/* Reativar um cliente e marketing, nao execucao de servico.
                      Sem consentimento, o RGPD nao permite — e o botao nao
                      aparece, em vez de aparecer e falhar. */}
                  {!f.marketing_consent ? (
                    <span className="inline-flex items-center gap-2 text-white/35 text-xs">
                      <Ban className="w-3.5 h-3.5" /> Sem consentimento de marketing
                    </span>
                  ) : wa ? (
                    <a
                      href={`https://wa.me/${wa}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => registar(f, message)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] tracking-[0.18em] uppercase font-bold rounded-sm transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  ) : (
                    <span className="text-white/35 text-xs">Sem telefone registado</span>
                  )}

                  {/* Quem ja levou mensagem fica marcado, e a lista poe-no
                      depois de quem ainda nao levou. Nao desaparece: um
                      contacto de ha tres meses volta a fazer sentido. */}
                  {f.last_contacted_at && (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400/70 text-xs">
                      <Check className="w-3.5 h-3.5" />
                      Contactado {daysAgo(diasDesde(f.last_contacted_at)).toLowerCase()}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
