'use client';

import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import useModalDialog from '../useModalDialog';
import { fotoAlt, fotoSrc } from '../fotos';

/**
 * Uma fotografia em tamanho completo, com as do mesmo grupo à frente e atrás.
 *
 * Um <dialog> nativo, como as outras janelas do site (useModalDialog): o
 * Escape fecha e o foco volta à miniatura de onde se veio. No telemóvel muda-se
 * de fotografia a deslizar o dedo; no computador, pelas setas do ecrã ou do
 * teclado.
 *
 * `fotos` são nomes do fotos.js; `indice` é a que está aberta, null fechado.
 */
export default function Lightbox({ fotos, indice, onIndice, lang }) {
  if (indice === null) return null;
  return <Janela fotos={fotos} indice={indice} onIndice={onIndice} lang={lang} />;
}

function Janela({ fotos, indice, onIndice, lang }) {
  const { ref, dismiss } = useModalDialog(true, () => onIndice(null));
  const en = lang === 'en';
  const varias = fotos.length > 1;
  const ir = (passo) => onIndice((indice + passo + fotos.length) % fotos.length);

  // As setas do teclado. No próprio dialog, que é onde está o foco.
  const irRef = useRef(ir);
  irRef.current = ir;
  useEffect(() => {
    const el = ref.current;
    const tecla = (e) => {
      if (e.key === 'ArrowRight') irRef.current(1);
      if (e.key === 'ArrowLeft') irRef.current(-1);
    };
    el?.addEventListener('keydown', tecla);
    return () => el?.removeEventListener('keydown', tecla);
  }, [ref]);

  // Deslizar: só conta um gesto mais horizontal do que vertical, para não
  // trocar de fotografia a quem só queria fazer zoom ou rolar.
  const inicio = useRef(null);
  const tocar = (e) => { inicio.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const largar = (e) => {
    if (!inicio.current || !varias) return;
    const dx = e.changedTouches[0].clientX - inicio.current.x;
    const dy = e.changedTouches[0].clientY - inicio.current.y;
    inicio.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) ir(dx < 0 ? 1 : -1);
  };

  const nome = fotos[indice];
  const seta = 'absolute top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-black/60 border border-white/20 hover:border-blue-500 text-white transition';

  return (
    <dialog
      ref={ref}
      aria-label={en ? 'Photo' : 'Fotografia'}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
      onTouchStart={tocar}
      onTouchEnd={largar}
      className="m-0 p-0 w-screen h-[100dvh] max-w-none max-h-none bg-black/95 backdrop:bg-black/80"
    >
      <div
        className="w-full h-full flex items-center justify-center px-4 py-16 sm:px-20"
        onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
      >
        <img
          key={nome}
          src={fotoSrc(nome, 'full')}
          alt={fotoAlt(nome, lang)}
          className="max-w-full max-h-full object-contain select-none"
        />
      </div>

      <button type="button" onClick={dismiss} aria-label={en ? 'Close' : 'Fechar'} className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center bg-black/60 border border-white/20 hover:border-blue-500 text-white transition">
        <X className="w-5 h-5" aria-hidden="true" />
      </button>

      {varias && (
        <>
          <button type="button" onClick={() => ir(-1)} aria-label={en ? 'Previous photo' : 'Fotografia anterior'} className={`${seta} left-3`}>
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => ir(1)} aria-label={en ? 'Next photo' : 'Fotografia seguinte'} className={`${seta} right-3`}>
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
          <p className="absolute bottom-5 inset-x-0 text-center text-white/60 text-xs tracking-[0.2em]" aria-live="polite">
            {indice + 1} / {fotos.length}
          </p>
        </>
      )}
    </dialog>
  );
}
