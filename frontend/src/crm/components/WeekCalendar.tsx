import {
  CLOSES, DURACAO_OMISSAO, OPENS, dayKey, isEncerrado, posicaoNoDia,
} from '../services/agenda';
import type { Week } from '../services/agenda';
import type { ServiceWithRelations } from '../types';

const DIA_CURTO = new Intl.DateTimeFormat('pt-PT', { weekday: 'short' });
const HORA = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' });

/**
 * A semana desenhada como calendário.
 *
 * A lista por dias continua a existir e é o que se vê no telemóvel: sete
 * colunas de horas num ecrã de 375px não se lêem. Não é uma opção que alguém
 * tenha de escolher — é o mesmo dado com dois desenhos, e quem decide é a
 * largura do ecrã.
 *
 * As horas vêm do OPENS/CLOSES, que vêm das Definições. Se a oficina mudar de
 * horário, a grelha muda com ela.
 */

/** O que se desenha numa coluna, venha de onde vier. */
interface Item {
  key: string;
  titulo: string;
  detalhe: string;
  startIso: string;
  endIso: string;
  /** So os servicos. As folgas e o que vem do Google nao tem ficha ca. */
  servico?: ServiceWithRelations;
  classe: string;
}

function itensDoDia(week: Week, day: Date): Item[] {
  const itens: Item[] = [];

  for (const s of week.services) {
    if (!s.scheduled_at || s.status === 'cancelado') continue;
    const inicio = new Date(s.scheduled_at);
    itens.push({
      key: `s-${s.id}`,
      titulo: s.service_name,
      detalhe: [s.client?.name, s.vehicle?.plate].filter(Boolean).join(' · '),
      startIso: s.scheduled_at,
      endIso: new Date(inicio.getTime() + (s.duration_minutes ?? DURACAO_OMISSAO) * 60_000).toISOString(),
      servico: s,
      classe: 'bg-blue-950/70 border-blue-700/60 hover:border-blue-500',
    });
  }

  for (const o of week.timeOff) {
    itens.push({
      key: `f-${o.id}`,
      titulo: 'Folga',
      detalhe: o.reason ?? '',
      startIso: o.starts_at,
      endIso: o.ends_at,
      classe: 'bg-amber-950/50 border-amber-700/50',
    });
  }

  // Só existem no Google e não têm ficha cá. Sem link, de propósito: não há
  // para onde ir, e um bloco clicável que não abre nada é pior do que um que
  // não convida a carregar.
  for (const b of week.blocks) {
    itens.push({
      key: `g-${b.id}`,
      titulo: b.summary,
      detalhe: 'Google Calendar',
      startIso: b.startIso,
      endIso: b.endIso,
      classe: 'bg-white/[0.06] border-white/20',
    });
  }

  return itens.filter((i) => posicaoNoDia(i.startIso, i.endIso, day) !== null);
}

export function WeekCalendar({
  week, onServico,
}: { week: Week; onServico: (s: ServiceWithRelations) => void }) {
  const horas = Array.from({ length: CLOSES - OPENS }, (_, i) => OPENS + i);
  const hoje = dayKey(new Date());

  return (
    <div className="border border-white/10 rounded-md overflow-hidden">
      {/* Cabeçalho dos dias, alinhado com a coluna das horas por baixo. */}
      <div className="grid grid-cols-[3rem_repeat(7,1fr)] border-b border-white/10 bg-white/[0.02]">
        <div />
        {week.days.map((d) => {
          const eHoje = dayKey(d) === hoje;
          return (
            <div
              key={dayKey(d)}
              className={`px-2 py-2 text-center border-l border-white/10 ${
                eHoje ? 'bg-blue-950/40' : ''
              }`}
            >
              <div className={`text-[9px] tracking-[0.2em] uppercase ${eHoje ? 'text-blue-300' : 'text-white/40'}`}>
                {DIA_CURTO.format(d).replace('.', '')}
              </div>
              <div className={`text-sm font-semibold ${eHoje ? 'text-white' : 'text-white/70'}`}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-[3rem_repeat(7,1fr)]">
        {/* As horas, uma linha por hora. O 3rem da coluna casa com o cabeçalho. */}
        <div>
          {horas.map((h) => (
            <div key={h} className="h-14 border-b border-white/5 pr-2 text-right">
              <span className="text-[10px] text-white/30 relative -top-1.5">{`${String(h).padStart(2, '0')}:00`}</span>
            </div>
          ))}
        </div>

        {week.days.map((d) => {
          const fechado = isEncerrado(d);
          const itens = itensDoDia(week, d);

          return (
            <div
              key={dayKey(d)}
              className={`relative border-l border-white/10 ${fechado ? 'bg-white/[0.02]' : ''}`}
            >
              {/* As linhas da grelha, por baixo dos blocos. */}
              {horas.map((h) => <div key={h} className="h-14 border-b border-white/5" />)}

              {fechado && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-[9px] tracking-[0.2em] text-white/20 uppercase rotate-90">Encerrado</span>
                </div>
              )}

              {itens.map((i) => {
                const pos = posicaoNoDia(i.startIso, i.endIso, d)!;
                const conteudo = (
                  <>
                    <div className="text-[10px] text-white/50">{HORA.format(new Date(i.startIso))}</div>
                    <div className="text-[11px] text-white font-semibold leading-tight truncate">{i.titulo}</div>
                    {i.detalhe && <div className="text-[10px] text-white/45 truncate">{i.detalhe}</div>}
                  </>
                );

                const caixa = `absolute left-0.5 right-0.5 border rounded-sm px-1.5 py-1 overflow-hidden transition ${i.classe}`;
                const estilo = { top: `${pos.top}%`, height: `${pos.height}%`, minHeight: '1.5rem' };
                const dica = `${HORA.format(new Date(i.startIso))} · ${i.titulo}${i.detalhe ? ` · ${i.detalhe}` : ''}`;

                // Carregar num servico abre as mensagens, que e o que se quer
                // fazer a olhar para a agenda. A ficha fica a um toque, no
                // cabecalho da modal — nao se perde, deixa e de ser o primeiro
                // passo para uma coisa que se faz dezenas de vezes por dia.
                return i.servico ? (
                  <button
                    key={i.key}
                    type="button"
                    onClick={() => onServico(i.servico!)}
                    className={`${caixa} text-left w-auto`}
                    style={estilo}
                    title={`${dica} — mensagens`}
                  >
                    {conteudo}
                  </button>
                ) : (
                  <div key={i.key} className={caixa} style={estilo} title={dica}>
                    {conteudo}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
