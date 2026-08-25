import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// ─── Dicionário de traduções (chrome / UI) ───────────────────────────────────
// Os textos de dados (serviços, testemunhos, processo) vivem em mock.js com
// campos `_en`, acedidos via tx() para manter preço+texto juntos.

const translations = {
  pt: {
    lang: { pt: "PT", en: "EN", switchTo: "English", aria: "Mudar idioma" },
    nav: {
      home: "INÍCIO",
      services: "SERVIÇOS",
      about: "SOBRE NÓS",
      testimonials: "TESTEMUNHOS",
      faq: "FAQ",
      contact: "CONTACTOS",
    },
    legal: { close: "Fechar" },
    hero: {
      badge1: "LAVAGEM DETALHADA PREMIUM",
      badge2: "EM BRAGA",
      subtitle: "O detalhe que o teu carro merece.",
      whatsapp: "PEDIR ORÇAMENTO",
      services: "VER SERVIÇOS",
    },
    services: {
      title: "OS NOSSOS SERVIÇOS",
      subtitle: "Soluções completas para cuidar do teu carro ao mais alto nível. Valores a partir de — preço final sob consulta.",
      from: "DESDE",
      contact: "SABER MAIS",
      note: "Valor a partir de. Preço final sob consulta.",
      onRequest: "Sob consulta",
    },
    serviceDetail: {
      includes: "O QUE ESTÁ INCLUÍDO",
      note: "Valor a partir de. Preço final sujeito a avaliação do estado da viatura.",
      from: "DESDE",
      whatsapp: "PEDIR ORÇAMENTO",
    },
    about: {
      title: "SOBRE NÓS",
      p1: "Na Clean Station Car acreditamos que um automóvel merece mais do que uma simples limpeza — merece cuidado, proteção e atenção ao detalhe.",
      p2: "Somos especializados em estética automóvel, oferecendo serviços pensados para recuperar, valorizar e proteger cada viatura, desde lavagens detalhadas até processos avançados de descontaminação, polimento, correção de pintura e proteções profissionais.",
      p3: "Trabalhamos com foco na qualidade, utilizando técnicas adequadas e produtos profissionais para garantir resultados visíveis, duradouros e seguros para o seu veículo.",
      p4: "Cada carro tem necessidades diferentes, por isso avaliamos cada detalhe para aplicar o tratamento mais indicado, seja para melhorar o aspeto, preservar a pintura ou devolver o conforto ao interior.",
      closing: "Na Clean Station Car, o nosso objetivo é simples: eliminar o que não se vê, proteger o que importa e entregar um resultado que se nota.",
      whatsapp: "FALA CONNOSCO",
    },
    process: { title: "O NOSSO PROCESSO", subtitle: "Cada detalhe importa." },
    faq: { title: "PERGUNTAS FREQUENTES" },
    testimonials: { title: "O QUE DIZEM OS NOSSOS CLIENTES", seeAll: "Ver todas as avaliações no Google" },
    contact: {
      title: "ONDE ESTAMOS",
      hoursDays: "Segunda a Sábado",
      hoursTime: "09:00 – 20:00",
      ctaTitle: "FALA CONNOSCO",
      ctaPara: "Contacta-nos pelo WhatsApp para pedires um orçamento sem compromisso.",
      whatsapp: "PEDIR ORÇAMENTO",
      mapTitle: "Mapa Clean Station Car",
    },
    footer: {
      tagline1: "Estética automóvel premium em Braga.",
      tagline2: "O detalhe que o teu carro merece.",
      navigation: "NAVEGAÇÃO",
      home: "Início",
      about: "Sobre Nós",
      services: "Serviços",
      testimonials: "Testemunhos",
      faq: "Perguntas Frequentes",
      contact: "Contactos",
      social: "REDES SOCIAIS",
      rights: "Todos os direitos reservados.",
      privacy: "Política de Privacidade",
      terms: "Termos & Condições",
      cookies: "Cookies",
    },
    whatsapp: {
      msg: "Olá! Gostaria de fazer uma marcação na Clean Station Car.",
      aria: "Contactar via WhatsApp",
    },
    cookie: {
      title: "Utilizamos cookies",
      body: "Usamos cookies essenciais para o funcionamento do site e, com o seu consentimento, cookies analíticos para melhorar a experiência.",
      policy: "Política de Cookies",
      necessary: "Cookies Necessários",
      necessaryDesc: "Essenciais para o funcionamento. Não podem ser desativados.",
      analytics: "Cookies Analíticos",
      analyticsDesc: "Ajudam-nos a perceber como o site é utilizado.",
      manage: "GERIR PREFERÊNCIAS",
      decline: "RECUSAR",
      acceptAll: "ACEITAR TUDO",
      declineTitle: "Recusar opcionais",
    },
  },

  en: {
    lang: { pt: "PT", en: "EN", switchTo: "Português", aria: "Change language" },
    nav: {
      home: "HOME",
      services: "SERVICES",
      about: "ABOUT US",
      testimonials: "TESTIMONIALS",
      faq: "FAQ",
      contact: "CONTACT",
    },
    legal: { close: "Close" },
    hero: {
      badge1: "PREMIUM CAR DETAILING",
      badge2: "IN BRAGA",
      subtitle: "The detail your car deserves.",
      whatsapp: "GET A QUOTE",
      services: "VIEW SERVICES",
    },
    services: {
      title: "OUR SERVICES",
      subtitle: "Complete solutions to care for your car at the highest level. Prices from — final price upon consultation.",
      from: "FROM",
      contact: "LEARN MORE",
      note: "Price from. Final price upon consultation.",
      onRequest: "On request",
    },
    serviceDetail: {
      includes: "WHAT'S INCLUDED",
      note: "Price from. Final price subject to assessment of the vehicle's condition.",
      from: "FROM",
      whatsapp: "GET A QUOTE",
    },
    about: {
      title: "ABOUT US",
      p1: "At Clean Station Car we believe a car deserves more than a simple wash — it deserves care, protection and attention to detail.",
      p2: "We specialise in automotive aesthetics, offering services designed to restore, enhance and protect every vehicle, from detailed washes to advanced decontamination, polishing, paint correction and professional protection.",
      p3: "We work with a focus on quality, using the right techniques and professional products to guarantee visible, long-lasting and safe results for your vehicle.",
      p4: "Every car has different needs, so we assess every detail to apply the most suitable treatment — whether to improve appearance, preserve the paint or restore comfort to the interior.",
      closing: "At Clean Station Car, our goal is simple: eliminate what you can't see, protect what matters and deliver a result you can notice.",
      whatsapp: "GET IN TOUCH",
    },
    process: { title: "OUR PROCESS", subtitle: "Every detail matters." },
    faq: { title: "FREQUENTLY ASKED QUESTIONS" },
    testimonials: { title: "WHAT OUR CLIENTS SAY", seeAll: "See all reviews on Google" },
    contact: {
      title: "WHERE WE ARE",
      hoursDays: "Monday to Saturday",
      hoursTime: "09:00 – 20:00",
      ctaTitle: "GET IN TOUCH",
      ctaPara: "Contact us on WhatsApp for a no-commitment quote.",
      whatsapp: "GET A QUOTE",
      mapTitle: "Clean Station Car map",
    },
    footer: {
      tagline1: "Premium car detailing in Braga.",
      tagline2: "The detail your car deserves.",
      navigation: "NAVIGATION",
      home: "Home",
      about: "About Us",
      services: "Services",
      testimonials: "Testimonials",
      faq: "FAQ",
      contact: "Contact",
      social: "SOCIAL MEDIA",
      rights: "All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
      cookies: "Cookies",
    },
    whatsapp: {
      msg: "Hello! I'd like to book an appointment at Clean Station Car.",
      aria: "Contact via WhatsApp",
    },
    cookie: {
      title: "We use cookies",
      body: "We use essential cookies for the site to work and, with your consent, analytics cookies to improve your experience.",
      policy: "Cookie Policy",
      necessary: "Necessary Cookies",
      necessaryDesc: "Essential for operation. They cannot be disabled.",
      analytics: "Analytics Cookies",
      analyticsDesc: "They help us understand how the site is used.",
      manage: "MANAGE PREFERENCES",
      decline: "DECLINE",
      acceptAll: "ACCEPT ALL",
      declineTitle: "Decline optional",
    },
  },
};

