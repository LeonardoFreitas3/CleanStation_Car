import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import AboutSection from './components/AboutSection';
import Process from './components/Process';
import Testimonials from './components/Testimonials';
import ContactMap from './components/ContactMap';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import CookiePolicy from './components/CookiePolicy';
import CookieBanner from './components/CookieBanner';
import { initAnalytics } from './analytics';
import { LanguageProvider, useLang } from './i18n';
import Faq from './components/Faq';
import { SITE_URL, businessSchema, faqSchema, seoText } from './seo';

// Carregado a pedido: o CRM traz o supabase-js atras, e quem visita o site
// publico nao tem de descarregar nada disso.
const CrmApp = lazy(() => import('./crm/CrmApp'));

// Tambem a pedido: o formulario de marcacao so pesa para quem o abre.
const Booking = lazy(() => import('./booking/Booking'));

// Site em manutencao enquanto esta em testes. Bandeira de build: quando esta
// desligada, nada disto entra no bundle.
const MAINTENANCE = process.env.REACT_APP_MAINTENANCE === 'true';
const MaintenanceGate = lazy(() => import('./MaintenanceGate'));

function Home() {
  const { lang } = useLang();
  const [legalOpen, setLegalOpen] = useState(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => { initAnalytics(); }, []);

  useEffect(() => {
    const seo = seoText(lang);
    document.documentElement.lang = lang;
    document.title = seo.title;

    const ensureMeta = (name, content, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    ensureMeta('description', seo.description);
    ensureMeta('keywords', seo.keywords);
    ensureMeta('robots', 'index, follow, max-image-preview:large');
    ensureMeta('author', 'Clean Station Car');
    ensureMeta('geo.region', 'PT-03');
    ensureMeta('geo.placename', 'Braga');
    ensureMeta('geo.position', '41.5454;-8.4265');
    ensureMeta('ICBM', '41.5454, -8.4265');

    ensureMeta('og:site_name', 'Clean Station Car', 'property');
    ensureMeta('og:title', seo.title, 'property');
    ensureMeta('og:description', seo.description, 'property');
    ensureMeta('og:type', 'website', 'property');
    ensureMeta('og:url', SITE_URL, 'property');
    ensureMeta('og:locale', lang === 'en' ? 'en_GB' : 'pt_PT', 'property');
    ensureMeta('og:image', `${SITE_URL}/img/banner.jpg`, 'property');
    ensureMeta('twitter:card', 'summary_large_image');
    ensureMeta('twitter:title', seo.title);
    ensureMeta('twitter:description', seo.description);
    ensureMeta('twitter:image', `${SITE_URL}/img/banner.jpg`);

    const ensureLink = (id, rel, href, hreflang) => {
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('link'); el.id = id; el.rel = rel; document.head.appendChild(el); }
      el.setAttribute('href', href);
      if (hreflang) el.setAttribute('hreflang', hreflang);
    };
    ensureLink('seo-canonical', 'canonical', SITE_URL);
    ensureLink('seo-alt-pt', 'alternate', SITE_URL, 'pt-PT');
    ensureLink('seo-alt-en', 'alternate', SITE_URL, 'en');
    ensureLink('seo-alt-default', 'alternate', SITE_URL, 'x-default');

    // Dados estruturados. Gerados a partir dos servicos reais em seo.js — a
    // versao anterior tinha a lista escrita a mao e o Google continuou a
    // anunciar servicos ja removidos.
    const injectJsonLd = (id, data) => {
      document.getElementById(id)?.remove();
      const el = document.createElement('script');
      el.id = id;
      el.type = 'application/ld+json';
      el.textContent = JSON.stringify(data);
      document.head.appendChild(el);
    };

    injectJsonLd('schema-localbusiness', businessSchema(lang));
    injectJsonLd('schema-faq', faqSchema(lang));
  }, [lang]);

  return (
    <div className="bg-black text-white min-h-screen">
      <Header />
      <main>
        <Hero onBook={() => setBooking(true)} />
        <Services />
        <AboutSection />
        <Process />
        <Testimonials />
        <Faq />
        <ContactMap />
      </main>
      <Footer onLegal={setLegalOpen} />
      <WhatsAppButton />
      <PrivacyPolicy open={legalOpen === 'privacy'} onClose={() => setLegalOpen(null)} />
      <TermsConditions open={legalOpen === 'terms'} onClose={() => setLegalOpen(null)} />
      <CookiePolicy open={legalOpen === 'cookies'} onClose={() => setLegalOpen(null)} />
      <CookieBanner onOpenPolicy={() => setLegalOpen('cookies')} />
      {booking && (
        <Suspense fallback={null}>
          <Booking open onClose={() => setBooking(false)} />
        </Suspense>
      )}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
          <Route
            path="/"
            element={
              MAINTENANCE ? (
                <Suspense fallback={<div className="min-h-screen bg-black" />}>
                  <MaintenanceGate><Home /></MaintenanceGate>
                </Suspense>
              ) : (
                <Home />
              )
            }
          />
          <Route
            path="/crm/*"
            element={
              <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <CrmApp />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
