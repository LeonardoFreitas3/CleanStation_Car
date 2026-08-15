// Primitivas visuais do CRM.
//
// Reutilizam a identidade do site publico: fundo preto, azuis #2563eb/#60a5fa,
// bordas white/10, maiusculas com tracking largo nos rotulos e a Cinzel
// (classe .font-display, definida em src/index.css) nos titulos.
//
// Estao todas num ficheiro por serem pequenas e mudarem em conjunto. Os
// componentes de dominio (ClientCard, ServiceTimeline...) ficam em ficheiros
// proprios.
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-blue-700 hover:bg-blue-600 text-white border border-blue-600',
  secondary: 'bg-transparent text-white border border-white/20 hover:border-blue-500 hover:text-blue-400',
  ghost: 'bg-transparent text-white/70 border border-transparent hover:text-white hover:bg-white/5',
  danger: 'bg-red-900/40 text-red-200 border border-red-700/60 hover:bg-red-900/60',
  whatsapp: 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  /** Alvos grandes: o CRM usa-se com uma mao dentro da lavagem. */
  size?: 'md' | 'lg';
}

export function Button({
  variant = 'primary', loading = false, size = 'md',
  className = '', children, disabled, ...rest
}: ButtonProps) {
  const pad = size === 'lg' ? 'px-6 py-4 text-sm' : 'px-4 py-2.5 text-xs';
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 ${pad} tracking-[0.18em] font-bold uppercase transition rounded-sm disabled:opacity-50 disabled:cursor-not-allowed ${BUTTON_STYLES[variant]} ${className}`}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  /** Slot para o botao de mostrar/esconder a palavra-passe. */
  trailing?: React.ReactNode;
}

export function Field({ label, error, trailing, className = '', id, ...rest }: FieldProps) {
  const inputId = id ?? `f-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-[10px] tracking-[0.28em] text-white/50 mb-2 uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          {...rest}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={`w-full bg-black/60 border px-4 py-3 text-white text-sm rounded-sm outline-none transition placeholder:text-white/25 ${
            error ? 'border-red-600/70 focus:border-red-500' : 'border-white/15 focus:border-blue-500'
          } ${trailing ? 'pr-12' : ''}`}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{trailing}</div>}
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}

export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-[#0e0e0e] border border-white/10 rounded-md ${className}`}>{children}</div>
  );
}

export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <span
      role="status"
      aria-label="A carregar"
      style={{ width: size, height: size, borderWidth: Math.max(2, size / 9) }}
      className="inline-block rounded-full border-white/25 border-t-blue-400 animate-spin shrink-0"
    />
  );
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'info' | 'success'; children: React.ReactNode }) {
  const tones = {
    error: 'bg-red-950/50 border-red-800/60 text-red-200',
    info: 'bg-blue-950/40 border-blue-800/50 text-blue-100',
    success: 'bg-emerald-950/40 border-emerald-800/50 text-emerald-100',
  };
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`border px-4 py-3 text-sm rounded-sm ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function PageTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-white text-2xl md:text-3xl font-black tracking-wide uppercase">{children}</h1>
      <span className="accent-bar-left mt-3" />
      {sub && <p className="text-white/50 text-sm mt-3">{sub}</p>}
    </div>
  );
}

export function CenteredState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="Clean Station Car" className="h-14 w-auto mx-auto mb-8" />
        <h1 className="font-display text-white text-xl font-black tracking-wide uppercase">{title}</h1>
        <span className="accent-bar mx-auto mt-4" />
        <div className="mt-6 text-white/60 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
