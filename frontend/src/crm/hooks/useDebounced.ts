import { useEffect, useState } from 'react';

/**
 * Atrasa o valor devolvido enquanto o utilizador escreve.
 *
 * Sem isto, cada tecla na pesquisa dispara duas chamadas RPC ao Postgres.
 */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
