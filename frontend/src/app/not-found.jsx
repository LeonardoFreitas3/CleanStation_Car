'use client';

import dynamic from 'next/dynamic';

// Só no browser: o react-router lê o endereço da janela, e no build não há
// janela nenhuma.
const RotasCliente = dynamic(() => import('../rotasCliente'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black" />,
});

export default function NotFound() {
  return <RotasCliente />;
}
