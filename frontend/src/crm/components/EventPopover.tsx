import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Clock, MessageCircle, Trash2, User, X } from 'lucide-react';
import { SERVICE_STATUS_CLASS, SERVICE_STATUS_LABEL } from '../services/services';
import { duracao, eur } from '../lib/format';
import type { Item } from './WeekCalendar';

const HORA = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' });
const DIA = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: '2-digit', month: 'long' });

const LARGURA = 288;
const MARGEM = 8;

/**
 * O balão que se abre ao carregar num bloco da agenda.
 *
 * A pergunta que se faz a olhar para um bloco é "o que é isto, e de quem" — e
 * até aqui a única resposta era sair da agenda e abrir a ficha, ou abrir logo
 * as mensagens, que é um passo à frente da pergunta.
 *
 * Fica ao lado do bloco e não no meio do ecrã de propósito: a agenda à volta
 * continua a ver-se, que é metade do que se quer saber ao carregar num dia
 * cheio. Só passa para o meio quando não há espaço de lado nenhum.
 */
export function EventPopover({
  item, rect, onFechar, onMensagens, onApagar,
}: {
  item: Item;
  /** Onde estava o bloco quando se carregou nele. */
  rect: DOMRect;
  onFechar: () => void;
  /** Só para serviços: as mensagens pré-definidas. */
  onMensagens: () => void;
  /** Só para folgas e eventos do Google. Quem confirma é quem recebe. */
  onApagar: () => void;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: -9999, top: -9999 });

  // Posicionado depois de existir, para se poder medir: a altura depende do que
  // o bloco tem para dizer, e um balao com metade de fora do ecra e pior do que
  // nenhum. useLayoutEffect e nao useEffect — assim nao chega a ver-se no sitio
  // errado antes de saltar para o certo.
  useLayoutEffect(() => {
    const altura = caixa.current?.offsetHeight ?? 220;
    const { innerWidth: W, innerHeight: H } = window;

    // A direita do bloco; se nao couber, a esquerda; se nao couber de lado
    // nenhum — um telemovel —, centrado.
    let left = rect.right + MARGEM;
    if (left + LARGURA > W - MARGEM) left = rect.left - LARGURA - MARGEM;
    if (left < MARGEM) left = Math.max(MARGEM, (W - LARGURA) / 2);

    const top = Math.min(Math.max(MARGEM, rect.top), H - altura - MARGEM);
    setPos({ left, top });
  }, [rect]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar(); };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [onFechar]);

  const s = item.servico;
  const inicio = new Date(item.startIso);
  const fim = new Date(item.endIso);

  return (
    <>
      {/* Fecha ao carregar fora. Transparente: nao escurece a agenda, que e
          justamente o que se quer continuar a ver. */}
      <button
        type="button"
        aria-label="Fechar"
        onClick={onFechar}
        className="fixed inset-0 z-40 cursor-default"
      />

      <div
        ref={caixa}
        role="dialog"
        aria-label={item.titulo}
        style={{ left: pos.left, top: pos.top, width: LARGURA }}
        className="fixed z-50 bg-[#101010] border border-white/15 rounded-md shadow-2xl shadow-black/60 p-4"
      >
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="absolute top-2 right-2 text-white/30 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-white text-sm font-semibold pr-6 leading-tight">{item.titulo}</h3>

        {s && (
          <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] tracking-[0.12em] uppercase font-semibold border rounded-sm ${SERVICE_STATUS_CLASS[s.status]}`}>
            {SERVICE_STATUS_LABEL[s.status]}
          </span>
        )}

        <div className="mt-3 space-y-1.5 text-xs text-white/60">
          <p className="flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 mt-0.5 text-blue-400/60 shrink-0" aria-hidden="true" />
            <span>
              <span className="capitalize">{DIA.format(inicio)}</span>
              <br />
              <span className="text-white/80 tabular-nums">
                {HORA.format(inicio)}–{HORA.format(fim)}
              </span>
              {s?.duration_minutes && (
                <span className="text-white/35">{` · ${duracao(s.duration_minutes)}`}</span>
              )}
            </span>
          </p>

          {s?.client && (
            <p className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-blue-400/60 shrink-0" aria-hidden="true" />
              <Link
                to={`/crm/clientes/${s.client.id}`}
                className="text-white/75 hover:text-blue-300 transition truncate"
              >
                {s.client.name}
              </Link>
            </p>
          )}

          {s?.vehicle && (
            <p className="flex items-center gap-2">
              <Car className="w-3.5 h-3.5 text-blue-400/60 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {s.vehicle.plate}
                {s.vehicle.make && <span className="text-white/40">{` · ${s.vehicle.make} ${s.vehicle.model ?? ''}`}</span>}
              </span>
            </p>
          )}

          {/* O detalhe do bloco quando nao e um servico: o motivo da folga, ou o
              que o evento diz no Google. Sem isto o balao de uma folga ficava
              com o titulo e mais nada. */}
          {!s && item.detalhe && <p className="text-white/50">{item.detalhe}</p>}
        </div>

        {/* Uma folga ou um evento do Google so tem um caminho: sair da agenda.
            Nao ha ficha para abrir nem cliente a quem escrever. */}
        {!s && item.origem && (
          <button
            type="button"
            onClick={onApagar}
            className="w-full inline-flex items-center justify-center gap-1.5 mt-3 px-3 py-2 text-[11px] tracking-[0.12em] uppercase font-semibold border border-red-900/50 text-red-300/80 hover:border-red-700 hover:text-red-300 rounded-sm transition"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            {item.origem.tipo === 'folga' ? 'Apagar folga' : 'Apagar do Google'}
          </button>
        )}

        {s && (
          <>
            <div className="flex items-baseline justify-between mt-3 pt-3 border-t border-white/10">
              <span className="text-white/35 text-[10px] tracking-[0.15em] uppercase">Total</span>
              <span className="text-white font-display text-lg font-bold tabular-nums">{eur(s.total)}</span>
            </div>

            {/* Dois caminhos e nao um menu: ver a ficha, ou mandar a mensagem da
                fase. Sao as duas unicas coisas que se fazem a partir da agenda. */}
            <div className="flex gap-2 mt-3">
              <Link
                to={`/crm/servicos/${s.id}`}
                className="flex-1 text-center px-3 py-2 text-[11px] tracking-[0.12em] uppercase font-semibold border border-white/15 text-white/70 hover:text-white hover:border-white/30 rounded-sm transition"
              >
                Abrir ficha
              </Link>
              <button
                type="button"
                onClick={onMensagens}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] tracking-[0.12em] uppercase font-semibold bg-blue-950/40 border border-blue-700/60 text-blue-300 hover:border-blue-500 rounded-sm transition"
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                Mensagem
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
