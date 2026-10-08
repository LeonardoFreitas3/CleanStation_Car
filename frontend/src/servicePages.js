// As páginas de cada serviço.
//
// Texto escrito pelo dono da oficina, não gerado: é ele que sabe o que se faz a
// um carro. Está aqui em dados e não em JSX porque as páginas são a
// mesma página com conteúdo diferente — uma só componente desenha-as todas, e
// mudar uma frase não obriga a mexer em marcação nenhuma.
//
// O preço NÃO se escreve aqui. Vem do pricing.js, que é a mesma tabela que o
// formulário de marcação usa: uma página a anunciar 30€ e o formulário a
// cobrar 35€ é a maneira mais rápida de perder a confiança de quem marcou.
//
// A descrição curta que a marcação mostra vive no pricing.js (o `desc` de cada
// nível), de propósito: quem está a escolher quer uma linha, não uma página.

import { LEVEL_BY_ID } from './booking/pricing';
import SEO from './paginasSeo.json';
import { EN_PAGES } from './servicePagesEn';

/**
 * Uma secção é sempre a mesma forma: um título, e depois uma frase de entrada,
 * uma lista, ou parágrafos — os que existirem. Sem isto cada página inventava a
 * sua própria estrutura e a componente virava um monte de casos especiais.
 */
