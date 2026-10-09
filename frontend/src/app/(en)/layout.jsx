import Raiz from '../raiz';

export { metadata, viewport } from '../raiz';

export default function Layout({ children }) {
  return <Raiz lang="en">{children}</Raiz>;
}
