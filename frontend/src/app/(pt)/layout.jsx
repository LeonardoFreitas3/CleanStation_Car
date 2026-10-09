import Raiz from '../raiz';

export { metadata, viewport } from '../raiz';

export default function Layout({ children }) {
  return <Raiz lang="pt">{children}</Raiz>;
}