const PAGINAS = [
  {
    slug: 'lavagem-automovel-braga',
    levelId: 'simples',
    // O cartao da pagina inicial que leva aqui. Escrito e nao deduzido do
    // levelId: um id que se muda em silencio partia o link sem dar erro, e o
    // teste do servicePages confirma que este existe mesmo no mock.
    serviceId: 'lavagem-simples',
    h1: 'Lavagem Automóvel em Braga',
    intro: [
      'Uma solução completa para a manutenção do seu veículo, com limpeza manual do exterior e cuidado do interior.',
      'Na Clean Station Car, cada veículo é tratado individualmente, garantindo uma limpeza cuidada tanto no interior como no exterior.',
    ],
    sections: [
      {
        heading: 'O que está incluído',
        grupos: [
          {
            titulo: 'Exterior',
            items: ['Pré-lavagem', 'Lavagem manual', 'Limpeza das jantes', 'Limpeza dos vidros'],
          },
          {
            titulo: 'Interior',
            items: [
              'Aspiração das alcatifas',
              'Aspiração dos tapetes',
              'Limpeza do tablier',
              'Aspiração e limpeza da mala',
            ],
          },
        ],
      },
      {
        heading: 'Para quem é indicada',
        paragrafos: [
          'Indicada para veículos com um nível de sujidade normal que necessitam de uma limpeza completa de manutenção interior e exterior.',
        ],
      },
      {
        heading: 'Duração',
        paragrafos: [
          'A duração média é de aproximadamente 1h30.',
          'Em veículos que apresentem um nível de sujidade superior ao normal, o serviço poderá necessitar de mais tempo. Nestes casos, o cliente será sempre informado previamente.',
        ],
      },
      {
        heading: 'Sujidade fora do normal',
        paragrafos: [
          'Situações como uma quantidade elevada de pelos de animais, excesso de areia ou outro tipo de sujidade que exija trabalho adicional poderão ter um custo extra.',
          'Qualquer valor adicional será sempre comunicado ao cliente e aprovado previamente.',
        ],
      },
      {
        heading: 'Lavagem profissional automóvel em Braga',
        paragrafos: [
          'Fazemos a lavagem de carros em Braga à mão, viatura a viatura: uma lavagem interior e exterior com o mesmo cuidado por dentro e por fora.',
          'Se procura uma lavagem profissional automóvel em Braga com mais proteção ou um interior mais minucioso, veja a [Lavagem com Selante](/lavagem-com-selante-braga/) e a [Lavagem Premium](/lavagem-premium-braga/).',
          'Para um cuidado mais completo, conheça o nosso [detalhe automóvel em Braga](/detalhe-automovel-braga/).',
        ],
      },
    ],
    cta: 'Marcar Lavagem Simples',
    faq: [
      {
        q: 'Quanto tempo demora a Lavagem Simples?',
        a: 'Em média, cerca de 1h30, dependendo do estado do veículo.',
      },
      {
        q: 'A Lavagem Simples inclui interior e exterior?',
        a: 'Sim. O serviço inclui limpeza interior e exterior.',
      },
      {
        q: 'O preço pode aumentar?',
        a: 'Apenas quando o veículo apresenta uma quantidade de sujidade significativamente superior ao normal. Qualquer valor adicional é comunicado previamente.',
      },
      {
        q: 'Qual é a diferença para a Lavagem com Selante?',
        a: 'A Lavagem com Selante inclui também uma proteção aplicada na pintura do veículo.',
      },
    ],
  },

  {
    slug: 'lavagem-com-selante-braga',
    levelId: 'selante',
    // O cartao da pagina inicial que leva aqui. Escrito e nao deduzido do
    // levelId: um id que se muda em silencio partia o link sem dar erro, e o
    // teste do servicePages confirma que este existe mesmo no mock.
    serviceId: 'lavagem-selante',
    h1: 'Lavagem Automóvel com Selante em Braga',
    intro: [
      'Para além de uma limpeza completa interior e exterior, este serviço acrescenta uma camada de proteção à pintura do veículo.',
      'O selante proporciona mais brilho, repelência à água e proteção da pintura, tornando-o uma opção indicada para quem pretende manter o veículo limpo e protegido durante mais tempo.',
    ],
    sections: [
      {
        heading: 'O que está incluído',
        entrada: 'Inclui tudo o que está presente na Lavagem Simples, acrescentando:',
        items: [
          'Aplicação de selante na pintura',
          'Maior brilho',
          'Efeito hidrofóbico',
          'Proteção adicional da pintura',
        ],
      },
      {
        heading: 'Duração',
        paragrafos: ['Aproximadamente 1h45, dependendo do estado do veículo.'],
      },
      {
        heading: 'Sujidade fora do normal',
        paragrafos: [
          'Tal como na Lavagem Simples, situações como excesso de pelos de animais, areia ou sujidade fora do normal poderão implicar um custo adicional, sempre comunicado previamente.',
        ],
      },
    ],
    cta: 'Marcar Lavagem com Selante',
    faq: [
      {
        q: 'O que é o selante?',
        a: 'É uma proteção aplicada sobre a pintura que ajuda a aumentar o brilho, a repelência à água e a proteção da superfície.',
      },
      {
        q: 'A Lavagem com Selante inclui limpeza interior?',
        a: 'Sim. Inclui a limpeza interior e exterior da Lavagem Simples.',
      },
      {
        q: 'Quanto tempo dura a proteção?',
        a: 'A duração varia de acordo com a utilização, condições ambientais e manutenção do veículo. Por isso, não queremos apresentar uma duração fixa como garantia.',
      },
    ],
  },

  {
    slug: 'lavagem-premium-braga',
    levelId: 'premium',
    // O cartao da pagina inicial que leva aqui. Escrito e nao deduzido do
    // levelId: um id que se muda em silencio partia o link sem dar erro, e o
    // teste do servicePages confirma que este existe mesmo no mock.
    serviceId: 'lavagem-premium',
    h1: 'Lavagem Premium de Automóveis em Braga',
    intro: [
      'Um serviço pensado para quem procura um nível de limpeza superior ao de uma lavagem convencional.',
      'A Lavagem Premium combina uma limpeza interior mais minuciosa, atenção aos detalhes e proteção da pintura, proporcionando um resultado mais completo e cuidado.',
    ],
    sections: [
      {
        heading: 'O que está incluído',
        entrada: 'Inclui tudo o que está presente na Lavagem Simples, acrescentando:',
        items: [
          'Descontaminação dos vidros',
          'Proteção premium da pintura',
          'Aspiração mais profunda',
          'Limpeza detalhada do interior',
          'Limpeza de zonas de difícil acesso',
        ],
      },
      {
        heading: 'Limpeza detalhada do interior',
        entrada: 'É dada especial atenção a zonas que normalmente ficam esquecidas numa lavagem convencional, como:',
        items: [
          'Saídas de ar',
          'Comandos',
          'Bolsas das portas',
          'Consola central',
          'Espaços entre bancos',
          'Outras zonas de difícil acesso',
        ],
      },
      {
        heading: 'Proteção da pintura',
        entrada: 'Aplicação de uma proteção premium que proporciona:',
        items: [
          'Maior brilho',
          'Maior profundidade visual da pintura',
          'Efeito hidrofóbico',
          'Proteção adicional',
        ],
      },
      {
        heading: 'Duração',
        paragrafos: ['A duração média é de aproximadamente 4 horas, dependendo do estado do veículo.'],
      },
      {
        heading: 'Para quem é indicada',
        paragrafos: [
          'Indicada para todo o tipo de veículos e para clientes que procuram uma limpeza mais profunda e detalhada, sem necessidade de recorrer ao serviço de detalhe completo.',
        ],
      },
    ],
    cta: 'Marcar Lavagem Premium',
    faq: [
      {
        q: 'Quanto tempo demora a Lavagem Premium?',
        a: 'Em média, aproximadamente 4 horas, dependendo do estado do veículo.',
      },
      {
        q: 'A Lavagem Premium inclui interior e exterior?',
        a: 'Sim. O serviço é realizado tanto no interior como no exterior.',
      },
      {
        q: 'A Lavagem Premium inclui proteção da pintura?',
        a: 'Sim. É aplicada uma proteção premium na pintura.',
      },
      {
        q: 'Qual é a diferença entre a Premium e a Detalhada?',
        a: 'A Lavagem Detalhada é um serviço significativamente mais profundo, incluindo a remoção dos bancos, higienização profunda e descontaminação da pintura.',
      },
    ],
  },

  {
    slug: 'lavagem-detalhada-braga',
    levelId: 'detalhada',
    // O cartao da pagina inicial que leva aqui. Escrito e nao deduzido do
    // levelId: um id que se muda em silencio partia o link sem dar erro, e o
    // teste do servicePages confirma que este existe mesmo no mock.
    serviceId: 'lavagem-detalhada',
    h1: 'Lavagem Detalhada de Automóveis em Braga',
    intro: [
      'O nosso serviço mais completo de limpeza automóvel, desenvolvido para uma recuperação profunda do interior e exterior do veículo.',
      'Cada zona é trabalhada individualmente, incluindo áreas que não são acessíveis numa limpeza convencional.',
    ],
    sections: [
      {
        heading: 'O que está incluído',
        entrada: 'Inclui tudo o que está presente na Lavagem Premium, acrescentando:',
        items: [
          'Remoção dos bancos',
          'Higienização profunda dos bancos',
          'Descontaminação da pintura',
          'Limpeza profunda de jantes e pneus',
          'Limpeza extremamente detalhada do interior',
          'Acesso e limpeza de zonas normalmente inacessíveis com os bancos montados',
        ],
      },
      {
        heading: 'Interior',
        paragrafos: [
          'Com os bancos removidos, conseguimos trabalhar de forma muito mais profunda as áreas do habitáculo.',
          'Os bancos são higienizados individualmente e é realizada uma limpeza aprofundada das zonas normalmente difíceis de alcançar.',
        ],
      },
      {
        heading: 'Exterior',
        entrada: 'Além do processo completo da Lavagem Premium, é realizada:',
        items: [
          'Descontaminação da pintura',
          'Limpeza profunda das jantes',
          'Limpeza dos pneus',
          'Descontaminação dos vidros',
          'Proteção da pintura',
        ],
      },
      {
        heading: 'Duração',
        paragrafos: ['A duração média é de 1 dia, podendo variar de acordo com o estado e dimensão do veículo.'],
      },
      {
        heading: 'Para quem é indicada',
        paragrafos: [
          'Indicada para veículos que necessitam de uma limpeza profunda e para clientes que procuram o nível máximo de cuidado e detalhe na limpeza do seu veículo.',
          'É especialmente indicada para veículos com sujidade acumulada, interiores que necessitam de uma higienização profunda ou veículos que não recebem um tratamento detalhado há bastante tempo.',
        ],
      },
    ],
    cta: 'Marcar Lavagem Detalhada',
    faq: [
      {
        q: 'Quanto tempo demora uma Lavagem Detalhada?',
        a: 'Em média, um dia de trabalho, podendo variar de acordo com o estado e dimensão do veículo.',
      },
      {
        q: 'Os bancos são realmente removidos?',
        a: 'Sim. Os bancos são removidos para permitir uma limpeza e higienização mais profundas.',
      },
      {
        q: 'A Lavagem Detalhada inclui descontaminação da pintura?',
        a: 'Sim. A descontaminação da pintura está incluída neste serviço.',
      },
      {
        q: 'Qual é a diferença entre a Premium e a Detalhada?',
        a: 'A Detalhada acrescenta um nível de intervenção muito superior, incluindo a remoção dos bancos, higienização profunda, descontaminação da pintura e limpeza profunda de jantes e pneus.',
      },
    ],
  },

  // ── Páginas sem nível de lavagem ──────────────────────────────────────────
  //
  // Sem levelId nem serviceId: não são um preço da tabela nem um cartão da
  // página inicial, são o que se procura no Google ("detalhe automóvel braga")
  // explicado com os serviços que de facto se vendem. Sem levelId não mostram
  // preço — o detalhe e a limpeza interior são vários serviços com preços
  // diferentes, e o polimento é orçamentado à vista.
  {
    slug: 'detalhe-automovel-braga',
    nome: 'Detalhe Automóvel',
    h1: 'Detalhe Automóvel em Braga',
    intro: [
      'O detalhe automóvel vai além de uma lavagem: é o trabalho minucioso de limpar, recuperar e proteger cada parte do veículo, por dentro e por fora.',
      'Na Clean Station Car fazemos detailing em Braga com tempo e atenção a cada viatura — da limpeza profunda do interior à descontaminação, ao polimento e à proteção da pintura.',
    ],
    sections: [
      {
        heading: 'O que inclui o detalhe automóvel',
        items: [
          'Limpeza detalhada do interior, incluindo zonas de difícil acesso',
          'Remoção e higienização profunda dos bancos',
          'Descontaminação da pintura e dos vidros',
          'Limpeza profunda de jantes e pneus',
          'Polimento e correção da pintura',
          'Proteção da pintura',
        ],
      },
      {
        heading: 'Os nossos serviços de car detailing em Braga',
        paragrafos: [
          'A [Lavagem Detalhada](/lavagem-detalhada-braga/) é o nosso serviço mais completo: os bancos são removidos, o interior é higienizado a fundo e a pintura é descontaminada e protegida.',
          'A [Lavagem Premium](/lavagem-premium-braga/) é indicada para quem quer um nível de limpeza acima de uma lavagem convencional, com descontaminação dos vidros e proteção premium da pintura.',
          'Para riscos, hologramas e pintura sem brilho, o [polimento automóvel](/polimento-automovel-braga/) recupera a pintura antes de a proteger.',
          'Para faróis amarelados ou opacos, o [polimento de faróis](/polimento-farois-braga/).',
        ],
      },
      {
        heading: 'Estética automóvel com atenção ao detalhe',
        paragrafos: [
          'Analisamos o estado de cada veículo antes de começar, para definir o tratamento certo. Se for preciso trabalho adicional, o cliente é sempre informado antes.',
          'Para uma limpeza mais profunda, consulte o nosso serviço de [limpeza interior automóvel em Braga](/limpeza-interior-automovel-braga/).',
        ],
      },
    ],
    cta: 'Marcar serviço',
    faq: [
      {
        q: 'O que é o detalhe automóvel?',
        a: 'É uma limpeza e recuperação minuciosa do veículo, por dentro e por fora, que chega a zonas que uma lavagem convencional não alcança. Pode incluir descontaminação, polimento e proteção da pintura.',
      },
      {
        q: 'Qual é a diferença entre detalhe e lavagem?',
        a: 'Uma lavagem mantém o carro limpo. O detalhe trabalha cada zona em profundidade, com remoção dos bancos, higienização profunda e descontaminação da pintura.',
      },
      {
        q: 'Quanto tempo demora o detalhe automóvel?',
        a: 'A Lavagem Detalhada demora em média um dia, podendo variar de acordo com o estado e a dimensão do veículo.',
      },
      {
        q: 'Quanto custa o detalhe automóvel em Braga?',
        a: 'Depende do serviço. As lavagens têm preço de tabela por tipo de veículo; os polimentos são orçamentados depois de avaliarmos a pintura.',
      },
    ],
  },

  {
    slug: 'limpeza-interior-automovel-braga',
    nome: 'Limpeza Interior',
    h1: 'Limpeza Interior Automóvel em Braga',
    intro: [
      'Fazemos a limpeza interior automóvel em Braga com aspiração, limpeza do tablier e das zonas de difícil acesso e, no serviço mais completo, higienização profunda dos bancos.',
      'Todas as nossas lavagens incluem a limpeza interior do carro; o que muda entre elas é a profundidade do trabalho.',
    ],
    sections: [
      {
        heading: 'O que inclui a limpeza interior',
        items: [
          'Aspiração das alcatifas, dos tapetes e da mala',
          'Limpeza do tablier e da consola central',
          'Limpeza das saídas de ar, comandos e bolsas das portas',
          'Limpeza dos espaços entre bancos e de zonas de difícil acesso',
          'Remoção e higienização profunda dos bancos',
        ],
      },
      {
        heading: 'Higienização automóvel e limpeza de estofos',
        paragrafos: [
          'Na [Lavagem Detalhada](/lavagem-detalhada-braga/) os bancos são removidos e higienizados individualmente. É assim que se faz a limpeza dos bancos do carro e dos estofos a fundo, e se chega às zonas do habitáculo escondidas com os bancos montados.',
          'É indicada para interiores com sujidade acumulada, ou que não recebem um tratamento detalhado há bastante tempo.',
        ],
      },
      {
        heading: 'Que serviço escolher',
        paragrafos: [
          'Para a manutenção regular, a [Lavagem Simples](/lavagem-automovel-braga/) inclui a aspiração e a limpeza do interior.',
          'Para um interior mais minucioso, a [Lavagem Premium](/lavagem-premium-braga/) trabalha as saídas de ar, os comandos, as bolsas das portas e os espaços entre bancos.',
          'Para a limpeza interior mais completa, com remoção dos bancos, a [Lavagem Detalhada](/lavagem-detalhada-braga/).',
        ],
      },
      {
        heading: 'Pelos de animais e sujidade fora do normal',
        paragrafos: [
          'Uma quantidade elevada de pelos de animais, excesso de areia ou outra sujidade que exija trabalho adicional poderá ter um custo extra, sempre comunicado e aprovado previamente.',
          'Conheça também o nosso [polimento automóvel em Braga](/polimento-automovel-braga/).',
        ],
      },
    ],
    cta: 'Marcar limpeza',
    faq: [
      {
        q: 'Fazem limpeza de bancos e estofos?',
        a: 'Sim. Na Lavagem Detalhada os bancos são removidos e higienizados individualmente.',
      },
      {
        q: 'Todas as lavagens incluem limpeza interior?',
        a: 'Sim. Todas as nossas lavagens incluem limpeza interior e exterior; a diferença está no nível de detalhe.',
      },
      {
        q: 'Quanto tempo demora a limpeza interior?',
        a: 'Depende do serviço escolhido e do estado da viatura. No momento da marcação é apresentada uma estimativa de duração.',
      },
    ],
  },

  {
    slug: 'polimento-automovel-braga',
    nome: 'Polimento Automóvel',
    // Os polimentos não se marcam online: o botão abre o WhatsApp, como a
    // ficha deles na página inicial.
    whatsapp: true,
    h1: 'Polimento Automóvel em Braga',
    intro: [
      'Recupere o brilho e melhore o aspeto da pintura do seu automóvel com um serviço de polimento profissional. Na Clean Station Car, avaliamos o estado da pintura e aplicamos o nível de correção mais adequado ao veículo.',
    ],
    sections: [
      {
        heading: 'Polimento 1 Etapa',
        entrada: 'Ideal para pinturas com marcas ligeiras, perda de brilho e pequenos defeitos.',
        paragrafos: [
          'O polimento de 1 etapa permite melhorar significativamente o acabamento da pintura, recuperando o brilho e reduzindo pequenas marcas e imperfeições.',
        ],
        nota: 'Veja tudo o que inclui no [Polimento 1 Etapa em Braga](/polimento-1-etapa-braga/).',
      },
      {
        heading: 'Correção Avançada de Pintura',
        entrada: 'Um serviço mais completo para pinturas com riscos, marcas circulares, oxidação e defeitos mais evidentes.',
        paragrafos: [
          'São realizadas várias etapas de correção de acordo com o estado da pintura, procurando remover ou reduzir significativamente os defeitos sem comprometer a segurança do verniz.',
        ],
        nota: 'Veja tudo o que inclui na [Correção Avançada de Pintura em Braga](/correcao-pintura-braga/).',
      },
      {
        heading: 'Qual escolher?',
        grupos: [
          { titulo: 'Polimento 1 Etapa', items: ['Para melhorar o brilho e corrigir defeitos ligeiros.'] },
          { titulo: 'Correção Avançada', items: ['Para pinturas mais danificadas que necessitam de uma correção mais profunda.'] },
        ],
        nota: 'O nível de correção recomendado é definido após avaliação do estado da pintura do veículo.',
      },
      {
        heading: 'Resultado',
        paragrafos: [
          'Uma pintura mais uniforme, brilhante e cuidada, com redução dos defeitos visíveis e recuperação do acabamento do automóvel.',
          'Marque uma avaliação do seu veículo na Clean Station Car, em Braga.',
        ],
      },
      // Fora do texto do dono: são os links que ligam esta página às outras.
      {
        heading: 'Serviços relacionados',
        paragrafos: [
          'Para faróis amarelados ou opacos, veja o nosso [polimento de faróis em Braga](/polimento-farois-braga/). Para manter o resultado, a [lavagem automóvel em Braga](/lavagem-automovel-braga/) ou o [detalhe automóvel em Braga](/detalhe-automovel-braga/).',
        ],
      },
    ],
    cta: 'Marcar avaliação',
    faq: [
      {
        q: 'Quanto custa um polimento automóvel?',
        a: 'O valor depende do estado da pintura e do nível de correção necessário, por isso é orçamentado depois de avaliarmos a viatura.',
      },
      {
        q: 'O polimento remove todos os riscos?',
        a: 'Remove ou reduz significativamente riscos superficiais, marcas circulares e oxidação, sem comprometer a segurança do verniz. O nível de correção é definido depois de avaliarmos a pintura.',
      },
      {
        q: 'Qual é a diferença entre o Polimento 1 Etapa e a Correção Avançada?',
        a: 'O Polimento 1 Etapa melhora o brilho e corrige defeitos ligeiros. A Correção Avançada é feita em várias etapas, para pinturas mais danificadas que necessitam de uma correção mais profunda.',
      },
      {
        q: 'O polimento inclui proteção da pintura?',
        a: 'Sim. Os dois serviços terminam com o acabamento e a proteção da pintura.',
      },
    ],
  },

  {
    slug: 'polimento-1-etapa-braga',
    serviceId: 'polimento-1-etapa',
    nome: 'Polimento 1 Etapa',
    whatsapp: true,
    h1: 'Polimento 1 Etapa em Braga',
    intro: [
      'Ideal para pinturas com marcas ligeiras, perda de brilho e pequenos defeitos.',
      'O polimento de 1 etapa permite melhorar significativamente o acabamento da pintura, recuperando o brilho e reduzindo pequenas marcas e imperfeições.',
    ],
    sections: [
      {
        heading: 'O que está incluído',
        items: [
          'Lavagem exterior',
          'Descontaminação da pintura',
          'Preparação da superfície',
          'Polimento de 1 etapa',
          'Redução de marcas e riscos superficiais',
          'Recuperação de brilho',
          'Acabamento e proteção da pintura',
        ],
      },
      {
        heading: 'Para quem é indicado',
        paragrafos: [
          'Veículos com pintura em bom estado geral, mas com falta de brilho, marcas ligeiras de lavagem ou pequenos defeitos.',
        ],
      },
      {
        heading: 'Resultado',
        paragrafos: [
          'Uma pintura mais uniforme, brilhante e cuidada, com redução dos defeitos visíveis e recuperação do acabamento do automóvel.',
          'O nível de correção recomendado é definido após avaliação do estado da pintura do veículo.',
        ],
      },
      {
        heading: 'Outros polimentos',
        paragrafos: [
          'Para pinturas mais danificadas, com riscos visíveis, swirls ou oxidação, veja a [Correção Avançada de Pintura em Braga](/correcao-pintura-braga/). Todos os polimentos em [Polimento Automóvel em Braga](/polimento-automovel-braga/).',
        ],
      },
    ],
    cta: 'Marcar avaliação',
    faq: [
      {
        q: 'Para que tipo de pintura é o Polimento 1 Etapa?',
        a: 'Para pinturas em bom estado geral, mas com falta de brilho, marcas ligeiras de lavagem ou pequenos defeitos.',
      },
      {
        q: 'O Polimento 1 Etapa inclui descontaminação?',
        a: 'Sim. Inclui lavagem exterior, descontaminação da pintura e preparação da superfície antes do polimento.',
      },
      {
        q: 'Quanto custa o Polimento 1 Etapa?',
        a: 'O valor é orçamentado depois de avaliarmos o estado da pintura.',
      },
    ],
  },

  {
    slug: 'correcao-pintura-braga',
    serviceId: 'polimento-avancado',
    nome: 'Correção Avançada de Pintura',
    whatsapp: true,
    h1: 'Correção Avançada de Pintura em Braga',
    intro: [
      'Um serviço mais completo para pinturas com riscos, marcas circulares, oxidação e defeitos mais evidentes.',
      'São realizadas várias etapas de correção de acordo com o estado da pintura, procurando remover ou reduzir significativamente os defeitos sem comprometer a segurança do verniz.',
    ],
    sections: [
      {
        heading: 'O que está incluído',
        items: [
          'Lavagem exterior detalhada',
          'Descontaminação da pintura',
          'Preparação e inspeção da pintura',
          'Correção em várias etapas',
          'Redução de riscos e marcas circulares',
          'Correção de oxidação e outros defeitos possíveis',
          'Refinamento da pintura',
          'Recuperação de brilho e profundidade',
          'Proteção final',
        ],
      },
      {
        heading: 'Para quem é indicada',
        paragrafos: [
          'Veículos com pintura mais marcada, riscos visíveis, swirls, oxidação ou para quem procura uma recuperação mais profunda do acabamento.',
        ],
      },
      {
        heading: 'Resultado',
        paragrafos: [
          'Uma pintura mais uniforme, brilhante e cuidada, com redução dos defeitos visíveis e recuperação do acabamento do automóvel.',
          'O nível de correção recomendado é definido após avaliação do estado da pintura do veículo.',
        ],
      },
      {
        heading: 'Outros polimentos',
        paragrafos: [
          'Para melhorar o brilho e corrigir defeitos ligeiros, veja o [Polimento 1 Etapa em Braga](/polimento-1-etapa-braga/). Todos os polimentos em [Polimento Automóvel em Braga](/polimento-automovel-braga/).',
        ],
      },
    ],
    cta: 'Marcar avaliação',
    faq: [
      {
        q: 'Quando é preciso uma correção avançada?',
        a: 'Quando a pintura tem riscos visíveis, marcas circulares (swirls), oxidação ou defeitos mais evidentes.',
      },
      {
        q: 'A correção avançada remove todos os riscos?',
        a: 'Procura remover ou reduzir significativamente os defeitos, sem comprometer a segurança do verniz. O que é possível corrigir é avaliado antes de começar.',
      },
      {
        q: 'Quanto custa a correção avançada de pintura?',
        a: 'O valor é orçamentado depois de avaliarmos o estado da pintura.',
      },
    ],
  },

  {
    slug: 'polimento-farois-braga',
    // Os dois cartões de faróis da inicial, dianteiros e traseiros, levam aqui.
    serviceId: ['farois-dianteiros', 'farois-traseiros'],
    nome: 'Polimento de Faróis',
    whatsapp: true,
    h1: 'Polimento de Faróis em Braga',
    intro: [
      'Com o tempo, os faróis ficam amarelados, opacos e riscados: o carro parece mais velho e a luz passa pior à noite.',
      'O polimento de faróis remove a oxidação e os riscos superficiais e devolve a transparência. Fazemos faróis dianteiros e luzes traseiras, por par.',
    ],
    sections: [
      {
        heading: 'Faróis dianteiros',
        entrada: 'Recupera faróis amarelados, opacos ou com riscos, melhorando a estética e a iluminação.',
        items: [
          'Remove oxidação e opacidade',
          'Elimina riscos superficiais',
          'Melhora a passagem de luz',
          'Deixa os faróis transparentes e como novos',
        ],
      },
      {
        heading: 'Luzes traseiras',
        entrada: 'Recupera o aspeto original das luzes traseiras, removendo opacidade e riscos superficiais.',
        items: [
          'Remove desgaste e opacidade',
          'Elimina riscos superficiais',
          'Recupera a transparência',
          'Melhora o aspeto do veículo',
        ],
      },
      {
        heading: 'Porque vale a pena',
        paragrafos: [
          'Um farol opaco espalha a luz em vez de a projetar. Recuperar a transparência melhora o aspeto do carro e a visibilidade à noite.',
          'O valor depende do estado dos faróis, por isso é orçamentado depois de os vermos.',
        ],
      },
      {
        heading: 'Serviços relacionados',
        paragrafos: [
          'Para a pintura, veja o nosso [polimento automóvel em Braga](/polimento-automovel-braga/). Para um tratamento completo do carro, o [detalhe automóvel em Braga](/detalhe-automovel-braga/).',
        ],
      },
    ],
    cta: 'Pedir orçamento',
    faq: [
      {
        q: 'Quanto custa o polimento de faróis?',
        a: 'O valor depende do estado dos faróis e é orçamentado depois de os avaliarmos.',
      },
      {
        q: 'O polimento de faróis é por unidade?',
        a: 'É por par: os dois faróis dianteiros, ou as duas luzes traseiras.',
      },
      {
        q: 'O polimento resolve faróis amarelados?',
        a: 'Sim. Remove a oxidação e a opacidade que deixam os faróis amarelados, e os riscos superficiais.',
      },
    ],
  },
];

