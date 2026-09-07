// As páginas de serviço em inglês.
//
// Ficheiro à parte e não campos `xEn` espalhados pelo servicePages.js: aqui uma
// página inteira é um bloco de texto seguido, e quem traduz lê-o de uma vez em
// vez de saltar de linha em linha entre duas línguas. A componente escolhe o
// bloco pela língua e o resto — slug, preço, imagem — não muda.
//
// Os nomes dos serviços são os mesmos que o mock.js já usa em inglês (BASIC
// WASH, WASH WITH SEALANT, PREMIUM WASH, DETAILED WASH). Um site que chama
// "Basic Wash" a um cartão e "Simple Wash" à página do mesmo serviço parece
// dois sítios diferentes.
//
// O endereço não muda com a língua, e é de propósito: quem procura em inglês
// "car wash braga" chega ao mesmo sítio, e um segundo endereço para o mesmo
// serviço era um segundo canonical a dividir o que o Google já sabe deste.

export const EN_PAGES = {
  'lavagem-automovel-braga': {
    nome: 'Basic Wash',
    title: 'Car Wash in Braga | Clean Station',
    description:
      'Car wash in Braga with manual interior and exterior cleaning. '
      + 'Complete wash from €30, with online booking at Clean Station.',
    h1: 'Car Wash in Braga',
    intro: [
      'A complete solution for keeping your vehicle in shape, with a manual exterior wash and careful interior cleaning.',
      'At Clean Station, every vehicle is treated individually, so both the inside and the outside get the same attention.',
    ],
    sections: [
      {
        heading: "What's included",
        grupos: [
          {
            titulo: 'Exterior',
            items: ['Pre-wash', 'Manual wash', 'Wheel cleaning', 'Window cleaning'],
          },
          {
            titulo: 'Interior',
            items: [
              'Carpet vacuuming',
              'Floor mat vacuuming',
              'Dashboard cleaning',
              'Boot vacuuming and cleaning',
            ],
          },
        ],
      },
      {
        heading: 'Who it is for',
        paragrafos: [
          'For vehicles with a normal level of dirt that need a complete inside-and-out maintenance clean.',
        ],
      },
      {
        heading: 'How long it takes',
        paragrafos: [
          'Around 1h30 on average.',
          'Vehicles that are dirtier than usual may need more time. When that happens, we always tell the customer beforehand.',
        ],
      },
      {
        heading: 'Dirt beyond the normal',
        paragrafos: [
          'Cases such as a heavy amount of pet hair, excess sand or any other dirt that calls for extra work may carry an additional cost.',
          'Any additional amount is always explained to the customer and approved in advance.',
        ],
      },
    ],
    cta: 'Book the Basic Wash',
    faq: [
      {
        q: 'How long does the Basic Wash take?',
        a: 'About 1h30 on average, depending on the condition of the vehicle.',
      },
      {
        q: 'Does the Basic Wash include interior and exterior?',
        a: 'Yes. The service covers both interior and exterior cleaning.',
      },
      {
        q: 'Can the price go up?',
        a: 'Only when the vehicle is significantly dirtier than usual. Any additional amount is explained in advance.',
      },
      {
        q: 'How is it different from the Wash with Sealant?',
        a: 'The Wash with Sealant also includes a protective layer applied to the paint.',
      },
    ],
  },

  'lavagem-com-selante-braga': {
    nome: 'Wash with Sealant',
    title: 'Car Wash with Sealant in Braga | Clean Station',
    description:
      'Car wash with sealant in Braga. Manual interior and exterior cleaning '
      + 'with protection, shine and a hydrophobic effect from €40.',
    h1: 'Car Wash with Sealant in Braga',
    intro: [
      'On top of a complete interior and exterior clean, this service adds a layer of protection to the vehicle’s paint.',
      'The sealant brings more shine, water repellency and paint protection, which makes it a good choice for keeping the car clean and protected for longer.',
    ],
    sections: [
      {
        heading: "What's included",
        entrada: 'Everything in the Basic Wash, plus:',
        items: [
          'Sealant applied to the paint',
          'More shine',
          'Hydrophobic effect',
          'Extra paint protection',
        ],
      },
      {
        heading: 'How long it takes',
        paragrafos: ['Around 1h45, depending on the condition of the vehicle.'],
      },
      {
        heading: 'Dirt beyond the normal',
        paragrafos: [
          'As with the Basic Wash, cases such as excess pet hair, sand or dirt beyond the normal may carry an additional cost, always explained in advance.',
        ],
      },
    ],
    cta: 'Book the Wash with Sealant',
    faq: [
      {
        q: 'What is the sealant?',
        a: 'It is a protective layer applied over the paint that helps increase shine, water repellency and protection of the surface.',
      },
      {
        q: 'Does the Wash with Sealant include interior cleaning?',
        a: 'Yes. It includes the interior and exterior cleaning of the Basic Wash.',
      },
      {
        q: 'How long does the protection last?',
        a: 'It depends on how the car is used, the weather it sees and how it is maintained. For that reason we prefer not to promise a fixed duration.',
      },
    ],
  },

  'lavagem-premium-braga': {
    nome: 'Premium Wash',
    title: 'Premium Car Wash in Braga | Clean Station',
    description:
      'Premium Wash in Braga with detailed interior and exterior cleaning, '
      + 'glass decontamination and premium paint protection. €65.',
    h1: 'Premium Car Wash in Braga',
    intro: [
      'A service for anyone looking for a level of cleaning above a conventional wash.',
      'The Premium Wash combines a more meticulous interior clean, attention to detail and paint protection, for a more complete and careful result.',
    ],
    sections: [
      {
        heading: "What's included",
        entrada: 'Everything in the Basic Wash, plus:',
        items: [
          'Glass decontamination',
          'Premium paint protection',
          'Deeper vacuuming',
          'Detailed interior cleaning',
          'Cleaning of hard-to-reach areas',
        ],
      },
      {
        heading: 'Detailed interior cleaning',
        entrada: 'Special attention goes to the areas a conventional wash usually leaves behind, such as:',
        items: [
          'Air vents',
          'Controls',
          'Door pockets',
          'Centre console',
          'Gaps between the seats',
          'Other hard-to-reach areas',
        ],
      },
      {
        heading: 'Paint protection',
        entrada: 'A premium protection is applied, giving:',
        items: [
          'More shine',
          'More visual depth to the paint',
          'Hydrophobic effect',
          'Extra protection',
        ],
      },
      {
        heading: 'How long it takes',
        paragrafos: ['Around 4 hours on average, depending on the condition of the vehicle.'],
      },
      {
        heading: 'Who it is for',
        paragrafos: [
          'For every kind of vehicle, and for customers who want a deeper, more detailed clean without going all the way to a full detail.',
        ],
      },
    ],
    cta: 'Book the Premium Wash',
    faq: [
      {
        q: 'How long does the Premium Wash take?',
        a: 'Around 4 hours on average, depending on the condition of the vehicle.',
      },
      {
        q: 'Does the Premium Wash include interior and exterior?',
        a: 'Yes. The service is carried out both inside and outside.',
      },
      {
        q: 'Does the Premium Wash include paint protection?',
        a: 'Yes. A premium protection is applied to the paint.',
      },
      {
        q: 'How is the Premium different from the Detailed Wash?',
        a: 'The Detailed Wash is a significantly deeper service, including seat removal, deep sanitising and paint decontamination.',
      },
    ],
  },

  'lavagem-detalhada-braga': {
    nome: 'Detailed Wash',
    title: 'Detailed Car Wash in Braga | Clean Station',
    description:
      'Detailed car wash in Braga with seat removal, deep sanitising, paint '
      + 'decontamination and interior and exterior cleaning.',
    h1: 'Detailed Car Wash in Braga',
    intro: [
      'Our most complete cleaning service, built to deeply recover the inside and the outside of the vehicle.',
      'Every area is worked on individually, including places a conventional clean cannot reach.',
    ],
    sections: [
      {
        heading: "What's included",
        entrada: 'Everything in the Premium Wash, plus:',
        items: [
          'Seat removal',
          'Deep sanitising of the seats',
          'Paint decontamination',
          'Deep cleaning of wheels and tyres',
          'Extremely detailed interior cleaning',
          'Access to and cleaning of areas that cannot be reached with the seats in place',
        ],
      },
      {
        heading: 'Interior',
        paragrafos: [
          'With the seats out, we can work the cabin far more deeply.',
          'The seats are sanitised individually and the areas that are normally hard to reach get a thorough clean.',
        ],
      },
      {
        heading: 'Exterior',
        entrada: 'On top of the full Premium Wash process, we also carry out:',
        items: [
          'Paint decontamination',
          'Deep wheel cleaning',
          'Tyre cleaning',
          'Glass decontamination',
          'Paint protection',
        ],
      },
      {
        heading: 'How long it takes',
        paragrafos: ['A full day on average, depending on the condition and size of the vehicle.'],
      },
      {
        heading: 'Who it is for',
        paragrafos: [
          'For vehicles that need a deep clean, and for customers who want the highest level of care and detail on their car.',
          'It is especially suited to vehicles with built-up dirt, interiors that need deep sanitising, or cars that have not had a detailed treatment in a long time.',
        ],
      },
    ],
    cta: 'Book the Detailed Wash',
    faq: [
      {
        q: 'How long does a Detailed Wash take?',
        a: 'A full working day on average, depending on the condition and size of the vehicle.',
      },
      {
        q: 'Are the seats really removed?',
        a: 'Yes. The seats are removed so the cleaning and sanitising can go deeper.',
      },
      {
        q: 'Does the Detailed Wash include paint decontamination?',
        a: 'Yes. Paint decontamination is included in this service.',
      },
      {
        q: 'How is the Premium different from the Detailed Wash?',
        a: 'The Detailed Wash adds a much higher level of work, including seat removal, deep sanitising, paint decontamination and deep cleaning of wheels and tyres.',
      },
    ],
  },
};
