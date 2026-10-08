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
    title: 'Car Wash in Braga | Clean Station Car',
    description:
      'Car wash in Braga with manual interior and exterior cleaning. '
      + 'Complete wash from €30, with online booking at Clean Station Car.',
    h1: 'Car Wash in Braga',
    intro: [
      'A complete solution for keeping your vehicle in shape, with a manual exterior wash and careful interior cleaning.',
      'At Clean Station Car, every vehicle is treated individually, so both the inside and the outside get the same attention.',
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
      {
        heading: 'Professional car wash in Braga',
        paragrafos: [
          'We wash cars in Braga by hand, one vehicle at a time: an interior and exterior wash with the same care inside and out.',
          'If you want a professional car wash in Braga with more protection or a more thorough interior, see the [Wash with Sealant](/lavagem-com-selante-braga/) and the [Premium Wash](/lavagem-premium-braga/).',
          'For more complete care, see our [car detailing in Braga](/detalhe-automovel-braga/).',
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
    title: 'Car Wash with Sealant in Braga | Clean Station Car',
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
    title: 'Premium Car Wash in Braga | Clean Station Car',
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
    title: 'Detailed Car Wash in Braga | Clean Station Car',
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
  'detalhe-automovel-braga': {
    nome: 'Car Detailing',
    title: 'Car Detailing in Braga | Clean Station Car',
    description:
      'Car detailing in Braga: deep interior cleaning, seat sanitising, '
      + 'decontamination, polishing and paint protection, done by hand at Clean Station Car.',
    h1: 'Car Detailing in Braga',
    intro: [
      'Car detailing goes beyond a wash: it is the careful work of cleaning, restoring and protecting every part of the vehicle, inside and out.',
      'At Clean Station Car we detail cars in Braga with time and attention for each one — from deep interior cleaning to decontamination, polishing and paint protection.',
    ],
    sections: [
      {
        heading: 'What car detailing includes',
        items: [
          'Detailed interior cleaning, including hard-to-reach areas',
          'Seat removal and deep sanitising',
          'Paint and glass decontamination',
          'Deep cleaning of wheels and tyres',
          'Paint polishing and correction',
          'Paint protection',
        ],
      },
      {
        heading: 'Our car detailing services in Braga',
        paragrafos: [
          'The [Detailed Wash](/lavagem-detalhada-braga/) is our most complete service: the seats come out, the interior is deeply sanitised and the paint is decontaminated and protected.',
          'The [Premium Wash](/lavagem-premium-braga/) is for those who want a level of cleaning above a conventional wash, with glass decontamination and premium paint protection.',
          'For scratches, holograms and dull paint, [car polishing](/polimento-automovel-braga/) restores the paint before protecting it.',
          'For yellowed or hazy headlights, [headlight polishing](/polimento-farois-braga/).',
        ],
      },
      {
        heading: 'Car care with attention to detail',
        paragrafos: [
          'We assess every vehicle before we start, to choose the right treatment. If extra work is needed, the customer is always told beforehand.',
          'For a deeper clean, see our [interior car cleaning in Braga](/limpeza-interior-automovel-braga/).',
        ],
      },
    ],
    cta: 'Book a service',
    faq: [
      {
        q: 'What is car detailing?',
        a: 'A thorough cleaning and restoration of the vehicle, inside and out, reaching areas a conventional wash does not. It can include decontamination, polishing and paint protection.',
      },
      {
        q: 'How is detailing different from a wash?',
        a: 'A wash keeps the car clean. Detailing works every area in depth, with seat removal, deep sanitising and paint decontamination.',
      },
      {
        q: 'How long does car detailing take?',
        a: 'The Detailed Wash takes a full day on average, depending on the condition and size of the vehicle.',
      },
      {
        q: 'How much does car detailing cost in Braga?',
        a: 'It depends on the service. Washes have a set price per vehicle type; polishing is quoted after we assess the paint.',
      },
    ],
  },

  'limpeza-interior-automovel-braga': {
    nome: 'Interior Cleaning',
    title: 'Interior Car Cleaning in Braga | Clean Station Car',
    description:
      'Interior car cleaning in Braga: vacuuming, dashboard, hard-to-reach areas '
      + 'and seat and upholstery sanitising. Book online at Clean Station Car.',
    h1: 'Interior Car Cleaning in Braga',
    intro: [
      'We clean car interiors in Braga with vacuuming, dashboard and hard-to-reach cleaning and, in our most complete service, deep sanitising of the seats.',
      'Every one of our washes includes interior cleaning; what changes between them is how deep the work goes.',
    ],
    sections: [
      {
        heading: 'What interior cleaning includes',
        items: [
          'Vacuuming of carpets, floor mats and boot',
          'Dashboard and centre console cleaning',
          'Cleaning of air vents, controls and door pockets',
          'Cleaning between the seats and in hard-to-reach areas',
          'Seat removal and deep sanitising',
        ],
      },
      {
        heading: 'Car sanitising and upholstery cleaning',
        paragrafos: [
          'In the [Detailed Wash](/lavagem-detalhada-braga/) the seats are removed and sanitised one by one. That is how seats and upholstery get a proper deep clean, and how we reach the parts of the cabin hidden with the seats in place.',
          'It suits interiors with built-up dirt, or ones that have not had a detailed treatment in a long time.',
        ],
      },
      {
        heading: 'Which service to choose',
        paragrafos: [
          'For regular upkeep, the [Basic Wash](/lavagem-automovel-braga/) includes interior vacuuming and cleaning.',
          'For a more thorough interior, the [Premium Wash](/lavagem-premium-braga/) works the air vents, controls, door pockets and gaps between seats.',
          'For the most complete interior clean, with seat removal, the [Detailed Wash](/lavagem-detalhada-braga/).',
        ],
      },
      {
        heading: 'Pet hair and dirt beyond the normal',
        paragrafos: [
          'A heavy amount of pet hair, excess sand or any other dirt that calls for extra work may carry an additional cost, always explained and approved in advance.',
          'See also our [car polishing in Braga](/polimento-automovel-braga/).',
        ],
      },
    ],
    cta: 'Book a clean',
    faq: [
      {
        q: 'Do you clean seats and upholstery?',
        a: 'Yes. In the Detailed Wash the seats are removed and sanitised one by one.',
      },
      {
        q: 'Do all washes include interior cleaning?',
        a: 'Yes. All our washes include interior and exterior cleaning; the difference is the level of detail.',
      },
      {
        q: 'How long does interior cleaning take?',
        a: 'It depends on the service chosen and the condition of the vehicle. An estimated duration is shown when you book.',
      },
    ],
  },

  'polimento-automovel-braga': {
    nome: 'Car Polishing',
    title: 'Car Polishing in Braga | Clean Station Car',
    description:
      'Car polishing in Braga: 1-stage polishing and advanced paint correction to '
      + 'remove scratches, swirls and oxidation. Paint assessment at Clean Station Car.',
    h1: 'Car Polishing in Braga',
    intro: [
      'Bring back the shine and improve the look of your car’s paint with a professional polishing service. At Clean Station Car, we assess the condition of the paint and apply the level of correction that suits the vehicle.',
    ],
    sections: [
      {
        heading: '1-Stage Polishing',
        entrada: 'Ideal for paint with light marks, loss of shine and small defects.',
        paragrafos: [
          '1-stage polishing significantly improves the finish of the paint, bringing back the shine and reducing small marks and imperfections.',
        ],
        items: [
          'Exterior wash',
          'Paint decontamination',
          'Surface preparation',
          '1-stage polishing',
          'Reduction of marks and surface scratches',
          'Shine recovery',
          'Paint finish and protection',
        ],
        nota: 'Suited to: vehicles whose paint is in good overall condition but lacks shine, with light wash marks or small defects.',
      },
      {
        heading: 'Advanced Paint Correction',
        entrada: 'A more complete service for paint with scratches, swirl marks, oxidation and more visible defects.',
        paragrafos: [
          'Several correction stages are carried out according to the condition of the paint, aiming to remove or significantly reduce the defects without compromising the safety of the clear coat.',
        ],
        items: [
          'Detailed exterior wash',
          'Paint decontamination',
          'Paint preparation and inspection',
          'Multi-stage correction',
          'Reduction of scratches and swirl marks',
          'Correction of oxidation and other defects where possible',
          'Paint refinement',
          'Shine and depth recovery',
          'Final protection',
        ],
        nota: 'Suited to: vehicles with more marked paint, visible scratches, swirls, oxidation, or for anyone after a deeper recovery of the finish.',
      },
      {
        heading: 'Which one to choose?',
        grupos: [
          { titulo: '1-Stage Polishing', items: ['To improve the shine and correct light defects.'] },
          { titulo: 'Advanced Correction', items: ['For more damaged paint that needs deeper correction.'] },
        ],
        nota: 'The recommended level of correction is set after assessing the condition of the vehicle’s paint.',
      },
      {
        heading: 'The result',
        paragrafos: [
          'A more even, glossy and cared-for paint finish, with fewer visible defects and the car’s finish restored.',
          'Book an assessment of your vehicle at Clean Station Car, in Braga.',
        ],
      },
      {
        heading: 'Related services',
        paragrafos: [
          'For yellowed or hazy headlights, see our [headlight polishing in Braga](/polimento-farois-braga/). To keep the result, our [car wash in Braga](/lavagem-automovel-braga/) or [car detailing in Braga](/detalhe-automovel-braga/).',
        ],
      },
    ],
    cta: 'Book an assessment',
    faq: [
      {
        q: 'How much does car polishing cost?',
        a: 'It depends on the condition of the paint and the level of correction needed, so it is quoted after we assess the vehicle.',
      },
      {
        q: 'Does polishing remove every scratch?',
        a: 'It removes or significantly reduces surface scratches, swirl marks and oxidation, without compromising the safety of the clear coat. The level of correction is set after we assess the paint.',
      },
      {
        q: 'How is 1-Stage Polishing different from Advanced Correction?',
        a: '1-Stage Polishing improves the shine and corrects light defects. Advanced Correction is done in several stages, for more damaged paint that needs deeper correction.',
      },
      {
        q: 'Does polishing include paint protection?',
        a: 'Yes. Both services finish with the paint finish and protection.',
      },
    ],
  },

  'polimento-farois-braga': {
    nome: 'Headlight Polishing',
    title: 'Headlight Polishing in Braga | Clean Station Car',
    description:
      'Headlight polishing in Braga: we restore yellowed, hazy or scratched '
      + 'headlights and rear lights, per pair. Quoted after we assess them.',
    h1: 'Headlight Polishing in Braga',
    intro: [
      'Over time headlights turn yellow, hazy and scratched: the car looks older and less light gets through at night.',
      'Headlight polishing removes oxidation and surface scratches and brings back their clarity. We do front headlights and rear lights, per pair.',
    ],
    sections: [
      {
        heading: 'Front headlights',
        entrada: 'Restores yellowed, hazy or scratched headlights, improving appearance and illumination.',
        items: [
          'Removes oxidation and haziness',
          'Eliminates surface scratches',
          'Improves light output',
          'Leaves headlights clear and like new',
        ],
      },
      {
        heading: 'Rear lights',
        entrada: 'Restores the original look of rear lights, removing haziness and surface scratches.',
        items: [
          'Removes wear and haziness',
          'Eliminates surface scratches',
          'Restores clarity',
          'Improves the look of the vehicle',
        ],
      },
      {
        heading: 'Why it is worth it',
        paragrafos: [
          'A hazy headlight scatters the light instead of projecting it. Restoring its clarity improves both the look of the car and visibility at night.',
          'The price depends on the condition of the headlights, so it is quoted after we see them.',
        ],
      },
      {
        heading: 'Related services',
        paragrafos: [
          'For the paint, see our [car polishing in Braga](/polimento-automovel-braga/). For a full treatment of the car, [car detailing in Braga](/detalhe-automovel-braga/).',
        ],
      },
    ],
    cta: 'Get a quote',
    faq: [
      {
        q: 'How much does headlight polishing cost?',
        a: 'It depends on the condition of the headlights and is quoted after we assess them.',
      },
      {
        q: 'Is headlight polishing priced per light?',
        a: 'Per pair: both front headlights, or both rear lights.',
      },
      {
        q: 'Does polishing fix yellowed headlights?',
        a: 'Yes. It removes the oxidation and haziness that turn headlights yellow, as well as surface scratches.',
      },
    ],
  },
};
