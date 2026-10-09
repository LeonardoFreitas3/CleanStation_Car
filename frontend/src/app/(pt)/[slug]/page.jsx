import { PaginaServico, metadataServico, slugs } from '../../../paginas';

// Uma página por serviço, geradas no build. Um endereço que não esteja aqui cai
// no not-found, que manda para a inicial.
export const dynamicParams = false;
export const generateStaticParams = slugs;

export async function generateMetadata({ params }) {
  return metadataServico((await params).slug, 'pt');
}

export default async function Page({ params }) {
  return <PaginaServico slug={(await params).slug} lang="pt" />;
}
