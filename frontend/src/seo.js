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
import { WASH_LEVELS } from './booking/pricing';

export const SITE_URL = 'https://cleanstationcar.com';

/**
 * O horario que o site anuncia.
 *
 * Aqui e nao nas Definicoes: isto e gerado no build e nao tem base de dados a
 * quem perguntar. Num sitio so, porque e dito duas vezes — no schema do
 * negocio e na resposta das FAQ — e duas copias de um horario e a maneira mais
 * facil de o Google anunciar uma hora e a porta ter outra.
 *
 * Se o horario da oficina mudar, muda tambem em CRM -> Definicoes, que e o que
 * decide as vagas a serio. Este e o que se conta a quem procura.
 */
const HORARIO = { opens: '09:00', closes: '20:00' };
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
      opens: HORARIO.opens,
      closes: HORARIO.closes,
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
 * enriquecidos todos.
 *
 * Escritas à mão e não derivadas dos dados, ao contrário do resto deste
 * ficheiro: são as perguntas e as respostas que o dono da oficina quer dar, e
 * a regra do topo — não escrever nomes de serviços aqui — vale para o que o
 * Google anuncia como catálogo, não para o que se responde a um cliente.
 *
 * As duas línguas dizem o mesmo. Mexer numa sem mexer na outra deixa metade
 * dos visitantes com a versão antiga.
 */
export function faqItems(lang) {
  if (lang === 'en') {
    return [
      {
        q: 'What is included in each wash?',
        a: 'All our washes include interior and exterior cleaning. What changes between services is the level of cleaning, protection and detail applied to the vehicle.',
      },
      {
        q: 'Do I need to book in advance?',
        a: 'Yes. We recommend booking ahead to secure the time you want. You can book online, quickly and simply.',
      },
      {
        q: 'How long does the wash take?',
        a: 'It depends on the service chosen and the condition of the vehicle. An estimated duration is shown when you book.',
      },
      {
        q: 'Are prices the same for every car?',
        a: 'The prices shown are base prices. Larger vehicles, or vehicles dirtier than usual, may carry a surcharge — always agreed with you before the work starts.',
      },
      {
        q: 'Do I have to leave the car at Clean Station?',
        a: 'Yes. To guarantee the quality of the work, the vehicle must be dropped off at our premises in Braga.',
      },
      {
        q: 'Do you clean upholstery and seats?',
        a: 'Yes. Depending on the service chosen, we carry out a deeper clean of the seats and the rest of the interior.',
      },
      {
        q: "What's the difference between the Premium Wash and the Detailed Wash?",
        a: 'The Detailed Wash includes a higher level of cleaning, with seat removal, glass and paint decontamination, and premium protection applied.',
      },
      {
        q: 'Do you do paint polishing?',
        a: 'Yes. We carry out polishing and paint correction. For these services the price depends on the condition of the paint and the result you want.',
      },
      {
        q: 'Can I cancel or change my booking?',
        a: 'Yes. Contact us in advance to change or cancel your booking.',
      },
      {
        q: 'Where are you?',
        a: `We are in Braga, at ${SITE.address}. Open Monday to Saturday, ${HORARIO.opens} to ${HORARIO.closes}; closed on Sundays. You can see our location and get directions directly on our site.`,
      },
    ];
  }

  return [
    {
      q: 'O que está incluído em cada lavagem?',
      a: 'Todas as nossas lavagens incluem limpeza interior e exterior. A diferença entre os serviços está no nível de limpeza, proteção e detalhe realizado em cada viatura.',
    },
    {
      q: 'Preciso de marcar com antecedência?',
      a: 'Sim. Recomendamos a marcação antecipada para garantir a disponibilidade do horário pretendido. Pode fazer a sua marcação online de forma rápida e simples.',
    },
    {
      q: 'Quanto tempo demora a lavagem?',
      a: 'O tempo depende do serviço escolhido e do estado da viatura. No momento da marcação é apresentada uma estimativa de duração.',
    },
    {
      q: 'Os preços são iguais para todos os carros?',
      a: 'Os preços apresentados são preços base. Viaturas de maiores dimensões ou com um nível de sujidade acima do normal podem ter um acréscimo, sempre comunicado antes da realização do serviço.',
    },
    {
      q: 'Tenho de deixar o carro na Clean Station?',
      a: 'Sim. Para garantir a qualidade do serviço, a viatura deve ser entregue nas nossas instalações em Braga.',
    },
    {
      q: 'Fazem lavagem de estofos e bancos?',
      a: 'Sim. Dependendo do serviço escolhido, realizamos uma limpeza mais profunda dos bancos e restantes elementos do interior.',
    },
    {
      q: 'Qual é a diferença entre a Lavagem Premium e a Lavagem Detalhada?',
      a: 'A Lavagem Detalhada inclui um nível de limpeza superior, com remoção dos bancos, descontaminação dos vidros e da pintura e aplicação de proteção premium.',
    },
    {
      q: 'Fazem polimento automóvel?',
      a: 'Sim. Realizamos serviços de polimento e correção de pintura. Para estes serviços, o valor depende do estado da pintura e do resultado pretendido.',
    },
    {
      q: 'Posso cancelar ou alterar a minha marcação?',
      a: 'Sim. Contacte-nos com antecedência para alterar ou cancelar a sua marcação.',
    },
    {
      q: 'Onde ficam?',
      a: `Estamos localizados em Braga, na ${SITE.address}. Abertos de segunda a sábado, das ${HORARIO.opens} às ${HORARIO.closes}; domingos encerrado. Pode consultar a nossa localização e obter indicações diretamente no nosso site.`,
    },
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
