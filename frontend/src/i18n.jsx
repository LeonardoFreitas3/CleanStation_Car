import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// ─── Dicionário de traduções (chrome / UI) ───────────────────────────────────
// Os textos de dados (serviços, testemunhos, processo, problemas, extras) vivem
// em mock.js com campos `_en`, acedidos via tx() para manter preço+texto juntos.

const translations = {
  pt: {
    lang: { pt: "PT", en: "EN", switchTo: "English", aria: "Mudar idioma" },
    nav: {
      home: "INÍCIO",
      services: "SERVIÇOS",
      beforeAfter: "ANTES & DEPOIS",
      about: "SOBRE NÓS",
      testimonials: "TESTEMUNHOS",
      contact: "CONTACTOS",
      book: "MARCAR AGORA",
    },
    hero: {
      badge1: "LAVAGEM DETALHADA PREMIUM",
      badge2: "EM BRAGA",
      subtitle: "O detalhe que o teu carro merece.",
      book: "MARCAR AGORA",
      services: "VER SERVIÇOS",
    },
    services: {
      title: "OS NOSSOS SERVIÇOS",
      subtitle: "Soluções completas para cuidar do teu carro ao mais alto nível.",
      from: "DESDE",
      book: "MARCAR",
      cta: "FAZER MARCAÇÃO",
    },
    serviceDetail: {
      includes: "O QUE ESTÁ INCLUÍDO",
      note: "Valores sujeitos a avaliação do estado da viatura.",
      from: "DESDE",
      book: "MARCAR",
    },
    detail: {
      l1: "O DETALHE QUE",
      l2: "O TEU CARRO",
      l3: "MERECE",
      para: "Na Clean Station Car, cada veículo recebe o cuidado e a atenção que merece. Qualidade, paixão e perfeição em cada detalhe.",
      book: "MARCAR AGORA",
    },
    beforeAfter: {
      title: "ANTES & DEPOIS",
      subtitle: "Resultados que falam por si.",
      before: "ANTES",
      after: "DEPOIS",
      more: "VER MAIS RESULTADOS",
      prev: "Anterior",
      next: "Próximo",
    },
    process: { title: "O NOSSO PROCESSO", subtitle: "Cada detalhe importa." },
    testimonials: { title: "O QUE DIZEM OS NOSSOS CLIENTES" },
    contact: {
      title: "ONDE ESTAMOS",
      hoursDays: "Segunda a Sábado",
      hoursTime: "08:00 – 19:00",
      ctaTitle1: "MARCA JÁ",
      ctaTitle2: "O TEU HORÁRIO!",
      ctaPara: "Faz a tua marcação rápida e garante o melhor cuidado para o teu carro.",
      book: "MARCAR AGORA",
      mapTitle: "Mapa Clean Station Car",
    },
    footer: {
      tagline1: "Lavagem detalhada premium em Braga.",
      tagline2: "O detalhe que o teu carro merece.",
      navigation: "NAVEGAÇÃO",
      home: "Início",
      about: "Sobre Nós",
      services: "Serviços",
      testimonials: "Testemunhos",
      beforeAfter: "Antes & Depois",
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
    booking: {
      stepOf: "PASSO {a} DE {b}",
      steps: ["Serviço", "Orçamento", "Data & Hora", "Dados", "Confirmação"],
      errSlotTaken: "Este horário já foi reservado. Por favor escolhe outro.",
      errGeneric: "Não foi possível confirmar a marcação. Tenta novamente.",
      from: "desde",
      months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
      days: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      calNote: "Domingos encerrado. Horários já ocupados não aparecem.",
      availableTime: "HORÁRIO DISPONÍVEL",
      selectDate: "Seleciona uma data",
      checking: "A verificar disponibilidade...",
      noSlots: "Sem horários disponíveis para este serviço neste dia.",
      summary: "RESUMO",
      service: "Serviço",
      duration: "Duração",
      grade: "Grau",
      estTotal: "Total estimado",
      fName: "Nome completo *",
      fNamePh: "O teu nome",
      fPhone: "Telefone *",
      fPhonePh: "+351 ...",
      fEmail: "Email *",
      fEmailPh: "email@exemplo.pt",
      fCar: "Veículo",
      fCarPh: "Ex.: BMW Série 3",
      fNotes: "NOTAS",
      fNotesPh: "Detalhes adicionais (opcional)",
      sService: "SERVIÇO",
      sDate: "DATA",
      sTime: "HORA",
      sEstTotal: "TOTAL ESTIMADO",
      back: "VOLTAR",
      continue: "CONTINUAR",
      confirm: "CONFIRMAR MARCAÇÃO",
      confirming: "A CONFIRMAR...",
      doneTitle: "MARCAÇÃO CONFIRMADA!",
      donePara: "A tua marcação foi registada e adicionada ao nosso calendário.",
      reference: "REFERÊNCIA",
      cVehicle: "VEÍCULO",
      cDuration: "DURAÇÃO",
      cGrade: "GRAU",
      cBase: "Preço base",
      cExtras: "Extras",
      cTotal: "Total estimado",
      close: "FECHAR",
    },
    quote: {
      assessTitle: "AVALIAÇÃO VISUAL DA SUJIDADE",
      assessPara: "Assinala os problemas encontrados. O grau e o preço são calculados automaticamente.",
      vehicleAlt: "Representação do veículo",
      interior: "INTERIOR",
      exterior: "EXTERIOR",
      extras: "EXTRAS OPCIONAIS",
      marked: "ASSINALADO",
      markedPl: "ASSINALADOS",
      onRequest: "Sob consulta",
      otherPh: "Descreve o extra pretendido (será avaliado e orçamentado)",
      summary: "RESUMO DO ORÇAMENTO",
      grade: "GRAU",
      service: "Serviço",
      base: "Preço base",
      problems: "Problemas assinalados",
      pctApplied: "Percentagem aplicada",
      subtotal: "Subtotal",
      extrasUp: "EXTRAS",
      totalExtras: "Total extras",
      estTotal: "TOTAL ESTIMADO",
      disclaimer: "Valor estimado com base na avaliação assinalada. Confirmado na inspeção do veículo.",
    },
  },

  en: {
    lang: { pt: "PT", en: "EN", switchTo: "Português", aria: "Change language" },
    nav: {
      home: "HOME",
      services: "SERVICES",
      beforeAfter: "BEFORE & AFTER",
      about: "ABOUT US",
      testimonials: "TESTIMONIALS",
      contact: "CONTACT",
      book: "BOOK NOW",
    },
    hero: {
      badge1: "PREMIUM CAR DETAILING",
      badge2: "IN BRAGA",
      subtitle: "The detail your car deserves.",
      book: "BOOK NOW",
      services: "VIEW SERVICES",
    },
    services: {
      title: "OUR SERVICES",
      subtitle: "Complete solutions to care for your car at the highest level.",
      from: "FROM",
      book: "BOOK",
      cta: "MAKE A BOOKING",
    },
    serviceDetail: {
      includes: "WHAT'S INCLUDED",
      note: "Prices subject to assessment of the vehicle's condition.",
      from: "FROM",
      book: "BOOK",
    },
    detail: {
      l1: "THE DETAIL",
      l2: "YOUR CAR",
      l3: "DESERVES",
      para: "At Clean Station Car, every vehicle receives the care and attention it deserves. Quality, passion and perfection in every detail.",
      book: "BOOK NOW",
    },
    beforeAfter: {
      title: "BEFORE & AFTER",
      subtitle: "Results that speak for themselves.",
      before: "BEFORE",
      after: "AFTER",
      more: "SEE MORE RESULTS",
      prev: "Previous",
      next: "Next",
    },
    process: { title: "OUR PROCESS", subtitle: "Every detail matters." },
    testimonials: { title: "WHAT OUR CLIENTS SAY" },
    contact: {
      title: "WHERE WE ARE",
      hoursDays: "Monday to Saturday",
      hoursTime: "08:00 – 19:00",
      ctaTitle1: "BOOK YOUR",
      ctaTitle2: "SLOT NOW!",
      ctaPara: "Make your quick booking and secure the best care for your car.",
      book: "BOOK NOW",
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
      beforeAfter: "Before & After",
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
    booking: {
      stepOf: "STEP {a} OF {b}",
      steps: ["Service", "Quote", "Date & Time", "Details", "Confirmation"],
      errSlotTaken: "This slot has already been booked. Please choose another.",
      errGeneric: "We couldn't confirm the booking. Please try again.",
      from: "from",
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      calNote: "Closed on Sundays. Already-booked times are hidden.",
      availableTime: "AVAILABLE TIME",
      selectDate: "Select a date",
      checking: "Checking availability...",
      noSlots: "No times available for this service on this day.",
      summary: "SUMMARY",
      service: "Service",
      duration: "Duration",
      grade: "Grade",
      estTotal: "Estimated total",
      fName: "Full name *",
      fNamePh: "Your name",
      fPhone: "Phone *",
      fPhonePh: "+351 ...",
      fEmail: "Email *",
      fEmailPh: "email@example.com",
      fCar: "Vehicle",
      fCarPh: "e.g. BMW 3 Series",
      fNotes: "NOTES",
      fNotesPh: "Additional details (optional)",
      sService: "SERVICE",
      sDate: "DATE",
      sTime: "TIME",
      sEstTotal: "ESTIMATED TOTAL",
      back: "BACK",
      continue: "CONTINUE",
      confirm: "CONFIRM BOOKING",
      confirming: "CONFIRMING...",
      doneTitle: "BOOKING CONFIRMED!",
      donePara: "Your booking has been registered and added to our calendar.",
      reference: "REFERENCE",
      cVehicle: "VEHICLE",
      cDuration: "DURATION",
      cGrade: "GRADE",
      cBase: "Base price",
      cExtras: "Extras",
      cTotal: "Estimated total",
      close: "CLOSE",
    },
    quote: {
      assessTitle: "VISUAL DIRT ASSESSMENT",
      assessPara: "Select the issues found. The grade and price are calculated automatically.",
      vehicleAlt: "Vehicle representation",
      interior: "INTERIOR",
      exterior: "EXTERIOR",
      extras: "OPTIONAL EXTRAS",
      marked: "SELECTED",
      markedPl: "SELECTED",
      onRequest: "On request",
      otherPh: "Describe the extra you want (it will be assessed and quoted)",
      summary: "QUOTE SUMMARY",
      grade: "GRADE",
      service: "Service",
      base: "Base price",
      problems: "Issues selected",
      pctApplied: "Percentage applied",
      subtotal: "Subtotal",
      extrasUp: "EXTRAS",
      totalExtras: "Total extras",
      estTotal: "ESTIMATED TOTAL",
      disclaimer: "Estimated value based on the selected assessment. Confirmed at vehicle inspection.",
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
