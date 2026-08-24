/**
 * Exportação para folha de cálculo.
 *
 * Duas escolhas que parecem detalhe e não são: o separador é o ponto e vírgula
 * e o ficheiro leva BOM. O Excel em português usa o ponto e vírgula como
 * separador de listas — com vírgulas, a folha abre com tudo numa coluna só — e
 * sem BOM lê o ficheiro como ANSI, o que estraga todos os acentos.
 */

const SEPARATOR = ';';

/** O BOM que diz ao Excel que isto é UTF-8. Sem ele, "João" vira "JoÃ£o". */
const BOM = '﻿';

/** Aspas à volta de tudo o que pode partir a linha, e aspas duplicadas dentro. */
function cell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /["\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export interface Column<T> {
  header: string;
  value: (row: T) => unknown;
}

export function toCsv<T>(rows: T[], columns: Array<Column<T>>): string {
  const lines = [columns.map((c) => cell(c.header)).join(SEPARATOR)];
  for (const row of rows) {
    lines.push(columns.map((c) => cell(c.value(row))).join(SEPARATOR));
  }
  // CRLF: é o que o Excel espera, e o resto do mundo aceita na mesma.
  return lines.join('\r\n');
}

/** Data no formato que o Excel português reconhece sem perguntar nada. */
export function csvDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Vírgula decimal: com ponto, o Excel português lê 12.50 como texto. */
export function csvNumber(value: number | null | undefined): string {
  return Number(value ?? 0).toFixed(2).replace('.', ',');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  // Sem isto o blob fica em memória até a página fechar.
  URL.revokeObjectURL(url);
}

/** Nome com a data, para não ficarem cinco "clientes.csv" na pasta. */
export function csvFilename(base: string): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${base}-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.csv`;
}
