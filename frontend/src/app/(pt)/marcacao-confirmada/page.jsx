import MarcacaoConfirmada from '../../../components/MarcacaoConfirmada';

// Página de conversão do Google Ads. Fora do Google e fora do sitemap: não
// responde a pesquisa nenhuma, e uma visita vinda de lá não é uma marcação.
export const metadata = {
  title: 'Pedido de marcação recebido | Clean Station Car',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MarcacaoConfirmada />;
}
