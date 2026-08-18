import { useEffect, useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { listTemplates, logMessage, renderTemplate } from '../services/messages';
import type { MessageTemplate } from '../services/messages';
import { whatsappNumber } from '../lib/format';
import { Alert, Button, Spinner } from './ui';
import type { ServiceWithRelations } from '../types';

/**
 * Escolher mensagem pre-definida e abrir o WhatsApp com o texto preenchido.
 *
 * Sem API oficial do WhatsApp Business: usa-se o wa.me, que abre a aplicacao
 * com destinatario e texto prontos. O envio e sempre um ato humano. Nada de
 * automatizar o WhatsApp Web, que alem de fragil viola os termos do servico.
 *
 * O registo em message_logs acontece ao abrir; se a pessoa depois nao carregar
 * em enviar, fica registado na mesma. Preferivel ao contrario — para o RGPD
 * importa mais nao falhar um registo do que ter um a mais.
 */
export function MessageSender({
  service, onClose,
}: { service: ServiceWithRelations; onClose: () => void }) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selected, setSelected] = useState<MessageTemplate | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listTemplates()
      .then(setTemplates)
      .catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar as mensagens.'))
      .finally(() => setLoading(false));
  }, []);

  const pick = (t: MessageTemplate) => {
    setSelected(t);
    setText(renderTemplate(t.content, service));
  };

  const send = async () => {
    const number = whatsappNumber(service.client?.phone);
    if (!number || !service.client) return;

    try {
      await logMessage({
        clientId: service.client.id,
        serviceId: service.id,
        templateId: selected?.id ?? null,
        content: text,
        isMarketing: false,
      });
    } catch {
      // Falhar o registo nao deve impedir falar com o cliente.
    }

    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank', 'noreferrer');
    onClose();
  };

  const number = whatsappNumber(service.client?.phone);

  return (
    <div className="fixed inset-0 z-[80] bg-black/85 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-zinc-900 border border-white/10 rounded-t-lg sm:rounded-md max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-white/80">
            Enviar mensagem
          </span>
          <button onClick={onClose} aria-label="Fechar" className="text-white/45 hover:text-white transition p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading && <div className="py-6 flex justify-center"><Spinner /></div>}
          {error && <Alert tone="error">{error}</Alert>}

          {!number && (
            <Alert tone="error">Este cliente não tem telefone registado.</Alert>
          )}

          {!loading && templates.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => pick(t)}
                  className={`text-left px-3 py-2.5 border rounded-sm text-xs transition ${
                    selected?.id === t.id
                      ? 'bg-blue-950/40 border-blue-600 text-white'
                      : 'border-white/12 text-white/70 hover:border-white/25'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}

          <div>
            <label htmlFor="msg" className="block text-[10px] tracking-[0.28em] text-white/50 mb-2 uppercase">
              Mensagem
            </label>
            <textarea
              id="msg"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Escolha uma mensagem acima ou escreva à mão…"
              className="w-full bg-black/60 border border-white/15 focus:border-blue-500 outline-none px-4 py-3 text-white text-sm rounded-sm resize-y placeholder:text-white/25"
            />
            <p className="text-white/35 text-xs mt-2">
              Pode editar antes de enviar. Abre o WhatsApp com o texto preenchido — o envio é sempre seu.
            </p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/10">
          <Button
            variant="whatsapp"
            size="lg"
            onClick={send}
            disabled={!text.trim() || !number}
            className="w-full"
          >
            <Send className="w-4 h-4" /> Abrir WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MessageButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="whatsapp" size="lg" onClick={onClick} className="w-full">
      <MessageCircle className="w-4 h-4" /> Mensagem
    </Button>
  );
}
