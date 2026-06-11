// ─── Google Analytics ───────────────────────────────────────────────────────
// Quando tiveres o Measurement ID, substitui o valor abaixo (ex: 'G-XXXXXXXXXX')
const GA_ID = process.env.REACT_APP_GA_ID || '';

const CONSENT_KEY = 'csc_cookie_consent';

function loadGA() {
  if (!GA_ID || document.getElementById('ga-script')) return;

  // gtag script
  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  // gtag init
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true });
}

/** Inicializa o GA se o utilizador já deu consentimento anteriormente */
export function initAnalytics() {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return;
    const consent = JSON.parse(stored);
    if (consent?.analytics) loadGA();
  } catch {
    // ignora erros de parse
  }
}

/** Chamado pelo banner quando o utilizador aceita/recusa */
export function applyConsent(analyticsAccepted) {
  if (analyticsAccepted) {
    loadGA();
  } else {
    // Remove cookies GA se existirem
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const name = c.trim().split('=')[0];
      if (name.startsWith('_ga')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    }
  }
}
