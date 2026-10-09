// ─── Google Analytics 4 e Google Ads ─────────────────────────────────────────
//
// Três identificadores, todos do .env.local e todos opcionais. Sem nenhum, o
// site não carrega etiqueta nenhuma do Google e isto é inerte.
//
//   REACT_APP_GA_ID              G-XXXXXXXXXX    propriedade GA4
//   REACT_APP_ADS_ID             AW-XXXXXXXXX    conta Google Ads
//   REACT_APP_ADS_CONVERSION     rótulo da conversão "marcação" no Ads
//
// Só uma conversão de marcação, de propósito. Se o REACT_APP_ADS_CONVERSION
// estiver definido, a conversão é enviada directamente ao Ads com o id da
// reserva como transaction_id; nesse caso NÃO se importa o evento
// booking_confirmed do GA4 para o Ads, senão conta duas vezes. Sem rótulo,
// importa-se o evento do GA4 e é o Ads que o desduplica.
//
// Consent Mode v2: a etiqueta só carrega depois de o visitante aceitar os
// cookies analíticos, e mesmo então arranca com o consentimento declarado. Quem
// recusa não carrega nada — nem um pedido ao Google sai do browser.

const GA_ID = process.env.REACT_APP_GA_ID || '';
const ADS_ID = process.env.REACT_APP_ADS_ID || '';
const ADS_CONVERSION = process.env.REACT_APP_ADS_CONVERSION || '';

const CONSENT_KEY = 'csc_cookie_consent';

export const isAnalyticsConfigured = Boolean(GA_ID || ADS_ID);

function gtag() {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

function consentido() {
  try {
    return Boolean(JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null')?.analytics);
  } catch {
    return false;
  }
}

function loadTags() {
  if (!isAnalyticsConfigured || document.getElementById('ga-script')) return;

  window.gtag = gtag;
  // Por omissão tudo negado; o que se segue é o consentimento dado no aviso.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  });
  gtag('consent', 'update', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  });

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID || ADS_ID}`;
  document.head.appendChild(script);

  gtag('js', new Date());
  if (GA_ID) gtag('config', GA_ID, { anonymize_ip: true });
  if (ADS_ID) gtag('config', ADS_ID, { allow_enhanced_conversions: false });

  ouvirContactos();
}

/** Inicializa as etiquetas se o utilizador já deu consentimento anteriormente */
export function initAnalytics() {
  if (consentido()) loadTags();
}

/** Chamado pelo banner quando o utilizador aceita/recusa */
export function applyConsent(analyticsAccepted) {
  if (analyticsAccepted) {
    loadTags();
    return;
  }
  if (window.gtag) {
    window.gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
  }
  // Remove cookies GA se existirem
  const cookies = document.cookie.split(';');
  for (const c of cookies) {
    const name = c.trim().split('=')[0];
    if (name.startsWith('_ga') || name.startsWith('_gcl')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  }
}

/** Um evento do GA4, se a etiqueta estiver carregada. Sem dados pessoais. */
export function track(evento, params = {}) {
  if (!window.gtag || !GA_ID) return;
  window.gtag('event', evento, params);
}

/**
 * A conversão principal: a marcação gravada.
 *
 * Chamada pela página de confirmação, que só se abre com uma marcação acabada
 * de gravar. Uma vez por reserva: a referência fica anotada no browser, e um
 * recarregamento ou um "voltar" não volta a contar. Só vai o id e o valor —
 * nem nome, nem telefone, nem matrícula.
 */
export function trackBookingConfirmed({ reference, value }) {
  const id = String(reference ?? '');
  if (!id) return;
  const marca = `csc_conv_${id}`;
  try {
    if (localStorage.getItem(marca)) return;
    localStorage.setItem(marca, '1');
  } catch {
    // Sem localStorage não há como lembrar; a sessionStorage da página já
    // impede o refresh, e um segundo browser é uma segunda pessoa.
  }
  if (!window.gtag) return;
  const comum = { transaction_id: id, value, currency: 'EUR' };
  if (GA_ID) window.gtag('event', 'booking_confirmed', comum);
  if (ADS_ID && ADS_CONVERSION) {
    window.gtag('event', 'conversion', { ...comum, send_to: `${ADS_ID}/${ADS_CONVERSION}` });
  }
}

/**
 * Conversões secundárias: cliques no WhatsApp e no telefone. Um ouvinte para
 * a página inteira, em vez de um onClick em cada um dos oito botões — e um
 * botão novo fica contado sem ninguém se lembrar.
 */
function ouvirContactos() {
  if (window.__cscContactos) return;
  window.__cscContactos = true;
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('https://wa.me/')) track('contact_whatsapp', { page_path: window.location.pathname });
    else if (href.startsWith('tel:')) track('contact_phone', { page_path: window.location.pathname });
  }, { capture: true, passive: true });
}
