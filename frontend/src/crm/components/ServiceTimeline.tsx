import { Check, X } from 'lucide-react';
import { SERVICE_FLOW, SERVICE_STATUS_LABEL } from '../services/services';
import type { ServiceStatus } from '../types';

/**
 * Fluxo do servico.
 *
 * Sao 10 etapas, o que num telemovel de 375px nao cabe de lado nenhum. Fica
 * uma tira com scroll horizontal que se auto-posiciona na etapa atual, em vez
 * de espremer tudo ate ficar ilegivel.
 */
export function ServiceTimeline({ status }: { status: ServiceStatus }) {
  if (status === 'cancelado') {
    return (
      <div className="flex items-center gap-3 border border-red-900/50 bg-red-950/25 rounded-md px-4 py-3">
        <X className="w-4 h-4 text-red-400 shrink-0" />
        <span className="text-red-200 text-sm font-semibold">Serviço cancelado</span>
      </div>
    );
  }

  const currentIndex = SERVICE_FLOW.indexOf(status);

  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2">
      <ol className="flex items-start gap-0 min-w-max">
        {SERVICE_FLOW.map((step, i) => {
          const done = i < currentIndex;
          const current = i === currentIndex;

          return (
            <li key={step} className="flex items-start">
              <div className="flex flex-col items-center w-[72px]">
                <div
                  aria-current={current ? 'step' : undefined}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                    done
                      ? 'bg-blue-700 border-blue-600 text-white'
                      : current
                        ? 'bg-blue-950 border-blue-400 text-blue-300 ring-4 ring-blue-500/20'
                        : 'bg-transparent border-white/20 text-white/30'
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : <span className="text-[11px] font-bold">{i + 1}</span>}
                </div>
                <span
                  className={`text-[9px] tracking-[0.1em] uppercase text-center mt-2 leading-tight px-1 ${
                    current ? 'text-blue-300 font-bold' : done ? 'text-white/55' : 'text-white/30'
                  }`}
                >
                  {SERVICE_STATUS_LABEL[step]}
                </span>
              </div>

              {i < SERVICE_FLOW.length - 1 && (
                <div className={`h-0.5 w-4 mt-4 shrink-0 ${i < currentIndex ? 'bg-blue-600' : 'bg-white/15'}`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
