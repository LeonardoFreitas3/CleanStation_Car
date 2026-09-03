import { dayKey, isEncerrado } from '../services/agenda';
import type { Week } from '../services/agenda';
import type { ServiceWithRelations } from '../types';
import { itensDoDia } from './WeekCalendar';
import type { Item } from './WeekCalendar';
import { X } from 'lucide-react';

const DIA_CURTO = new Intl.DateTimeFormat('pt-PT', { weekday: 'short' });
const HORA = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' });

/**
 * O mes inteiro numa grelha, como o calendario do telemovel.
 *
 * Ao contrario da semana, esta vista serve em qualquer largura: sete colunas de
 * dias cabem num telemovel, sete colunas de horas nao. Por isso nao ha aqui a
 * dobra `lg:` que a semana tem — o que muda com o ecra e so quantas linhas de
 * cada dia se mostram antes do "+N".
 *
 * Nao ha horas na grelha: um mes com blocos proporcionais dava tiras de dois
 * pixeis. Quem quer ver a hora carrega no dia, ou passa a semana.
 */
export function MonthCalendar({
  week, mes, onServico, onDia, onApagar,
}: {
  week: Week;
  /** O mes que se esta a ver (0-11): os dias de fora ficam esbatidos. */
  mes: number;
  onServico: (s: ServiceWithRelations) => void;
  onDia: (d: Date) => void;
  /** Apagar uma folga ou um evento do Google. Quem confirma é quem recebe. */
  onApagar: (item: Item) => void;
}) {
  const hoje = dayKey(new Date());

  return (
    <div className="border border-white/10 rounded-md overflow-hidden">
      <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02]">
        {week.days.slice(0, 7).map((d) => (
          <div key={dayKey(d)} className="px-1 py-1.5 text-center text-[9px] tracking-[0.15em] uppercase text-white/40">
            {DIA_CURTO.format(d).replace('.', '')}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {week.days.map((d) => {
          const key = dayKey(d);
          const eHoje = key === hoje;
          const foraDoMes = d.getMonth() !== mes;
          const itens = itensDoDia(week, d);
          // Tres cabem em qualquer telemovel sem cortar a linha seguinte. O
          // resto conta-se no "+N", que e o que o Google tambem faz.
          const visiveis = itens.slice(0, 3);

          return (
            <div
              key={key}
              className={`relative min-h-[4.5rem] sm:min-h-[6rem] border-b border-l border-white/10 p-1 ${
                foraDoMes ? 'opacity-35' : isEncerrado(d) ? 'bg-white/[0.02]' : ''
              }`}
            >
              {/* A celula inteira marca, e nao so o numero. Um alvo de 24 pixeis
                  num dedo e uma adivinha: carregava-se no dia, nao acontecia
                  nada, e parecia que a vista de mes nao deixava marcar.

                  Fica por baixo (sem z) das etiquetas, que tem z-10: carregar
                  num servico abre as mensagens, carregar no vazio a volta marca.
                  Fora da ordem de tabulacao, como na semana — o caminho pelo
                  teclado e o numero do dia. */}
              <button
                type="button"
                tabIndex={-1}
                onClick={() => onDia(d)}
                aria-label={`Marcar serviço em ${key}`}
                className="absolute inset-0 hover:bg-blue-500/5 transition"
              />

              <button
                type="button"
                onClick={() => onDia(d)}
                aria-label={`Marcar serviço em ${key}`}
                className={`relative z-10 w-6 h-6 mb-0.5 rounded-full text-[11px] tabular-nums transition ${
                  eHoje ? 'bg-blue-600 text-white font-semibold' : 'text-white/60 hover:bg-white/10'
                }`}
              >
                {d.getDate()}
              </button>

              {visiveis.map((i) => {
                const conteudo = (
                  <span className="block truncate">
                    {i.servico && (
                      <span className="text-white/50 tabular-nums mr-1">{HORA.format(new Date(i.startIso))}</span>
                    )}
                    {i.titulo}
                  </span>
                );
                const caixa = `relative z-10 w-full text-left text-[10px] leading-tight px-1 py-0.5 mb-0.5 border rounded-sm ${i.classe}`;
                const dica = `${HORA.format(new Date(i.startIso))} · ${i.titulo}${i.detalhe ? ` · ${i.detalhe}` : ''}`;

                return i.servico ? (
                  <button key={i.key} type="button" onClick={() => onServico(i.servico!)} className={caixa} title={`${dica} — mensagens`}>
                    {conteudo}
                  </button>
                ) : (
                  <div key={i.key} className={`${caixa} flex items-center gap-1`} title={dica}>
                    {conteudo}
                    {i.origem && (
                      <button
                        type="button"
                        onClick={() => onApagar(i)}
                        aria-label={`Apagar ${i.titulo}`}
                        className="shrink-0 text-white/30 hover:text-red-400 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {itens.length > visiveis.length && (
                <span className="relative z-10 block text-[10px] text-white/40 px-1 pointer-events-none">
                  {`+${itens.length - visiveis.length}`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
