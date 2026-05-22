import React from 'react';
import { SITE } from '../mock';

export default function WhatsAppButton() {
  const msg = encodeURIComponent('Olá! Gostaria de fazer uma marcação na Clean Station Car.');
  return (
    <a
      href={`https://wa.me/${SITE.phoneRaw}?text=${msg}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar via WhatsApp"
      className="fixed bottom-6 right-6 z-[70] group"
    >
      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30" />
      <span className="relative w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-xl shadow-emerald-900/40 transition">
        <svg viewBox="0 0 32 32" className="w-7 h-7" fill="currentColor" aria-hidden="true">
          <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.745.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.788 2.722.788.817 0 2.15-.515 2.478-1.318.13-.314.187-.674.187-1.018 0-.214 0-.358-.072-.43-.157-.27-.515-.355-.873-.355zM16.026 30.39c-1.747 0-3.473-.435-5.005-1.262L4 31l1.916-6.91A13.86 13.86 0 0 1 2.082 16C2.082 8.286 8.314 2.052 16.027 2.052c3.86 0 7.488 1.493 10.213 4.219A14.354 14.354 0 0 1 30.46 16c-.004 7.713-6.726 14.39-14.434 14.39zM16.026 0C7.182 0 0 7.156 0 16c0 2.815.737 5.583 2.146 8.026L0 32l8.27-2.103A15.94 15.94 0 0 0 16.025 32C24.86 32 32 24.829 32 15.984c-.014-4.272-1.685-8.286-4.687-11.305C24.297 1.66 20.281 0 16.026 0z" />
        </svg>
      </span>
    </a>
  );
}
