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

function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [initialService, setInitialService] = useState(null);
  const [legalOpen, setLegalOpen] = useState(null); // 'privacy' | 'terms' | 'cookies'

  const openBooking = useCallback((serviceId) => {
    setInitialService(typeof serviceId === 'string' ? serviceId : null);
    setBookingOpen(true);
  }, []);

  // Analytics — carrega GA se já houve consentimento
  useEffect(() => { initAnalytics(); }, []);

  // SEO + schema
  useEffect(() => {
    document.title = 'Clean Station Car – Lavagem Detalhada Premium em Braga';
    const ensureMeta = (name, content, attr='name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    ensureMeta('description', 'Detalhamento automóvel premium em Braga. Lavagem detalhada, polimento, proteção cerâmica e higienização interior. Marcação online rápida.');
    ensureMeta('og:title', 'Clean Station Car – Detalhe Premium em Braga', 'property');
    ensureMeta('og:description', 'O detalhe que o teu carro merece. Marcação online fácil.', 'property');
    ensureMeta('og:type', 'website', 'property');

    // LocalBusiness schema
    const sid = 'schema-localbusiness';
    document.getElementById(sid)?.remove();
    const s = document.createElement('script');
    s.id = sid; s.type = 'application/ld+json';
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'AutoWash',
      name: 'Clean Station Car',
      image: 'https://images.unsplash.com/photo-1549064233-945d7063292f',
      telephone: '+351934177308',
      email: 'geral@cleanstationcar.pt',
      address: { '@type': 'PostalAddress', addressLocality: 'Braga', addressCountry: 'PT' },
      openingHours: 'Mo-Sa 08:00-19:00',
      priceRange: '€€',
      url: window.location.href,
    });
    document.head.appendChild(s);
  }, []);

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
