import { Cinzel, Inter } from 'next/font/google';
import '../index.css';
import { LanguageProvider } from '../i18n';
import { SITE_URL } from '../seo';

// O layout de raiz, um por língua: (pt)/layout.jsx e (en)/layout.jsx chamam
// isto com o `lang` certo. Dois layouts de raiz e não um, por causa do <html
// lang>: um só layout saía sempre com lang="pt", e as páginas de /en/ só
// diziam "en" depois de o JavaScript correr — o HTML cru contradizia o
// hreflang.

export const metadata = {
  metadataBase: new URL(SITE_URL),
  // Sem título por omissão, de propósito: o CRM escreve o seu no
  // document.title, e um <title> do Next no 404.html (que é onde o CRM vive)
  // era do React, que o repunha na primeira vez que redesenhasse.
  robots: 'index, follow, max-image-preview:large',
  authors: [{ name: 'Clean Station Car' }],
  icons: { icon: '/img/favicon.ico' },
  other: {
    'geo.region': 'PT-03',
    'geo.placename': 'Braga',
    'geo.position': '41.5454;-8.4265',
    ICBM: '41.5454, -8.4265',
  },
};

export const viewport = { themeColor: '#000000' };

// Servidas pelo próprio site, descarregadas no build. Eram um @import do Google
// Fonts no index.css, que o build do Next deita fora: desde a passagem para Next
// os títulos saíam em Georgia e o texto só tinha a Inter a 600.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', display: 'swap' });

export default function Raiz({ lang, children }) {
  return (
    <html lang={lang} className={`${inter.variable} ${cinzel.variable}`}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
