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
const HORARIO = { opens: '09:00', closes: '18:00' };
export const INSTAGRAM = 'https://www.instagram.com/cleanstation_car/';

export function seoText(lang) {
  const cheapest = Math.min(...WASH_LEVELS.map((l) => Math.min(...Object.values(l.prices))));

  if (lang === 'en') {
    return {
      title: 'Car Wash and Detailing in Braga | Clean Station Car',
      description:
        `Car detailing and car wash in Braga: interior and exterior washes, interior cleaning, `
        + `polishing and paint protection. From €${cheapest}. Book online with instant availability.`,
      keywords: [
        'car detailing Braga', 'car wash Braga', 'interior car cleaning Braga', 'car polishing Braga',
        'detailed wash', 'headlight polishing', 'paint correction',
        'SUV wash', 'van wash', 'online car wash booking Braga',
      ].join(', '),
    };
  }

  return {
    title: 'Lavagem e Detalhe Automóvel em Braga | Clean Station Car',
    description:
      `Detalhe e lavagem automóvel em Braga: lavagem interior e exterior, limpeza interior, `
      + `polimento e proteção da pintura. Desde ${cheapest}€. Marcação online com disponibilidade em tempo real.`,
    keywords: [
      'lavagem automóvel Braga', 'detalhe automóvel Braga', 'limpeza interior automóvel Braga',
      'polimento automóvel Braga', 'lavagem de carros Braga', 'higienização automóvel Braga',
      'lavagem premium automóvel Braga', 'lavagem detalhada', 'polimento de faróis Braga',
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
    hasMap: SITE.mapsShareUrl,
    areaServed: [
      { '@type': 'City', name: 'Braga' },
      { '@type': 'AdministrativeArea', name: 'Distrito de Braga' },
    ],
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
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
        a: 'All our washes include interior and exterior cleaning. The Basic Wash is the maintenance clean; the Wash with Sealant is exactly the same plus a sealant on the paint; the Premium adds detailed interior cleaning, glass decontamination and a premium sealant; the Detailed adds seat removal and sanitising, paint decontamination and deep wheel and tyre cleaning.',
      },
      {
        q: 'Do I need to book in advance?',
        a: 'Yes. We recommend booking ahead to secure the time you want. You can book online, quickly and simply.',
      },
      {
        q: 'How long does the wash take?',
        a: 'Basic Wash about 1h30, Wash with Sealant about 1h45, Premium about 4 hours and Detailed a full day. Larger vehicles take longer, and the estimated duration is shown when you book.',
      },
      {
        q: 'Are prices the same for every car?',
        a: 'No. The prices shown are "from" prices, for a car; SUVs, MPVs and large vans have their own price, shown when you book. All prices include VAT. A vehicle dirtier than usual may carry a supplement, always approved with you before the work starts.',
      },
      {
        q: 'Do I have to leave the car at Clean Station Car?',
        a: 'Yes. The service is carried out at our premises in Braga. Any call-out is only by prior agreement.',
      },
      {
        q: 'Do you clean upholstery and seats?',
        a: 'Yes. In the Detailed Wash the seats are removed and sanitised one by one. The other washes clean the interior without removing the seats.',
      },
      {
        q: "What's the difference between the Premium Wash and the Detailed Wash?",
        a: 'The Detailed Wash adds to the Premium the removal and sanitising of the seats, paint decontamination and deep cleaning of wheels and tyres.',
      },
      {
        q: 'Do you do paint polishing?',
        a: 'Yes. 1-stage polishing for shine and light marks, and advanced paint correction for more visible defects, always within the limits of the clear coat. The price is quoted after we assess the paint.',
      },
      {
        q: 'Can I cancel or change my booking?',
        a: 'Yes. Contact us at least 24 hours in advance to change or cancel your booking.',
      },
      {
        q: 'How do I know my booking went through?',
        a: 'The confirmation appears on screen as soon as the booking is saved and, if you leave your email, you also get it by email.',
      },
      {
        q: 'Where are you?',
        a: `We are in Braga, at ${SITE.address}. Open Monday to Friday, ${HORARIO.opens} to ${HORARIO.closes}; closed on weekends and public holidays. You can see our location and get directions directly on our site.`,
      },
    ];
  }

  return [
    {
      q: 'O que está incluído em cada lavagem?',
      a: 'Todas as nossas lavagens incluem limpeza interior e exterior. A Simples é a limpeza de manutenção; a Com Selante é exatamente a Simples mais selante na pintura; a Premium acrescenta limpeza interior detalhada, descontaminação dos vidros e selante premium; a Detalhada acrescenta remoção e higienização dos bancos, descontaminação da pintura e limpeza profunda de jantes e pneus.',
    },
    {
      q: 'Preciso de marcar com antecedência?',
      a: 'Sim. Recomendamos a marcação antecipada para garantir a disponibilidade do horário pretendido. Podes marcar online de forma rápida e simples.',
    },
    {
      q: 'Quanto tempo demora a lavagem?',
      a: 'Lavagem Simples cerca de 1h30, Com Selante cerca de 1h45, Premium cerca de 4 horas e Detalhada um dia. Veículos maiores demoram mais, e a duração estimada aparece no momento da marcação.',
    },
    {
      q: 'Os preços são iguais para todos os carros?',
      a: 'Não. Os preços apresentados são "desde", para carro; SUV, monovolume e carrinha grande têm valor próprio, mostrado na marcação. Todos os preços incluem IVA. Uma viatura com sujidade fora do normal pode ter um suplemento, sempre aprovado contigo antes de começar.',
    },
    {
      q: 'Tenho de deixar o carro na Clean Station Car?',
      a: 'Sim. O serviço é feito nas nossas instalações em Braga. Qualquer deslocação é só mediante acordo prévio.',
    },
    {
      q: 'Fazem lavagem de estofos e bancos?',
      a: 'Sim. Na Lavagem Detalhada os bancos são removidos e higienizados um a um. As outras lavagens limpam o interior sem remover os bancos.',
    },
    {
      q: 'Qual é a diferença entre a Lavagem Premium e a Lavagem Detalhada?',
      a: 'A Lavagem Detalhada acrescenta à Premium a remoção e higienização dos bancos, a descontaminação da pintura e a limpeza profunda de jantes e pneus.',
    },
    {
      q: 'Fazem polimento automóvel?',
      a: 'Sim. Polimento de 1 etapa para brilho e marcas ligeiras, e correção avançada de pintura para defeitos mais evidentes, sempre dentro dos limites do verniz. O valor é orçamentado depois de avaliarmos a pintura.',
    },
    {
      q: 'Posso cancelar ou alterar a minha marcação?',
      a: 'Sim. Contacta-nos com pelo menos 24 horas de antecedência para alterar ou cancelar a tua marcação.',
    },
    {
      q: 'Como sei que a marcação ficou feita?',
      a: 'A confirmação aparece no ecrã assim que a marcação fica gravada e, se deixares o email, recebe-la também por email.',
    },
    {
      q: 'Onde ficam?',
      a: `Estamos em Braga, na ${SITE.address}. Abertos de segunda a sexta, das ${HORARIO.opens} às ${HORARIO.closes}; fins de semana e feriados encerrado. Podes consultar a nossa localização e obter indicações diretamente no nosso site.`,
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

/**
 * As duas versões de um endereço, para o hreflang e para o sitemap. O x-default
 * é o português: é a língua da oficina e de quase toda a gente que procura.
 */
export const idiomasDe = (caminho) => ({
  'pt-PT': `${SITE_URL}${caminho}`,
  en: `${SITE_URL}/en${caminho}`,
  'x-default': `${SITE_URL}${caminho}`,
});

/**
 * O <head> de uma página, no formato do Next.
 *
 * Uma função para todas as páginas: uma cópia que se esquecesse de mudar o
 * canonical dizia ao Google que duas páginas eram a mesma.
 *
 * `caminho` é o endereço sem língua ("/lavagem-premium-braga/"); o canonical
 * é o da língua pedida e o hreflang aponta para as duas. Antes o inglês
 * apontava para o mesmo endereço que o português — um inglês que não existia.
 */
export function metadados({ title, description, keywords, caminho, lang = 'pt', image }) {
  const idiomas = idiomasDe(caminho);
  const url = idiomas[lang === 'en' ? 'en' : 'pt-PT'];
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url, languages: idiomas },
    openGraph: {
      siteName: SITE.name,
      type: 'website',
      locale: lang === 'en' ? 'en_GB' : 'pt_PT',
      alternateLocale: lang === 'en' ? 'pt_PT' : 'en_GB',
      url,
      title,
      description,
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

/**
 * Dados estruturados prontos a ir para um <script type="application/ld+json">.
 * O `<` escapado impede um texto com "</script>" de fechar a etiqueta a meio.
 */
export const jsonLd = (dados) => ({ __html: JSON.stringify(dados).replace(/</g, '\\u003c') });
