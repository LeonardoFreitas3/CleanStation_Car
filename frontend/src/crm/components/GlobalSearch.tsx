import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Car, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import { useDebounced } from '../hooks/useDebounced';
import { Alert, Spinner } from './ui';

interface SearchResult {
  kind: 'cliente' | 'viatura' | 'servico';
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  client_id: string;
}

const ICONS: Record<SearchResult['kind'], LucideIcon> = {
  cliente: User,
  viatura: Car,
  servico: Wrench,
};

const KIND_LABEL: Record<SearchResult['kind'], string> = {
  cliente: 'Cliente',
  viatura: 'Viatura',
  servico: 'Serviço',
};

/** Uma viatura nao tem pagina propria: abre a ficha do dono. */
function routeFor(r: SearchResult): string {
  if (r.kind === 'servico') return `/crm/servicos/${r.id}`;
  return `/crm/clientes/${r.client_id}`;
}

export function GlobalSearch({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);

  const debounced = useDebounced(query, 250);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    // Trava o scroll do fundo enquanto a pesquisa esta aberta.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  useEffect(() => {
    // Menos de 2 caracteres devolve meio mundo e nao ajuda ninguem.
    if (debounced.trim().length < 2) { setResults([]); return; }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      const { data, error: err } = await getSupabase()
        .rpc('global_search', { q: debounced, lim: 20 });

      if (cancelled) return;
      if (err) {
        setError(friendlyError(err));
        setResults([]);
      } else {
        setResults((data ?? []) as SearchResult[]);
        setActive(0);
      }
      setLoading(false);
    })();

    // Evita que uma resposta lenta de uma pesquisa antiga substitua uma
    // recente — o classico resultado que "salta para tras" ao escrever.
    return () => { cancelled = true; };
  }, [debounced]);

  const go = (r: SearchResult) => {
    navigate(routeFor(r));
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-w-xl mx-auto mt-[10vh] px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-zinc-900 border border-white/15 rounded-md overflow-hidden">
          <div className="flex items-center gap-3 px-4 border-b border-white/10">
            <Search className="w-4 h-4 text-white/30 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Nome, telefone, matrícula, marca ou #serviço…"
              aria-label="Pesquisa global"
              className="flex-1 bg-transparent py-4 text-white text-sm outline-none placeholder:text-white/25"
            />
            {loading && <Spinner size={16} />}
            <button onClick={onClose} aria-label="Fechar" className="text-white/40 hover:text-white transition p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {error && <div className="p-4"><Alert tone="error">{error}</Alert></div>}

            {!error && query.trim().length >= 2 && !loading && results.length === 0 && (
              <p className="text-white/40 text-sm text-center py-10">Nada encontrado.</p>
            )}

            {query.trim().length < 2 && (
              <p className="text-white/30 text-xs text-center py-10 px-6 leading-relaxed">
                Escreva pelo menos 2 caracteres.<br />
                Procura em clientes, viaturas e número de serviço.
              </p>
            )}

            {results.map((r, i) => {
              const Icon = ICONS[r.kind];
              return (
                <button
                  key={`${r.kind}-${r.id}`}
                  onClick={() => go(r)}
                  onMouseEnter={() => setActive(i)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-white/5 transition ${
                    i === active ? 'bg-blue-950/30' : 'hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 text-blue-400/70 shrink-0" strokeWidth={1.5} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-white text-sm truncate">{r.title}</span>
                    <span className="block text-white/40 text-xs truncate">{r.subtitle}</span>
                  </span>
                  <span className="text-white/25 text-[9px] tracking-[0.15em] uppercase shrink-0">
                    {KIND_LABEL[r.kind]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
