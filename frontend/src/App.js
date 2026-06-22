import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import DetailSection from './components/DetailSection';
import BeforeAfter from './components/BeforeAfter';
import Process from './components/Process';
import Testimonials from './components/Testimonials';
import ContactMap from './components/ContactMap';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Booking from './components/Booking';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import CookiePolicy from './components/CookiePolicy';
import CookieBanner from './components/CookieBanner';
import { initAnalytics } from './analytics';
import { LanguageProvider, useLang } from './i18n';

const SITE_URL = 'https://cleanstationcar.pt';

const SEO = {
  pt: {
    title: 'Clean Station Car – Limpeza e Detalhe Automóvel Premium em Braga',
    description:
      'Limpeza automóvel e detalhe premium em Braga. Lavagem detalhada, polimento de faróis, proteção cerâmica, higienização de estofos e descontaminação. Orçamento e marcação online instantâneos.',
    keywords:
      'limpeza automóvel Braga, lavagem auto Braga, detalhe automóvel, lavagem detalhada, proteção cerâmica, polimento faróis, higienização estofos, lavagem a seco, car detailing Braga',
  },
  en: {
    title: 'Clean Station Car – Premium Car Cleaning & Detailing in Braga',
    description:
      'Premium car cleaning and detailing in Braga, Portugal. Detailed wash, headlight polishing, ceramic protection, upholstery sanitisation and decontamination. Instant online quote and booking.',
    keywords:
      'car cleaning Braga, car wash Braga, car detailing Braga, detailed wash, ceramic protection, headlight polishing, upholstery cleaning, valeting Braga',
  },
};

function Home() {
  const { lang } = useLang();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialService, setInitialService] = useState(null);
  const [legalOpen, setLegalOpen] = useState(null); // 'privacy' | 'terms' | 'cookies'

  const openBooking = useCallback((serviceId) => {
    setInitialService(typeof serviceId === 'string' ? serviceId : null);
    setBookingOpen(true);
  }, []);

  // Analytics — carrega GA se já houve consentimento
  useEffect(() => { initAnalytics(); }, []);

  // SEO + schema (dependente do idioma)
  useEffect(() => {
    const seo = SEO[lang] || SEO.pt;
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
    ensureMeta('og:image', `${SITE_URL}/img/banner.png`, 'property');
    ensureMeta('twitter:card', 'summary_large_image');
    ensureMeta('twitter:title', seo.title);
    ensureMeta('twitter:description', seo.description);
    ensureMeta('twitter:image', `${SITE_URL}/img/banner.png`);

    // Canonical + hreflang alternates
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

    // LocalBusiness schema (rico, para SEO local)
    const sid = 'schema-localbusiness';
    document.getElementById(sid)?.remove();
    const s = document.createElement('script');
    s.id = sid; s.type = 'application/ld+json';
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'AutoWash',
      '@id': `${SITE_URL}/#business`,
      name: 'Clean Station Car',
      description: (SEO[lang] || SEO.pt).description,
      image: `${SITE_URL}/img/banner.png`,
      logo: `${SITE_URL}/img/logo.png`,
      url: SITE_URL,
      telephone: '+351934177308',
      email: 'cleanstationcar@gmail.com',
      priceRange: '€€',
      currenciesAccepted: 'EUR',
      paymentAccepted: 'Cash, Bank Transfer',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'R. Conselheiro Lobato 533',
        addressLocality: 'Braga',
        postalCode: '4705-089',
        addressRegion: 'Braga',
        addressCountry: 'PT',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 41.5454, longitude: -8.4265 },
      areaServed: [
        { '@type': 'City', name: 'Braga' },
        { '@type': 'AdministrativeArea', name: 'Distrito de Braga' },
      ],
      openingHoursSpecification: [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '19:00',
      }],
      sameAs: [],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: lang === 'en' ? 'Car cleaning and detailing services' : 'Serviços de limpeza e detalhe automóvel',
        itemListElement: [
          'Lavagem com Proteção Cerâmica', 'Lavagem Detalhada Interior',
          'Lavagem Detalhada Exterior', 'Higienização de Estofos',
          'Descontaminação de Vidros', 'Polimento de Faróis',
        ].map((n) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n } })),
      },
    });
    document.head.appendChild(s);
  }, [lang]);

  return (
    <div className="bg-black text-white min-h-screen">
      <Header onBook={openBooking} />
      <main>
        <Hero onBook={openBooking} />
        <Services onBook={openBooking} />
        <DetailSection onBook={openBooking} />
        <BeforeAfter />
        <Process />
        <Testimonials />
        <ContactMap onBook={openBooking} />
      </main>
      <Footer onLegal={setLegalOpen} />
      <WhatsAppButton />
      <Booking
        open={bookingOpen}
        initialServiceId={initialService}
        onClose={() => setBookingOpen(false)}
      />
      <PrivacyPolicy open={legalOpen === 'privacy'} onClose={() => setLegalOpen(null)} />
      <TermsConditions open={legalOpen === 'terms'} onClose={() => setLegalOpen(null)} />
      <CookiePolicy open={legalOpen === 'cookies'} onClose={() => setLegalOpen(null)} />
      <CookieBanner onOpenPolicy={() => setLegalOpen('cookies')} />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