/**
 * O titulo, a descricao e a imagem vem do paginasSeo.json. Uma pagina cujo slug
 * nao esteja la rebenta aqui, no build, em vez de sair para producao com o
 * titulo da pagina inicial.
 */
export const SERVICE_PAGES = PAGINAS.map((p) => {
  const seo = SEO[p.slug];
  if (!seo) throw new Error(`Falta o SEO de ${p.slug} no paginasSeo.json`);
  const en = EN_PAGES[p.slug];
  if (!en) throw new Error(`Falta a traducao de ${p.slug} no servicePagesEn.js`);
  // A página mostra o WebP; as pré-visualizações (og:image) levam o JPG, que é
  // o que o WhatsApp e o Facebook leem sem surpresas.
  return {
    ...p, ...seo, en,
    ogImage: seo.image,
    image: `${process.env.PUBLIC_URL}/img/${seo.image.replace(/\.jpg$/, '.webp')}`,
    // Os cartões mostram a imagem a 300-400px: a de 1600 era o triplo do peso.
    thumb: `${process.env.PUBLIC_URL}/img/${seo.image.replace(/\.jpg$/, '-sm.webp')}`,
  };
});

/**
 * O conteudo na lingua pedida.
 *
 * O ingles substitui o texto e mais nada: o slug, o preco e a imagem sao os
 * mesmos, e o endereco tambem — quem procura "car wash braga" chega ao mesmo
 * sitio. Um segundo endereco para o mesmo servico era um segundo canonical a
 * dividir o que o Google ja sabe deste.
 */
