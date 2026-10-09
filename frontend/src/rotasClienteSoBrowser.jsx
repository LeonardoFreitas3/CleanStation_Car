'use client';

import dynamic from 'next/dynamic';

// Só no browser: o react-router lê o endereço da janela, e no build não há
// janela nenhuma. Num ficheiro à parte do global-not-found porque o `ssr:
// false` obriga a um componente de cliente, e o 404 tem de ser de servidor —
// é ele que desenha o <html> com as fontes, que não carregam do lado do
// browser.
const RotasCliente = dynamic(() => import('./rotasCliente'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-black" />,
});

export default function RotasClienteSoBrowser() {
  return <RotasCliente />;
}
