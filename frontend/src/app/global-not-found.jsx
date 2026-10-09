import Raiz from './raiz';
import RotasClienteSoBrowser from '../rotasClienteSoBrowser';

export { metadata, viewport } from './raiz';

// O 404 de todo o site, que é também onde o CRM e a galeria vivem: a Netlify
// serve o 404.html em /crm/* e /galeria/* (public/_redirects) e é o
// react-router, no browser, que decide o que mostrar.
//
// global-not-found e não not-found: com um layout de raiz por língua não há
// um layout de onde compor o 404, e o Next saía com a página genérica dele —
// e o CRM deixava de abrir. Este ficheiro desenha o <html> inteiro; a bandeira
// está no next.config.mjs.
export default function GlobalNotFound() {
  return (
    <Raiz lang="pt">
      <RotasClienteSoBrowser />
    </Raiz>
  );
}