export const conteudo = (page, lang) => (lang === 'en' ? { ...page, ...page.en } : page);

export const PAGE_BY_SLUG = Object.fromEntries(SERVICE_PAGES.map((p) => [p.slug, p]));
// O serviceId pode ser uma lista: a página dos faróis é a de dois cartões.
export const PAGE_BY_SERVICE = Object.fromEntries(
  SERVICE_PAGES.flatMap((p) => [].concat(p.serviceId ?? []).map((id) => [id, p])),
);

/**
 * O preço do carro, que é o "desde" que as páginas anunciam. Vem da tabela.
 * Null numa página sem nível de lavagem, que não anuncia preço.
 */
export const precoDe = (page) => (page.levelId ? LEVEL_BY_ID[page.levelId].prices.carro : null);

/** Um link no meio do texto: "[texto](/endereco/)". */
export const LIGACAO = /\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * O nome curto, para os links entre páginas e para o caminho no topo.
 *
 * Em português vem da tabela de preços, que é a mesma que a marcação usa — o
 * nome do serviço não se reescreve em dois sítios. Em inglês vem da tradução,
 * porque a tabela só existe em português.
 */
export const nomeDe = (page, lang) =>
  (lang === 'en' ? page.en.nome : page.nome ?? LEVEL_BY_ID[page.levelId].label);
