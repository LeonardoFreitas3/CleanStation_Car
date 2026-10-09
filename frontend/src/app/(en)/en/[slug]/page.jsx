import { PaginaServico, metadataServico, slugs } from '../../../../paginas';

export const dynamicParams = false;
export const generateStaticParams = slugs;

export async function generateMetadata({ params }) {
  return metadataServico((await params).slug, 'en');
}

export default async function Page({ params }) {
  return <PaginaServico slug={(await params).slug} lang="en" />;
}
