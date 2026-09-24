import '../index.css';
import { LanguageProvider } from '../i18n';
import { SITE_URL } from '../seo';

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

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap" />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
