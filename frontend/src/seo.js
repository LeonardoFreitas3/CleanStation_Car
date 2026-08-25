// Dados estruturados e textos de SEO.
//
// Tudo aqui é DERIVADO de mock.js e booking/pricing.js. A versão anterior
// tinha a lista de serviços escrita à mão no App.js e, quando os serviços
// mudaram, o Google continuou a anunciar cerâmica e higienização de estofos
// durante semanas — coisas que já não se vendem.
//
// Regra: não escrever nomes de serviços aqui. Se vierem dos dados, não podem
// divergir dos dados.

import { SERVICES, SITE } from './mock';
import { VEHICLE_TYPES, WASH_LEVELS, levelsFor } from './booking/pricing';

export const SITE_URL = 'https://cleanstationcar.com';
export const INSTAGRAM = 'https://www.instagram.com/cleanstation_car/';

/** Nomes dos serviços em texto corrido, para descrições e keywords. */
function serviceNames(lang = 'pt') {
  return SERVICES.map((s) => (lang === 'en' ? s.titleEn || s.title : s.title).toLowerCase());
}

export function seoText(lang) {
  const names = serviceNames(lang);
  const cheapest = Math.min(...WASH_LEVELS.map((l) => Math.min(...Object.values(l.prices))));

  if (lang === 'en') {
    return {
      title: 'Clean Station Car – Premium Car Cleaning & Detailing in Braga',
      description:
        `Car cleaning and detailing in Braga. ${names.slice(0, 4).join(', ')}. `
        + `From €${cheapest}. Book online with instant availability.`,
      keywords: [
        'car cleaning Braga', 'car wash Braga', 'car detailing Braga',
        'detailed wash', 'headlight polishing', 'paint correction',
        'SUV wash', 'van wash', 'online car wash booking Braga',
      ].join(', '),
    };
  }

  return {
    title: 'Clean Station Car – Limpeza e Detalhe Automóvel Premium em Braga',
    description:
      `Lavagem e detalhe automóvel em Braga. ${names.slice(0, 4).join(', ')}. `
      + `Desde ${cheapest}€. Marcação online com disponibilidade em tempo real.`,
    keywords: [
      'limpeza automóvel Braga', 'lavagem auto Braga', 'lavagem carro Braga',
      'detalhe automóvel Braga', 'lavagem detalhada', 'polimento de faróis',
      'polimento de pintura', 'lavagem SUV', 'lavagem carrinha',
      'marcação lavagem auto online', 'car detailing Braga',
    ].join(', '),
  };
}

/**
 * Catálogo de ofertas, gerado a partir dos serviços reais.
 *
 * Os polimentos entram sem preço (onRequest) — anunciar um valor que não se
 * pratica é pior do que não anunciar nenhum.
 */
function offerCatalog(lang) {
  return {
    '@type': 'OfferCatalog',
    name: lang === 'en' ? 'Car cleaning and detailing services' : 'Serviços de limpeza e detalhe automóvel',
    itemListElement: SERVICES.map((s) => {
      const name = lang === 'en' ? s.titleEn || s.title : s.title;
      const offer = {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name,
          description: lang === 'en' ? s.descEn || s.desc : s.desc,
          serviceType: lang === 'en' ? 'Car detailing' : 'Estética automóvel',
        },
      };

      if (!s.onRequest && s.price) {
        offer.price = String(s.price);
        offer.priceCurrency = 'EUR';
        // "desde": o preço final depende do porte da viatura.
        offer.priceSpecification = {
          '@type': 'PriceSpecification',
          minPrice: String(s.price),
          priceCurrency: 'EUR',
          valueAddedTaxIncluded: true,
        };
      } else {
        offer.availability = 'https://schema.org/InStock';
      }

      return offer;
    }),
  };
}

export function businessSchema(lang) {
  const seo = seoText(lang);

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoWash',
    '@id': `${SITE_URL}/#business`,
    name: SITE.name,
    description: seo.description,
    image: `${SITE_URL}/img/banner.jpg`,
    logo: `${SITE_URL}/img/logo.png`,
    url: SITE_URL,
    telephone: SITE.phone.replace(/\s/g, ''),
    email: SITE.email,
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Bank Transfer',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'R. Conselheiro Lobato 503',
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
      opens: '09:00',
      closes: '20:00',
    }],
    // Ligar a empresa às contas que ela controla ajuda os motores de busca e
    // os sistemas de IA a perceber que são a mesma entidade.
    sameAs: [INSTAGRAM],
    hasOfferCatalog: offerCatalog(lang),
    potentialAction: {
      '@type': 'ReserveAction',
      name: lang === 'en' ? 'Book a service' : 'Marcar serviço',
      target: { '@type': 'EntryPoint', urlTemplate: SITE_URL },
    },
  };
}

/**
 * Perguntas frequentes.
 *
 * Correspondem a texto realmente visível na página — o schema de FAQ sem
 * conteúdo à vista viola as regras do Google e pode custar os resultados
 * enriquecidos todos. São também as perguntas que os sistemas de IA recebem
 * sobre um negócio destes: onde é, quanto custa, quanto tempo demora.
 */
export function faqItems(lang) {
  const carro = levelsFor('carro');
  const desde = Math.min(...carro.map((l) => l.price));
  const vehicles = VEHICLE_TYPES.map((v) => v.label).join(', ');

  if (lang === 'en') {
    return [
      { q: 'Where is Clean Station Car?', a: `${SITE.address}, Portugal.` },
      { q: 'What are the opening hours?', a: 'Monday to Saturday, 09:00 to 20:00. Closed on Sundays.' },
      { q: 'How much does a wash cost?', a: `From €${desde}. The price depends on the vehicle type and the condition of the car — you get the estimate before confirming.` },
      { q: 'Do I need to book in advance?', a: 'Yes. You can book online with real-time availability, or contact us on WhatsApp. Same-day bookings are not accepted.' },
      { q: 'How long does it take?', a: 'A basic wash takes about 1h30. A full detail takes a whole day — the car stays overnight.' },
      { q: 'Which vehicles do you take?', a: `${vehicles}. Each has its own pricing.` },
    ];
  }

  return [
    { q: 'Onde fica a Clean Station Car?', a: `${SITE.address}.` },
    { q: 'Qual é o horário?', a: 'Segunda a sábado, das 09:00 às 20:00. Domingos encerrado.' },
    { q: 'Quanto custa uma lavagem?', a: `Desde ${desde}€. O valor depende do tipo de veículo e do estado da viatura — recebe a estimativa antes de confirmar.` },
    { q: 'É preciso marcar?', a: 'Sim. Pode marcar online, com disponibilidade em tempo real, ou pelo WhatsApp. Não aceitamos marcações para o próprio dia.' },
    { q: 'Quanto tempo demora?', a: 'Uma lavagem simples demora cerca de 1h30. Uma lavagem detalhada ocupa o dia inteiro — o carro fica de um dia para o outro.' },
    { q: 'Que veículos aceitam?', a: `${vehicles}. Cada um tem o seu preço.` },
  ];
}

export function faqSchema(lang) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems(lang).map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