const LANG_KEY = "csc_lang";

function resolve(dict, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), dict);
}

const LanguageContext = createContext({ lang: "pt", setLang: () => {}, t: (k) => k, tx: (o, k) => o?.[k] });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === "pt" || stored === "en") return stored;
    } catch { /* ignore */ }
    return "pt";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
  }, [lang]);

  const setLang = useCallback((l) => setLangState(l === "en" ? "en" : "pt"), []);

  const t = useCallback(
    (path, vars) => {
      let val = resolve(translations[lang], path);
      if (val === undefined) val = resolve(translations.pt, path);
      if (val === undefined) return path;
      if (typeof val === "string" && vars) {
        return val.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
      }
      return val;
    },
    [lang],
  );

  // Localiza um campo de um objeto de dados (mock.js): usa `${key}En` em EN.
  const tx = useCallback(
    (obj, key) => {
      if (!obj) return "";
      if (lang === "en") {
        const en = obj[`${key}En`];
        if (en !== undefined && en !== null) return en;
      }
      return obj[key];
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t, tx }), [lang, setLang, t, tx]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}

// Formata euros consoante o idioma (vírgula em PT, ponto em EN).
export function eur(n, lang = "pt") {
  const v = Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  const num = Number.isInteger(v) ? String(v) : v.toFixed(2).replace(".", lang === "en" ? "." : ",");
  return `${num} €`;
}
