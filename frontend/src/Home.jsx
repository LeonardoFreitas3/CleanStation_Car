'use client';

import React, { useEffect, useState, lazy, Suspense } from 'react';
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
import Faq from './components/Faq';

// A pedido: o formulario de marcacao so pesa para quem o abre.
const Booking = lazy(() => import('./booking/Booking'));

export default function Home() {
  const [legalOpen, setLegalOpen] = useState(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => { initAnalytics(); }, []);

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
          <Booking open onClose={() => setBooking(false)} onPrivacy={() => setLegalOpen('privacy')} />
        </Suspense>
      )}
    </div>
  );
}
