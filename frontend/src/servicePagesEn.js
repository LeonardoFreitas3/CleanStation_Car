// As páginas de serviço em inglês.
//
// Ficheiro à parte e não campos `xEn` espalhados pelo servicePages.js: aqui uma
// página inteira é um bloco de texto seguido, e quem traduz lê-o de uma vez em
// vez de saltar de linha em linha entre duas línguas. A componente escolhe o
// bloco pela língua e o resto — slug, preço, imagem — não muda.
//
// Os nomes dos serviços são os mesmos que o mock.js já usa em inglês (BASIC
// WASH, PREMIUM WASH, DETAILED WASH INTERIOR OR EXTERIOR, DETAILED WASH
// INTERIOR + EXTERIOR). Um site que chama
// "Basic Wash" a um cartão e "Simple Wash" à página do mesmo serviço parece
// dois sítios diferentes.
//
// O endereço inglês é o português com /en/ à frente (rotas.js): o slug não
// se traduz, e cada língua tem o seu canonical a apontar para a outra.

export const EN_PAGES = {
  'lavagem-automovel-braga': {
    nome: 'Basic Wash',
    title: 'Car Wash in Braga | Clean Station Car',
    description:
      'Car wash in Braga with manual interior and exterior cleaning and sealant. '
      + 'Complete wash from €35, with online booking at Clean Station Car.',
    h1: 'Car Wash in Braga',
    intro: [
      'A complete solution for keeping your vehicle in shape, with a manual exterior wash, careful interior cleaning and sealant on the paint.',
      'At Clean Station Car, every vehicle is treated individually, so both the inside and the outside get the same attention.',
    ],
    sections: [
      {
        heading: "What's included",
        grupos: [
          {
            titulo: 'Exterior',
            items: ['Pre-wash', 'Manual wash', 'Wheel cleaning', 'Window cleaning', 'Sealant applied to the paint'],
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
          'Around 1h30 on average for a car. SUVs, MPVs and large vans take longer, and the estimate is shown when you book.',
          'Vehicles that are dirtier than usual may need more time. When that happens, we always tell you beforehand.',
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
          'If you want a professional car wash in Braga with more protection or a more thorough interior, see the [Premium Wash](/lavagem-premium-braga/) and the [Detailed Wash Interior or Exterior](/lavagem-detalhada-interior-ou-exterior-braga/).',
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
        q: 'Can the price differ from the one shown?',
        a: 'The price depends on the type of vehicle: the "from" price is for a car, and SUVs, MPVs and large vans have their own price, shown when you book. Dirt beyond the normal may carry a supplement, always approved with you before the service. Prices include VAT.',
      },
      {
        q: 'Does the Basic Wash include sealant?',
        a: 'Yes. It includes a sealant applied to the paint, which adds shine, a hydrophobic effect and extra protection. It is a paint sealant, not a ceramic coating.',
      },
    ],
  },

  'lavagem-premium-braga': {
    nome: 'Premium Wash',
    title: 'Premium Car Wash in Braga | Clean Station Car',
    description:
      'Premium Wash in Braga with detailed interior and exterior cleaning, '
      + 'glass decontamination and premium paint protection. From €75.',
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
          'Premium sealant on the paint',
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
        heading: 'Premium sealant',
        entrada: 'A premium sealant is applied to the paint, giving:',
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
          'If the interior needs deep sanitising, with the seats removed, see the [Detailed Wash Interior + Exterior](/lavagem-detalhada-braga/).',
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
        a: 'Yes. A premium sealant is applied to the paint. It is a sealant, not a ceramic coating.',
      },
      {
        q: 'How is the Premium different from the Detailed Wash Interior + Exterior?',
        a: 'The Detailed Wash Interior + Exterior adds to the Premium the removal and sanitising of the seats, paint decontamination and deep cleaning of wheels and tyres.',
      },
    ],
  },

  'lavagem-detalhada-braga': {
    nome: 'Detailed Wash Interior + Exterior',
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
        entrada: 'On top of the full Premium Wash process, with its glass decontamination and premium sealant, we also carry out:',
        items: [
          'Paint decontamination',
          'Deep wheel cleaning',
          'Tyre cleaning',
        ],
      },
      {
        heading: 'How long it takes',
        paragrafos: ['Around 8 hours on average for a car. SUVs, MPVs and large vans take longer, and the estimate is shown when you book. It may vary with the condition of the vehicle.'],
      },
      {
        heading: 'Who it is for',
        paragrafos: [
          'For vehicles that need a deep clean, and for customers who want the highest level of care and detail on their car.',
          'It is especially suited to vehicles with built-up dirt, interiors that need deep sanitising, or cars that have not had a detailed treatment in a long time.',
          'The wash cleans and protects the paint, but it does not correct scratches or marks. For that, see our [car polishing in Braga](/polimento-automovel-braga/).',
        ],
      },
    ],
    cta: 'Book the Detailed Wash Interior + Exterior',
    faq: [
      {
        q: 'How long does the Detailed Wash Interior + Exterior take?',
        a: 'Around 8 hours on average for a car. SUVs, MPVs and large vans take longer, and the estimate is shown when you book.',
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
      {
        q: 'Can I have only the interior or only the exterior done?',
        a: 'Yes. The Detailed Wash Interior or Exterior does the same work, only on the area you choose when booking.',
      },
    ],
  },

  'lavagem-detalhada-interior-ou-exterior-braga': {
    nome: 'Detailed Wash Interior or Exterior',
    title: 'Detailed Wash Interior or Exterior in Braga | Clean Station Car',
    description:
      'Detailed car wash in Braga on the interior only, with seat removal and sanitising, '
      + 'or the exterior only, with paint decontamination. From €120.',
    h1: 'Detailed Wash Interior or Exterior in Braga',
    intro: [
      'The work of our Detailed Wash, only on the area you choose: the inside or the outside of the vehicle.',
      'Every area is worked on individually, including places a conventional clean cannot reach.',
    ],
    sections: [
      {
        heading: 'Interior or exterior',
        paragrafos: [
          'When booking you choose the area: Interior or Exterior. The service covers only the area you choose.',
          'For both areas, see the [Detailed Wash Interior + Exterior](/lavagem-detalhada-braga/).',
        ],
      },
      {
        heading: 'Interior',
        entrada: 'The detailed interior cleaning of the Premium Wash, plus:',
        items: [
          'Seat removal',
          'Deep sanitising of the seats',
          'Extremely detailed interior cleaning',
          'Access to and cleaning of areas that cannot be reached with the seats in place',
        ],
        nota: 'With the seats out, we can work the cabin far more deeply. The seats are sanitised individually and the areas that are normally hard to reach get a thorough clean.',
      },
      {
        heading: 'Exterior',
        entrada: 'The full exterior process of the Premium Wash, with its glass decontamination and premium sealant, plus:',
        items: [
          'Paint decontamination',
          'Deep wheel cleaning',
          'Tyre cleaning',
        ],
      },
      {
        heading: 'How long it takes',
        paragrafos: ['Around 4 hours on average for a car, for either area. SUVs, MPVs and large vans take longer, and the estimate is shown when you book.'],
      },
    ],
    cta: 'Book the Detailed Wash Interior or Exterior',
    faq: [
      {
        q: 'Does it include the interior and the exterior?',
        a: 'No. It covers only the area you choose when booking: interior or exterior. For both, there is the Detailed Wash Interior + Exterior.',
      },
      {
        q: 'How long does it take?',
        a: 'Around 4 hours on average for a car. SUVs, MPVs and large vans take longer, and the estimate is shown when you book.',
      },
      {
        q: 'Are the seats removed?',
        a: 'Yes, with the Interior option. The seats are removed so the cleaning and sanitising can go deeper.',
      },
      {
        q: 'Does the Exterior option include paint decontamination?',
        a: 'Yes. Paint decontamination is included in the Exterior option.',
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
      'This page brings together different treatments: the washes, with a set price, and polishing, which is a separate service quoted after we see the paint. No wash includes polishing.',
    ],
    sections: [
      {
        heading: 'What car detailing includes',
        grupos: [
          {
            titulo: 'In the Premium and Detailed washes',
            items: [
              'Detailed interior cleaning, including hard-to-reach areas',
              'Seat removal and deep sanitising (Detailed)',
              'Glass and paint decontamination (paint only in the Detailed)',
              'Deep cleaning of wheels and tyres (Detailed)',
              'Premium sealant on the paint',
            ],
          },
          {
            titulo: 'Booked separately',
            items: [
              '1-stage polishing',
              'Advanced paint correction',
              'Headlight polishing',
            ],
          },
        ],
      },
      {
        heading: 'Our car detailing services in Braga',
        paragrafos: [
          'The [Detailed Wash Interior + Exterior](/lavagem-detalhada-braga/) is our most complete service: the seats come out, the interior is deeply sanitised and the paint is decontaminated and protected.',
          'The [Detailed Wash Interior or Exterior](/lavagem-detalhada-interior-ou-exterior-braga/) does the same work, only on the area you choose.',
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
        a: 'For a car, the Detailed Wash Interior + Exterior takes around 8 hours on average, and the Interior or Exterior around 4 hours. SUVs, MPVs and large vans take longer, and the estimate is shown when you book.',
      },
      {
        q: 'How much does car detailing cost in Braga?',
        a: 'It depends on the service. Washes have a set price per vehicle type, VAT included; polishing is booked separately, with a "from" price, and the final price is quoted after we assess the paint.',
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
      'We clean car interiors in Braga at three levels: the maintenance clean of the Basic Wash, the detailed interior cleaning of the Premium, and the sanitising with seat removal of the Detailed.',
      'Our washes include interior cleaning, except the Detailed done on the exterior only; what changes between them is how deep the work goes. Only the Detailed removes the seats.',
    ],
    sections: [
      {
        heading: 'What interior cleaning includes',
        grupos: [
          {
            titulo: 'Maintenance · Basic',
            items: [
              'Vacuuming of carpets, floor mats and boot',
              'Dashboard cleaning',
              'Clean windows',
            ],
          },
          {
            titulo: 'Detailed cleaning · Premium',
            items: [
              'Everything in the maintenance clean, with deeper vacuuming',
              'Cleaning of air vents, controls and door pockets',
              'Centre console and gaps between the seats',
              'Hard-to-reach areas',
            ],
          },
          {
            titulo: 'Sanitising · Detailed',
            items: [
              'Everything in the detailed cleaning',
              'Seat removal',
              'Deep sanitising of the seats, one by one',
              'Cleaning of the areas unreachable with the seats in place',
            ],
          },
        ],
      },
      {
        heading: 'Car sanitising and upholstery cleaning',
        paragrafos: [
          'In the [Detailed Wash Interior + Exterior](/lavagem-detalhada-braga/), and in the [Detailed Wash Interior or Exterior](/lavagem-detalhada-interior-ou-exterior-braga/) with the Interior option, the seats are removed and sanitised one by one. That is how seats and upholstery get a proper deep clean, and how we reach the parts of the cabin hidden with the seats in place.',
          'It suits interiors with built-up dirt, or ones that have not had a detailed treatment in a long time.',
        ],
      },
      {
        heading: 'Which service to choose',
        paragrafos: [
          'For regular upkeep, the [Basic Wash](/lavagem-automovel-braga/) includes interior vacuuming and cleaning.',
          'For a more thorough interior, the [Premium Wash](/lavagem-premium-braga/) works the air vents, controls, door pockets and gaps between seats.',
          'For the most complete interior clean, with seat removal, the [Detailed Wash Interior or Exterior](/lavagem-detalhada-interior-ou-exterior-braga/) with the Interior option, or the [Detailed Wash Interior + Exterior](/lavagem-detalhada-braga/) if you also want the exterior.',
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
        a: 'Yes. In the Detailed Wash Interior + Exterior, and in the Detailed Wash Interior or Exterior with the Interior option, the seats are removed and sanitised one by one. The other washes clean the interior without removing the seats.',
      },
      {
        q: 'Do all washes include interior cleaning?',
        a: 'The Basic, the Premium and the Detailed Wash Interior + Exterior include interior and exterior cleaning; the Detailed Wash Interior or Exterior covers only the area you choose. The difference is the level of detail.',
      },
      {
        q: 'How long does interior cleaning take?',
        a: 'It depends on the service chosen and the condition of the vehicle. An estimated duration is shown when you book.',
      },
    ],
  },

  'polimento-automovel-braga': {
    nome: 'Car Polishing',
    ctaTexto: 'Send us a message on WhatsApp. We assess the paint and give you a quote.',
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
        nota: 'Includes a detailed exterior wash. See everything it includes in [1-Stage Polishing in Braga](/polimento-1-etapa-braga/).',
      },
      {
        heading: 'Advanced Correction Polishing',
        entrada: 'A more complete service for paint with scratches, swirl marks, oxidation and more visible defects.',
        paragrafos: [
          'Several correction stages are carried out according to the condition of the paint, aiming to remove or significantly reduce the defects without compromising the safety of the clear coat.',
        ],
        nota: 'Includes a detailed exterior wash. See everything it includes in [Advanced Paint Correction in Braga](/correcao-pintura-braga/).',
      },
      {
        id: 'comparar',
        heading: 'Which one to choose?',
        comparacao: {
          colunas: [
            { titulo: '1-Stage Polishing' },
            { titulo: 'Advanced Correction' },
          ],
          linhas: [
            { rotulo: 'Suited to', valores: ['Paint in good overall condition that lacks shine or has light wash marks', 'More marked paint, with visible scratches, swirls or oxidation'] },
            { rotulo: 'Defects it treats', valores: ['Light marks, loss of shine and small defects', 'Scratches, swirl marks, oxidation and more visible defects'] },
            { rotulo: 'Correction stages', valores: ['One', 'Several, according to the condition of the paint'] },
            { rotulo: 'Result', valores: ['More shine and colour depth, with light marks softened', 'More visible defects reduced or removed, as far as the clear coat allows'] },
            { rotulo: 'Includes', valores: ['Detailed exterior wash, decontamination, polishing, finish and protection', 'Detailed exterior wash, decontamination, multi-stage correction, refinement and final protection'] },
          ],
        },
        nota: 'The recommended level of correction is set after assessing the condition of the vehicle’s paint.',
      },
      {
        heading: 'The result',
        paragrafos: [
          'With 1-Stage Polishing: more shine and light marks softened. With Advanced Correction: more visible defects reduced or removed, as far as the clear coat allows. No polishing removes every scratch, and what can be corrected is explained before we start.',
          'Book an assessment of your vehicle at Clean Station Car, in Braga.',
        ],
      },
      {
        heading: 'Related services',
        paragrafos: [
          'To protect the paint once it has been corrected, see our [ceramic protection in Braga](/protecao-ceramica-braga/).',
          'For yellowed or hazy headlights, see our [headlight polishing in Braga](/polimento-farois-braga/). To keep the result, our [car wash in Braga](/lavagem-automovel-braga/) or [car detailing in Braga](/detalhe-automovel-braga/).',
        ],
      },
    ],
    cta: 'Get a quote on WhatsApp',
    faq: [
      {
        q: 'How much does car polishing cost?',
        a: 'From 250 € for 1-Stage Polishing and from 350 € for Advanced Correction Polishing. The final price depends on the condition of the paint and the level of correction needed, so it is quoted after we assess the vehicle.',
      },
      {
        q: 'Does polishing remove every scratch?',
        a: 'No. It reduces or removes surface scratches, swirl marks and oxidation as far as the clear coat allows; a scratch that reaches the colour or the primer will not polish out. The level of correction is set after we assess the paint.',
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

  'polimento-1-etapa-braga': {
    nome: '1-Stage Polishing',
    ctaTexto: 'Send us a message on WhatsApp. We assess the paint and give you a quote.',
    title: '1-Stage Car Polishing in Braga | Clean Station Car',
    description:
      '1-stage polishing in Braga for paint with light marks and loss of shine: '
      + 'wash, decontamination, polishing and protection. Quoted after assessment.',
    h1: '1-Stage Polishing in Braga',
    intro: [
      'Ideal for paint with light marks, loss of shine and small defects.',
      '1-stage polishing significantly improves the finish of the paint, bringing back the shine and reducing small marks and imperfections.',
    ],
    sections: [
      {
        heading: "What's included",
        items: [
          'Detailed exterior wash',
          'Paint decontamination',
          'Surface preparation',
          '1-stage polishing',
          'Reduction of marks and surface scratches',
          'Shine recovery',
          'Paint finish and protection',
        ],
        nota: 'Includes a detailed exterior wash.',
      },
      {
        heading: 'Who it is for',
        paragrafos: [
          'Vehicles whose paint is in good overall condition but lacks shine, with light wash marks or small defects.',
        ],
      },
      {
        heading: 'The result',
        paragrafos: [
          'More shine and colour depth, with light marks softened. It is not a deep correction: more visible scratches call for the Advanced Correction.',
          'The recommended level of correction is set after assessing the condition of the vehicle’s paint.',
        ],
      },
      {
        heading: 'Other polishing services',
        paragrafos: [
          'For more damaged paint, with visible scratches, swirls or oxidation, see [Advanced Paint Correction in Braga](/correcao-pintura-braga/). All our polishing in [Car Polishing in Braga](/polimento-automovel-braga/).',
          'To protect the paint after polishing, see our [ceramic protection in Braga](/protecao-ceramica-braga/).',
        ],
      },
    ],
    cta: 'Get a quote on WhatsApp',
    faq: [
      {
        q: 'What kind of paint is 1-Stage Polishing for?',
        a: 'Paint in good overall condition that lacks shine, with light wash marks or small defects.',
      },
      {
        q: 'Does 1-Stage Polishing include decontamination?',
        a: 'Yes. It includes a detailed exterior wash, paint decontamination and surface preparation before polishing.',
      },
      {
        q: 'How much does 1-Stage Polishing cost?',
        a: 'From 250 €. The final price is quoted after we assess the condition of the paint.',
      },
    ],
  },

  'correcao-pintura-braga': {
    nome: 'Advanced Correction Polishing',
    ctaTexto: 'Send us a message on WhatsApp. We assess the paint and give you a quote.',
    title: 'Advanced Paint Correction in Braga | Clean Station Car',
    description:
      'Advanced paint correction in Braga: multi-stage polishing for scratches, swirls '
      + 'and oxidation, with decontamination and final protection. Quoted after assessment.',
    h1: 'Advanced Paint Correction in Braga',
    intro: [
      'A more complete service for paint with scratches, swirl marks, oxidation and more visible defects.',
      'Several correction stages are carried out according to the condition of the paint, aiming to remove or significantly reduce the defects without compromising the safety of the clear coat.',
    ],
    sections: [
      {
        heading: "What's included",
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
        nota: 'Includes a detailed exterior wash.',
      },
      {
        heading: 'Who it is for',
        paragrafos: [
          'Vehicles with more marked paint, visible scratches, swirls, oxidation, or anyone after a deeper recovery of the finish.',
        ],
      },
      {
        heading: 'The result',
        paragrafos: [
          'More visible defects reduced or removed, as far as the clear coat allows — the correction always respects the thickness of the clear coat, and what can be corrected is assessed before we start.',
          'The recommended level of correction is set after assessing the condition of the vehicle’s paint.',
        ],
      },
      {
        heading: 'Other polishing services',
        paragrafos: [
          'To improve the shine and correct light defects, see [1-Stage Polishing in Braga](/polimento-1-etapa-braga/). All our polishing in [Car Polishing in Braga](/polimento-automovel-braga/).',
          'To protect the paint after the correction, see our [ceramic protection in Braga](/protecao-ceramica-braga/).',
        ],
      },
    ],
    cta: 'Get a quote on WhatsApp',
    faq: [
      {
        q: 'When is advanced correction needed?',
        a: 'When the paint has visible scratches, swirl marks, oxidation or more visible defects.',
      },
      {
        q: 'Does advanced correction remove every scratch?',
        a: 'It aims to remove or significantly reduce the defects without compromising the safety of the clear coat. What can be corrected is assessed before we start.',
      },
      {
        q: 'How much does advanced paint correction cost?',
        a: 'From 350 €. The final price is quoted after we assess the condition of the paint.',
      },
    ],
  },

  'polimento-farois-braga': {
    nome: 'Headlight Polishing',
    ctaTexto: 'Send us a message on WhatsApp. We assess the condition of the headlights and give you a quote.',
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
        id: 'dianteiros',
        heading: 'Front headlights',
        entrada: 'Restores yellowed, hazy or scratched headlights, improving appearance and illumination.',
        items: [
          'Removes oxidation and haziness',
          'Softens surface scratches',
          'Improves light output',
          'Restores clarity',
        ],
      },
      {
        id: 'traseiros',
        heading: 'Rear lights',
        entrada: 'Restores the look of rear lights, removing haziness and surface scratches.',
        items: [
          'Removes wear and haziness',
          'Softens surface scratches',
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
        a: 'From 55 € for a pair of front headlights and from 40 € for a pair of rear lights. The final price depends on the condition of the headlights and is quoted after we assess them.',
      },
      {
        q: 'Is headlight polishing priced per light?',
        a: 'Per pair: both front headlights, or both rear lights.',
      },
      {
        q: 'Does polishing fix yellowed headlights?',
        a: 'In most cases, yes. It removes the oxidation and haziness that turn headlights yellow and softens surface scratches. A cracked headlight, or one hazy on the inside, is assessed first.',
      },
    ],
  },

  'protecao-ceramica-braga': {
    nome: 'Professional Ceramic Protection',
    ctaTexto: 'Send us a message on WhatsApp. We assess the condition of the vehicle and give you a quote.',
    title: 'Ceramic Protection in Braga | Clean Station Car',
    description:
      'Professional ceramic protection in Braga: a durable protective layer over the paint, '
      + 'with more shine and a water-repellent effect. From €250.',
    h1: 'Ceramic Protection in Braga',
    intro: [
      'A durable protective layer applied over the paint that creates a barrier against external damage.',
    ],
    sections: [
      {
        heading: 'What ceramic protection is',
        paragrafos: [
          'It is a layer applied over the paint that acts as a barrier against UV rays, dirt and chemicals. The paint gains shine, repels water and the car becomes easier to clean.',
          'It protects the paint, but it does not make it scratch-proof.',
        ],
      },
      {
        heading: "What's included",
        items: [
          'Protection against UV rays',
          'Protection against dirt and chemicals',
          'Protection against minor surface scratches',
          'More intense shine and water-repellent effect',
          'Paint protected for much longer',
          'Easier to clean the car',
        ],
      },
      {
        heading: 'Ceramic protection or sealant?',
        paragrafos: [
          'Sealant is the protection our washes apply to the paint: it adds shine, a hydrophobic effect and extra protection. It comes with the [Basic Wash](/lavagem-automovel-braga/) and, in a premium version, with the [Premium Wash](/lavagem-premium-braga/).',
          'Ceramic protection is a separate service, with a layer designed to protect the paint for much longer.',
        ],
      },
      {
        heading: 'Related services',
        paragrafos: [
          'See also our [car polishing in Braga](/polimento-automovel-braga/) and [car detailing in Braga](/detalhe-automovel-braga/).',
        ],
      },
    ],
    cta: 'Get a quote on WhatsApp',
    faq: [
      {
        q: 'How much does ceramic protection cost?',
        a: 'From 250 €. The final price depends on assessing the condition of the vehicle.',
      },
      {
        q: 'Can ceramic protection be booked online?',
        a: 'No. Send us a message on WhatsApp or give us a call, and we will arrange it with you.',
      },
      {
        q: 'Is the sealant in the washes a ceramic protection?',
        a: 'No. The washes use a paint sealant; ceramic protection is a separate service.',
      },
    ],
  },
};
