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
import { useSeoHead } from './useSeoHead';
import ServicoPagina from './components/ServicoPagina';

// Carregado a pedido: o CRM traz o supabase-js atras, e quem visita o site
// publico nao tem de descarregar nada disso.
const CrmApp = lazy(() => import('./crm/CrmApp'));
const Galeria = lazy(() => import('./gallery/Galeria'));

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

  // O <head> desta pagina. A mesma funcao que as paginas de servico usam —
  // estava aqui escrita a mao, e bastava haver uma segunda pagina para estas
  // quarenta linhas serem copiadas com o canonical errado.
  const seo = seoText(lang);
  useSeoHead({
    lang,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    canonical: SITE_URL,
    image: `${SITE_URL}/img/banner.jpg`,
    alternates: [
      { id: 'seo-alt-pt', href: SITE_URL, hreflang: 'pt-PT' },
      { id: 'seo-alt-en', href: SITE_URL, hreflang: 'en' },
      { id: 'seo-alt-default', href: SITE_URL, hreflang: 'x-default' },
    ],
    jsonLd: {
      'schema-localbusiness': businessSchema(lang),
      'schema-faq': faqSchema(lang),
    },
  });

  return (
    <div className="bg-black text-white min-h-screen">
      <Header />
      <main>
        <Hero onBook={() => setBooking(true)} />
        <Testimonials />
        <Services />
        <AboutSection />
        <Process />
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
          {/* Publica de proposito: quem recebe o link nao tem conta nenhuma.
              O token e que da acesso, e so aquele servico. */}
          <Route
            path="/galeria/:token"
            element={
              <Suspense fallback={<div className="min-h-screen bg-black" />}>
                <Galeria />
              </Suspense>
            }
          />
          {/* As paginas de cada lavagem. Um endereco de um segmento so — e o
              que se escreve num cartao e o que o Google mostra. A propria
              componente manda para a inicial o que nao reconhecer, e por isso
              isto nao rouba nada a quem escreveu mal o endereco. */}
          <Route path=":slug" element={<ServicoPagina />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
