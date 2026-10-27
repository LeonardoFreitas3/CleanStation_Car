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
import { SERVICES } from './mock';
import { fotoSrc } from './fotos';
import SEO from './paginasSeo.json';
import { EN_PAGES } from './servicePagesEn';

/**
 * Uma secção é sempre a mesma forma: um título, e depois uma frase de entrada,
 * uma lista, ou parágrafos — os que existirem. Sem isto cada página inventava a
 * sua própria estrutura e a componente virava um monte de casos especiais.
 *
 * `foto` é um nome do fotos.js, uma fotografia real da oficina: o fundo do
 * cabeçalho e a miniatura em "Outros serviços". Nas páginas com cartão na
 * inicial é a mesma do cartão, para quem carregou nele reconhecer onde chegou.
 * O servicePages.test confirma que os ficheiros existem. Os antes e depois
 * vivem numa secção só, na inicial (Resultados.jsx).
 */
const PAGINAS = [
  {
    slug: 'lavagem-automovel-braga',
    levelId: 'simples',
    // O cartao da pagina inicial que leva aqui. Escrito e nao deduzido do
    // levelId: um id que se muda em silencio partia o link sem dar erro, e o
    // teste do servicePages confirma que este existe mesmo no mock.
    serviceId: 'lavagem-simples',
    foto: 'bmw-cinza-espuma',
    h1: 'Lavagem Automóvel em Braga',
    intro: [
      'Uma solução completa para a manutenção do teu veículo, com limpeza manual do exterior, cuidado do interior e selante na pintura.',
      'Na Clean Station Car, cada veículo é tratado individualmente, garantindo uma limpeza cuidada tanto no interior como no exterior.',
    ],
    sections: [
      {
        heading: 'O que está incluído',
        grupos: [
          {
            titulo: 'Exterior',
            items: ['Pré-lavagem', 'Lavagem manual', 'Limpeza das jantes', 'Limpeza dos vidros', 'Aplicação de selante na pintura'],
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
          'A duração média é de aproximadamente 1h30 num carro. SUV, monovolumes e carrinhas grandes demoram mais, e a estimativa aparece na marcação.',
          'Em veículos que apresentem um nível de sujidade superior ao normal, o serviço poderá necessitar de mais tempo. Nestes casos, és sempre informado previamente.',
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
          'Se procuras uma lavagem profissional automóvel em Braga com mais proteção ou um interior mais minucioso, vê a [Lavagem Premium](/lavagem-premium-braga/) e a [Lavagem Detalhada Interior ou Exterior](/lavagem-detalhada-interior-ou-exterior-braga/).',
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
        q: 'O preço pode ser diferente do anunciado?',
        a: 'O preço depende do tipo de veículo: o valor "desde" é o do carro, e SUV, monovolumes e carrinhas grandes têm valor próprio, mostrado na marcação. Sujidade fora do normal pode ter um suplemento, sempre aprovado contigo antes do serviço. Os preços incluem IVA.',
      },
      {
        q: 'A Lavagem Simples inclui selante?',
        a: 'Sim. Inclui selante aplicado na pintura, que dá mais brilho, efeito hidrofóbico e proteção adicional. É um selante de pintura, não um revestimento cerâmico.',
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
    foto: 'mustang-frente',
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
          'Selante premium na pintura',
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
        heading: 'Selante premium',
        entrada: 'Aplicação de um selante premium na pintura, que proporciona:',
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
          'Se o interior precisa de uma higienização a fundo, com remoção dos bancos, vê a [Lavagem Detalhada Interior + Exterior](/lavagem-detalhada-braga/).',
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
        a: 'Sim. É aplicado um selante premium na pintura. É um selante, não um revestimento cerâmico.',
      },
      {
        q: 'Qual é a diferença entre a Premium e a Detalhada Interior + Exterior?',
        a: 'A Lavagem Detalhada Interior + Exterior acrescenta à Premium a remoção e higienização dos bancos, a descontaminação da pintura e a limpeza profunda de jantes e pneus.',
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
    foto: 'porsche-interior',
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
        entrada: 'Além do processo completo da Lavagem Premium, com a descontaminação dos vidros e o selante premium, é realizada:',
        items: [
          'Descontaminação da pintura',
          'Limpeza profunda das jantes',
          'Limpeza dos pneus',
        ],
      },
      {
        heading: 'Duração',
        paragrafos: ['A duração média é de aproximadamente 8 horas num carro. SUV, monovolumes e carrinhas grandes demoram mais, e a estimativa aparece na marcação. Pode variar de acordo com o estado do veículo.'],
      },
      {
        heading: 'Para quem é indicada',
        paragrafos: [
          'Indicada para veículos que necessitam de uma limpeza profunda e para clientes que procuram o nível máximo de cuidado e detalhe na limpeza do teu veículo.',
          'É especialmente indicada para veículos com sujidade acumulada, interiores que necessitam de uma higienização profunda ou veículos que não recebem um tratamento detalhado há bastante tempo.',
          'A lavagem limpa e protege a pintura, mas não corrige riscos nem marcas. Para isso, vê o [polimento automóvel em Braga](/polimento-automovel-braga/).',
        ],
      },
    ],
    cta: 'Marcar Lavagem Detalhada Interior + Exterior',
    faq: [
      {
        q: 'Quanto tempo demora a Lavagem Detalhada Interior + Exterior?',
        a: 'Em média, aproximadamente 8 horas num carro. SUV, monovolumes e carrinhas grandes demoram mais, e a estimativa aparece na marcação.',
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
      {
        q: 'Posso fazer só o interior ou só o exterior?',
        a: 'Sim. A Lavagem Detalhada Interior ou Exterior faz o mesmo trabalho só na área que escolheres na marcação.',
      },
    ],
  },

  {
    slug: 'lavagem-detalhada-interior-ou-exterior-braga',
    levelId: 'detalhada-parcial',
    // O cartao da pagina inicial que leva aqui. Escrito e nao deduzido do
    // levelId: um id que se muda em silencio partia o link sem dar erro, e o
    // teste do servicePages confirma que este existe mesmo no mock.
    serviceId: 'lavagem-detalhada-interior-ou-exterior',
    foto: 'volante-escova',
    // O texto e o da Lavagem Detalhada, dividido pelas duas areas: nao se faz
    // aqui nada que la nao se faca.
    h1: 'Lavagem Detalhada Interior ou Exterior em Braga',
    intro: [
      'O trabalho da nossa Lavagem Detalhada, só na área que escolheres: o interior ou o exterior do veículo.',
      'Cada zona é trabalhada individualmente, incluindo áreas que não são acessíveis numa limpeza convencional.',
    ],
    sections: [
      {
        heading: 'Interior ou exterior',
        paragrafos: [
          'Na marcação escolhes a área: Interior ou Exterior. O serviço inclui apenas a área escolhida.',
          'Para as duas áreas, vê a [Lavagem Detalhada Interior + Exterior](/lavagem-detalhada-braga/).',
        ],
      },
      {
        heading: 'Interior',
        entrada: 'A limpeza detalhada do interior da Lavagem Premium, acrescentando:',
        items: [
          'Remoção dos bancos',
          'Higienização profunda dos bancos',
          'Limpeza extremamente detalhada do interior',
          'Acesso e limpeza de zonas normalmente inacessíveis com os bancos montados',
        ],
        nota: 'Com os bancos removidos, conseguimos trabalhar de forma muito mais profunda as áreas do habitáculo. Os bancos são higienizados individualmente e é realizada uma limpeza aprofundada das zonas normalmente difíceis de alcançar.',
      },
      {
        heading: 'Exterior',
        entrada: 'O processo exterior completo da Lavagem Premium, com a descontaminação dos vidros e o selante premium, acrescentando:',
        items: [
          'Descontaminação da pintura',
          'Limpeza profunda das jantes',
          'Limpeza dos pneus',
        ],
      },
      {
        heading: 'Duração',
        paragrafos: ['A duração média é de aproximadamente 4 horas num carro, em qualquer das duas áreas. SUV, monovolumes e carrinhas grandes demoram mais, e a estimativa aparece na marcação.'],
      },
    ],
    cta: 'Marcar Lavagem Detalhada Interior ou Exterior',
    faq: [
      {
        q: 'Inclui o interior e o exterior?',
        a: 'Não. Inclui apenas a área que escolheres na marcação: interior ou exterior. Para as duas, existe a Lavagem Detalhada Interior + Exterior.',
      },
      {
        q: 'Quanto tempo demora?',
        a: 'Em média, aproximadamente 4 horas num carro. SUV, monovolumes e carrinhas grandes demoram mais, e a estimativa aparece na marcação.',
      },
      {
        q: 'Os bancos são removidos?',
        a: 'Sim, na opção Interior. Os bancos são removidos para permitir uma limpeza e higienização mais profundas.',
      },
      {
        q: 'A opção Exterior inclui descontaminação da pintura?',
        a: 'Sim. A descontaminação da pintura está incluída na opção Exterior.',
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
    foto: 'porsche-traseira',
    nome: 'Detalhe Automóvel',
    h1: 'Detalhe Automóvel em Braga',
    intro: [
      'O detalhe automóvel vai além de uma lavagem: é o trabalho minucioso de limpar, recuperar e proteger cada parte do veículo, por dentro e por fora.',
      'Na Clean Station Car fazemos detailing em Braga com tempo e atenção a cada viatura — da limpeza profunda do interior à descontaminação, ao polimento e à proteção da pintura.',
      'Esta página junta tratamentos diferentes: as lavagens, com preço de tabela, e os polimentos, que são um serviço à parte, orçamentado depois de vermos a pintura. Nenhuma lavagem inclui polimento.',
    ],
    sections: [
      {
        heading: 'O que inclui o detalhe automóvel',
        grupos: [
          {
            titulo: 'Nas lavagens Premium e Detalhada',
            items: [
              'Limpeza detalhada do interior, incluindo zonas de difícil acesso',
              'Remoção e higienização profunda dos bancos (Detalhada)',
              'Descontaminação dos vidros e da pintura (pintura só na Detalhada)',
              'Limpeza profunda de jantes e pneus (Detalhada)',
              'Selante premium na pintura',
            ],
          },
          {
            titulo: 'Contratado à parte',
            items: [
              'Polimento de 1 etapa',
              'Correção avançada de pintura',
              'Polimento de faróis',
            ],
          },
        ],
      },
      {
        heading: 'Os nossos serviços de car detailing em Braga',
        paragrafos: [
          'A [Lavagem Detalhada Interior + Exterior](/lavagem-detalhada-braga/) é o nosso serviço mais completo: os bancos são removidos, o interior é higienizado a fundo e a pintura é descontaminada e protegida.',
          'A [Lavagem Detalhada Interior ou Exterior](/lavagem-detalhada-interior-ou-exterior-braga/) faz o mesmo trabalho, só na área que escolheres.',
          'A [Lavagem Premium](/lavagem-premium-braga/) é indicada para quem quer um nível de limpeza acima de uma lavagem convencional, com descontaminação dos vidros e proteção premium da pintura.',
          'Para riscos, hologramas e pintura sem brilho, o [polimento automóvel](/polimento-automovel-braga/) recupera a pintura antes de a proteger.',
          'Para faróis amarelados ou opacos, o [polimento de faróis](/polimento-farois-braga/).',
        ],
      },
      {
        heading: 'Estética automóvel com atenção ao detalhe',
        paragrafos: [
          'Analisamos o estado de cada veículo antes de começar, para definir o tratamento certo. Se for preciso trabalho adicional, o cliente é sempre informado antes.',
          'Para uma limpeza mais profunda, consulta o nosso serviço de [limpeza interior automóvel em Braga](/limpeza-interior-automovel-braga/).',
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
        a: 'Num carro, a Lavagem Detalhada Interior + Exterior demora em média aproximadamente 8 horas, e a Interior ou Exterior cerca de 4 horas. SUV, monovolumes e carrinhas grandes demoram mais, e a estimativa aparece na marcação.',
      },
      {
        q: 'Quanto custa o detalhe automóvel em Braga?',
        a: 'Depende do serviço. As lavagens têm preço de tabela por tipo de veículo, com IVA incluído; os polimentos são contratados à parte, com preço desde, e o valor final é orçamentado depois de avaliarmos a pintura.',
      },
    ],
  },

  {
    slug: 'limpeza-interior-automovel-braga',
    foto: 'renault-condutor-depois',
    nome: 'Limpeza Interior',
    h1: 'Limpeza Interior Automóvel em Braga',
    intro: [
      'Fazemos a limpeza interior automóvel em Braga em três níveis: a manutenção da Lavagem Simples, a limpeza interior detalhada da Premium e a higienização com remoção dos bancos da Detalhada.',
      'As nossas lavagens incluem a limpeza interior do carro, menos a Detalhada feita só no exterior; o que muda entre elas é a profundidade do trabalho. Só a Detalhada remove os bancos.',
    ],
    sections: [
      {
        heading: 'O que inclui a limpeza interior',
        grupos: [
          {
            titulo: 'Manutenção · Simples',
            items: [
              'Aspiração das alcatifas, dos tapetes e da mala',
              'Limpeza do tablier',
              'Vidros limpos',
            ],
          },
          {
            titulo: 'Limpeza detalhada · Premium',
            items: [
              'Tudo da manutenção, com aspiração mais profunda',
              'Limpeza das saídas de ar, comandos e bolsas das portas',
              'Limpeza da consola central e dos espaços entre bancos',
              'Zonas de difícil acesso',
            ],
          },
          {
            titulo: 'Higienização · Detalhada',
            items: [
              'Tudo da limpeza detalhada',
              'Remoção dos bancos',
              'Higienização profunda dos bancos, um a um',
              'Limpeza das zonas inacessíveis com os bancos montados',
            ],
          },
        ],
      },
      {
        heading: 'Higienização automóvel e limpeza de estofos',
        paragrafos: [
          'Na [Lavagem Detalhada Interior + Exterior](/lavagem-detalhada-braga/), e na [Lavagem Detalhada Interior ou Exterior](/lavagem-detalhada-interior-ou-exterior-braga/) com a opção Interior, os bancos são removidos e higienizados individualmente. É assim que se faz a limpeza dos bancos do carro e dos estofos a fundo, e se chega às zonas do habitáculo escondidas com os bancos montados.',
          'É indicada para interiores com sujidade acumulada, ou que não recebem um tratamento detalhado há bastante tempo.',
        ],
      },
      {
        heading: 'Que serviço escolher',
        paragrafos: [
          'Para a manutenção regular, a [Lavagem Simples](/lavagem-automovel-braga/) inclui a aspiração e a limpeza do interior.',
          'Para um interior mais minucioso, a [Lavagem Premium](/lavagem-premium-braga/) trabalha as saídas de ar, os comandos, as bolsas das portas e os espaços entre bancos.',
          'Para a limpeza interior mais completa, com remoção dos bancos, a [Lavagem Detalhada Interior ou Exterior](/lavagem-detalhada-interior-ou-exterior-braga/) com a opção Interior, ou a [Lavagem Detalhada Interior + Exterior](/lavagem-detalhada-braga/), se quiseres também o exterior.',
        ],
      },
      {
        heading: 'Pelos de animais e sujidade fora do normal',
        paragrafos: [
          'Uma quantidade elevada de pelos de animais, excesso de areia ou outra sujidade que exija trabalho adicional poderá ter um custo extra, sempre comunicado e aprovado previamente.',
          'Conhece também o nosso [polimento automóvel em Braga](/polimento-automovel-braga/).',
        ],
      },
    ],
    cta: 'Marcar limpeza',
    faq: [
      {
        q: 'Fazem limpeza de bancos e estofos?',
        a: 'Sim. Na Lavagem Detalhada Interior + Exterior, e na Detalhada Interior ou Exterior com a opção Interior, os bancos são removidos e higienizados individualmente. As outras lavagens limpam o interior sem remover os bancos.',
      },
      {
        q: 'Todas as lavagens incluem limpeza interior?',
        a: 'A Simples, a Premium e a Detalhada Interior + Exterior incluem limpeza interior e exterior; a Detalhada Interior ou Exterior inclui só a área escolhida. A diferença está no nível de detalhe.',
      },
      {
        q: 'Quanto tempo demora a limpeza interior?',
        a: 'Depende do serviço escolhido e do estado da viatura. No momento da marcação é apresentada uma estimativa de duração.',
      },
    ],
  },

  {
    slug: 'polimento-automovel-braga',
    foto: 'farol-depois',
    nome: 'Polimento Automóvel',
    // Os polimentos não se marcam online: o botão abre o WhatsApp, como a
    // ficha deles na página inicial.
    whatsapp: true,
    // A mensagem que o dono pediu para os polimentos, em vez do "orçamento
    // para: <serviço>" das outras páginas: convida a mandar fotografias.
    mensagem: 'whatsapp.polish',
    // Um terceiro botão a meio, depois da secção com este índice: quem leu a
    // explicação não tem de descer até ao fim para pedir o orçamento.
    ctaApos: 2,
    ctaTexto: 'Envia-nos uma mensagem pelo WhatsApp. Avaliamos a pintura e damos-te o orçamento.',
    h1: 'Polimento Automóvel em Braga',
    intro: [
      'Recupera o brilho e melhora o aspeto da pintura do teu automóvel com um serviço de polimento profissional. Na Clean Station Car, avaliamos o estado da pintura e aplicamos o nível de correção mais adequado ao veículo.',
    ],
    sections: [
      {
        heading: 'Polimento de 1 Etapa',
        // O "desde" deste servico, mostrado por baixo do titulo (ServicoPagina).
        servico: 'polimento-1-etapa',
        entrada: 'Ideal para pinturas com marcas ligeiras, perda de brilho e pequenos defeitos.',
        paragrafos: [
          'O polimento de 1 etapa permite melhorar significativamente o acabamento da pintura, recuperando o brilho e reduzindo pequenas marcas e imperfeições.',
        ],
        nota: 'Inclui lavagem detalhada exterior. Vê tudo o que inclui no [Polimento 1 Etapa em Braga](/polimento-1-etapa-braga/).',
      },
      {
        heading: 'Polimento de Correção Avançada',
        servico: 'polimento-avancado',
        entrada: 'Um serviço mais completo para pinturas com riscos, marcas circulares, oxidação e defeitos mais evidentes.',
        paragrafos: [
          'São realizadas várias etapas de correção de acordo com o estado da pintura, procurando remover ou reduzir significativamente os defeitos sem comprometer a segurança do verniz.',
        ],
        nota: 'Inclui lavagem detalhada exterior. Vê tudo o que inclui na [Correção Avançada de Pintura em Braga](/correcao-pintura-braga/).',
      },
      // O texto da tabela é o das páginas de cada polimento, resumido: nada que
      // lá não esteja. O "desde" não se escreve aqui, vem do `servico` (mock.js).
      {
        id: 'comparar',
        heading: 'Qual escolher?',
        comparacao: {
          colunas: [
            { titulo: 'Polimento 1 Etapa', servico: 'polimento-1-etapa' },
            { titulo: 'Correção Avançada', servico: 'polimento-avancado' },
          ],
          linhas: [
            { rotulo: 'Indicado para', valores: ['Pintura em bom estado geral, com falta de brilho ou marcas ligeiras de lavagem', 'Pintura mais marcada, com riscos visíveis, swirls ou oxidação'] },
            { rotulo: 'Defeitos que trata', valores: ['Marcas ligeiras, perda de brilho e pequenos defeitos', 'Riscos, marcas circulares, oxidação e defeitos mais evidentes'] },
            { rotulo: 'Etapas de correção', valores: ['Uma', 'Várias, de acordo com o estado da pintura'] },
            { rotulo: 'Resultado', valores: ['Mais brilho e profundidade de cor, com as marcas ligeiras atenuadas', 'Defeitos mais evidentes reduzidos ou removidos, até onde o verniz permite'] },
            { rotulo: 'Inclui', valores: ['Lavagem detalhada exterior, descontaminação, polimento, acabamento e proteção', 'Lavagem detalhada exterior, descontaminação, correção em várias etapas, refinamento e proteção final'] },
          ],
        },
        nota: 'O nível de correção recomendado é definido após avaliação do estado da pintura do veículo.',
      },
      {
        heading: 'Resultado',
        paragrafos: [
          'Com o Polimento 1 Etapa: mais brilho e marcas ligeiras atenuadas. Com a Correção Avançada: defeitos mais evidentes reduzidos ou removidos, até onde o verniz permite. Nenhum polimento remove todos os riscos, e o que é possível corrigir é dito antes de começar.',
          'Marca uma avaliação do teu veículo na Clean Station Car, em Braga.',
        ],
      },
      // Fora do texto do dono: são os links que ligam esta página às outras.
      {
        heading: 'Serviços relacionados',
        paragrafos: [
          'Para proteger a pintura depois de corrigida, vê a [proteção cerâmica em Braga](/protecao-ceramica-braga/).',
          'Para faróis amarelados ou opacos, vê o nosso [polimento de faróis em Braga](/polimento-farois-braga/). Para manter o resultado, a [lavagem automóvel em Braga](/lavagem-automovel-braga/) ou o [detalhe automóvel em Braga](/detalhe-automovel-braga/).',
        ],
      },
    ],
    cta: 'Pedir orçamento por WhatsApp',
    faq: [
      {
        q: 'Quanto custa um polimento automóvel?',
        a: 'Desde 250 € no Polimento de 1 Etapa e desde 350 € no Polimento de Correção Avançada. O valor final depende do estado da pintura e do nível de correção necessário, por isso é orçamentado depois de avaliarmos a viatura.',
      },
      {
        q: 'O polimento remove todos os riscos?',
        a: 'Não. Reduz ou remove riscos superficiais, marcas circulares e oxidação até onde o verniz permite; um risco que chegue à tinta ou ao primário não sai com polimento. O nível de correção é definido depois de avaliarmos a pintura.',
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
    foto: 'polimento-pintura',
    serviceId: 'polimento-1-etapa',
    nome: 'Polimento de 1 Etapa',
    whatsapp: true,
    mensagem: 'whatsapp.polish',
    ctaApos: 2,
    ctaTexto: 'Envia-nos uma mensagem pelo WhatsApp. Avaliamos a pintura e damos-te o orçamento.',
    // O botão secundário: comparar com o outro polimento, em vez de "ver
    // preços" de um serviço que não tem preço de tabela.
    comparar: 'polimento-automovel-braga',
    h1: 'Polimento 1 Etapa em Braga',
    intro: [
      'Ideal para pinturas com marcas ligeiras, perda de brilho e pequenos defeitos.',
      'O polimento de 1 etapa permite melhorar significativamente o acabamento da pintura, recuperando o brilho e reduzindo pequenas marcas e imperfeições.',
    ],
    sections: [
      {
        heading: 'O que está incluído',
        items: [
          'Lavagem detalhada exterior',
          'Descontaminação da pintura',
          'Preparação da superfície',
          'Polimento de 1 etapa',
          'Redução de marcas e riscos superficiais',
          'Recuperação de brilho',
          'Acabamento e proteção da pintura',
        ],
        nota: 'Inclui lavagem detalhada exterior.',
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
          'Mais brilho e profundidade de cor, com as marcas ligeiras atenuadas. Não é uma correção profunda: riscos mais evidentes pedem a Correção Avançada.',
          'O nível de correção recomendado é definido após avaliação do estado da pintura do veículo.',
        ],
      },
      {
        heading: 'Outros polimentos',
        paragrafos: [
          'Para pinturas mais danificadas, com riscos visíveis, swirls ou oxidação, vê a [Correção Avançada de Pintura em Braga](/correcao-pintura-braga/). Todos os polimentos em [Polimento Automóvel em Braga](/polimento-automovel-braga/).',
          'Para proteger a pintura depois do polimento, vê a [proteção cerâmica em Braga](/protecao-ceramica-braga/).',
        ],
      },
    ],
    cta: 'Pedir orçamento por WhatsApp',
    faq: [
      {
        q: 'Para que tipo de pintura é o Polimento 1 Etapa?',
        a: 'Para pinturas em bom estado geral, mas com falta de brilho, marcas ligeiras de lavagem ou pequenos defeitos.',
      },
      {
        q: 'O Polimento 1 Etapa inclui descontaminação?',
        a: 'Sim. Inclui lavagem detalhada exterior, descontaminação da pintura e preparação da superfície antes do polimento.',
      },
      {
        q: 'Quanto custa o Polimento 1 Etapa?',
        a: 'Desde 250 €. O valor final é orçamentado depois de avaliarmos o estado da pintura.',
      },
    ],
  },

  {
    slug: 'correcao-pintura-braga',
    foto: 'bmw-frente',
    serviceId: 'polimento-avancado',
    nome: 'Polimento de Correção Avançada',
    whatsapp: true,
    mensagem: 'whatsapp.polish',
    ctaApos: 2,
    ctaTexto: 'Envia-nos uma mensagem pelo WhatsApp. Avaliamos a pintura e damos-te o orçamento.',
    comparar: 'polimento-automovel-braga',
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
        nota: 'Inclui lavagem detalhada exterior.',
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
          'Defeitos mais evidentes reduzidos ou removidos, até onde o verniz permite — a correção respeita sempre a espessura do verniz, e o que é possível corrigir é avaliado antes de começar.',
          'O nível de correção recomendado é definido após avaliação do estado da pintura do veículo.',
        ],
      },
      {
        heading: 'Outros polimentos',
        paragrafos: [
          'Para melhorar o brilho e corrigir defeitos ligeiros, vê o [Polimento 1 Etapa em Braga](/polimento-1-etapa-braga/). Todos os polimentos em [Polimento Automóvel em Braga](/polimento-automovel-braga/).',
          'Para proteger a pintura depois da correção, vê a [proteção cerâmica em Braga](/protecao-ceramica-braga/).',
        ],
      },
    ],
    cta: 'Pedir orçamento por WhatsApp',
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
        a: 'Desde 350 €. O valor final é orçamentado depois de avaliarmos o estado da pintura.',
      },
    ],
  },

  {
    slug: 'polimento-farois-braga',
    // Os dois cartões de faróis da inicial, dianteiros e traseiros, levam aqui.
    serviceId: ['farois-dianteiros', 'farois-traseiros'],
    // Cada cartão da inicial abre a sua secção: o id da secção, por cartão.
    ancoras: { 'farois-dianteiros': 'dianteiros', 'farois-traseiros': 'traseiros' },
    foto: 'farol-maquina',
    nome: 'Polimento de Faróis',
    whatsapp: true,
    ctaTexto: 'Envia-nos uma mensagem pelo WhatsApp. Avaliamos o estado dos faróis e damos-te o orçamento.',
    h1: 'Polimento de Faróis em Braga',
    intro: [
      'Com o tempo, os faróis ficam amarelados, opacos e riscados: o carro parece mais velho e a luz passa pior à noite.',
      'O polimento de faróis remove a oxidação e os riscos superficiais e devolve a transparência. Fazemos faróis dianteiros e luzes traseiras, por par.',
    ],
    sections: [
      {
        id: 'dianteiros',
        servico: 'farois-dianteiros',
        heading: 'Faróis dianteiros',
        entrada: 'Recupera faróis amarelados, opacos ou com riscos, melhorando a estética e a iluminação.',
        items: [
          'Remove oxidação e opacidade',
          'Atenua riscos superficiais',
          'Melhora a passagem de luz',
          'Devolve a transparência',
        ],
      },
      {
        id: 'traseiros',
        servico: 'farois-traseiros',
        heading: 'Luzes traseiras',
        entrada: 'Recupera o aspeto das luzes traseiras, removendo opacidade e riscos superficiais.',
        items: [
          'Remove desgaste e opacidade',
          'Atenua riscos superficiais',
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
          'Para a pintura, vê o nosso [polimento automóvel em Braga](/polimento-automovel-braga/). Para um tratamento completo do carro, o [detalhe automóvel em Braga](/detalhe-automovel-braga/).',
        ],
      },
    ],
    cta: 'Pedir orçamento',
    faq: [
      {
        q: 'Quanto custa o polimento de faróis?',
        a: 'Desde 55 € o par de faróis dianteiros e desde 40 € o par de luzes traseiras. O valor final depende do estado dos faróis e é orçamentado depois de os avaliarmos.',
      },
      {
        q: 'O polimento de faróis é por unidade?',
        a: 'É por par: os dois faróis dianteiros, ou as duas luzes traseiras.',
      },
      {
        q: 'O polimento resolve faróis amarelados?',
        a: 'Na maioria dos casos, sim. Remove a oxidação e a opacidade que deixam os faróis amarelados e atenua os riscos superficiais. Um farol fissurado ou com a oxidação por dentro é avaliado antes.',
      },
    ],
  },

  {
    slug: 'protecao-ceramica-braga',
    foto: 'porsche-frente',
    serviceId: 'ceramica',
    nome: 'Proteção Cerâmica Profissional',
    // Não se marca online: o botão abre o WhatsApp, como nos polimentos.
    whatsapp: true,
    ctaTexto: 'Envia-nos uma mensagem pelo WhatsApp. Avaliamos o estado da viatura e damos-te o orçamento.',
    h1: 'Proteção Cerâmica em Braga',
    // O texto é o da ficha do cartão (mock.js), que é o que o site já dizia.
    intro: [
      'Camada de proteção duradoura aplicada sobre a pintura, que cria uma barreira contra agressões externas.',
    ],
    // "O que é" e "Cerâmica ou selante?" dizem só o que a ficha e as lavagens
    // já diziam. Preparação, manutenção e durabilidade ficam de fora até o dono
    // confirmar o produto: não se escreve uma duração que não se conhece.
    sections: [
      {
        heading: 'O que é a proteção cerâmica',
        paragrafos: [
          'É uma camada aplicada sobre a pintura que fica a fazer de barreira contra os raios UV, a sujidade e os químicos. A pintura ganha brilho, repele a água e o carro fica mais fácil de limpar.',
          'Protege a pintura, mas não a torna à prova de riscos.',
        ],
      },
      {
        heading: 'O que está incluído',
        items: [
          'Proteção contra os raios UV',
          'Proteção contra sujidade e químicos',
          'Proteção contra pequenos riscos superficiais',
          'Brilho mais intenso e efeito repelente de água',
          'Pintura protegida durante muito mais tempo',
          'Carro mais fácil de limpar',
        ],
      },
      {
        heading: 'Proteção cerâmica ou selante?',
        paragrafos: [
          'O selante é a proteção que as nossas lavagens aplicam na pintura: dá brilho, efeito hidrofóbico e uma proteção adicional. Vem incluído na [Lavagem Simples](/lavagem-automovel-braga/) e, em versão premium, na [Lavagem Premium](/lavagem-premium-braga/).',
          'A proteção cerâmica é um serviço à parte, com uma camada pensada para proteger a pintura durante muito mais tempo.',
        ],
      },
      {
        heading: 'Serviços relacionados',
        paragrafos: [
          'Vê também o nosso [polimento automóvel em Braga](/polimento-automovel-braga/) e o [detalhe automóvel em Braga](/detalhe-automovel-braga/).',
        ],
      },
    ],
    cta: 'Pedir orçamento por WhatsApp',
    faq: [
      {
        q: 'Quanto custa a proteção cerâmica?',
        a: 'Desde 250 €. O valor final depende da avaliação do estado da viatura.',
      },
      {
        q: 'A proteção cerâmica marca-se online?',
        a: 'Não. Envia-nos uma mensagem pelo WhatsApp ou liga-nos, e combinamos contigo.',
      },
      {
        q: 'O selante das lavagens é uma proteção cerâmica?',
        a: 'Não. As lavagens levam um selante de pintura; a proteção cerâmica é um serviço à parte.',
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
  // A página mostra a fotografia da oficina; as pré-visualizações (og:image)
  // continuam a levar o JPG do paginasSeo.json.
  return {
    ...p, ...seo, en,
    ogImage: seo.image,
    image: fotoSrc(p.foto, 'capa'),
    // Os cartões mostram a imagem a 300-400px: a de 1600 era o triplo do peso.
    thumb: fotoSrc(p.foto, 'card-sm'),
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
 * O "desde" que a página anuncia. Numa lavagem é o preço do carro, da tabela;
 * na proteção cerâmica é o do cartão (mock.js). Null numa página sem preço — e
 * nos polimentos, que são sob orçamento e têm o orcamentoDe.
 */
export const precoDe = (page) => {
  if (page.levelId) return LEVEL_BY_ID[page.levelId].prices.carro;
  const servico = SERVICES.find((s) => s.id === page.serviceId);
  return servico && !servico.onRequest && servico.price ? servico.price : null;
};

/**
 * O "desde" de um serviço sob orçamento (os polimentos), vindo do mock.js, que
 * é o que o cartão da inicial mostra. Numa página de dois serviços (os faróis)
 * é o mais baixo. Null onde não há preço — e numa lavagem, que tem o precoDe.
 */
export const orcamentoDe = (page) => {
  const precos = [].concat(page.serviceId ?? [])
    .map((id) => SERVICES.find((s) => s.id === id))
    .filter((s) => s?.onRequest && s.price)
    .map((s) => s.price);
  return precos.length ? Math.min(...precos) : null;
};

/** O "desde" do serviço de uma secção (os polimentos e os faróis). */
export const precoServico = (id) => SERVICES.find((s) => s.id === id)?.price ?? null;

/** Um link no meio do texto: "[texto](/endereco/)". Em inglês leva /en à frente (rotas.js). */
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
