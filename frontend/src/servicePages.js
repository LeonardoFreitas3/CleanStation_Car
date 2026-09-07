// As páginas de cada serviço.
//
// Texto escrito pelo dono da oficina, não gerado: é ele que sabe o que se faz a
// um carro. Está aqui em dados e não em JSX porque as quatro páginas são a
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
      'Na Clean Station, cada veículo é tratado individualmente, garantindo uma limpeza cuidada tanto no interior como no exterior.',
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
        paragrafos: ['Aproximadamente 1h30, dependendo do estado do veículo.'],
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
];

/**
 * O titulo, a descricao e a imagem vem do paginasSeo.json — o mesmo ficheiro
 * que o build le para os estampar no HTML de cada pagina. Uma pagina cujo slug
 * nao esteja la rebenta aqui, no arranque, em vez de sair para producao com o
 * titulo da pagina inicial.
 */
export const SERVICE_PAGES = PAGINAS.map((p) => {
  const seo = SEO[p.slug];
  if (!seo) throw new Error(`Falta o SEO de ${p.slug} no paginasSeo.json`);
  const en = EN_PAGES[p.slug];
  if (!en) throw new Error(`Falta a traducao de ${p.slug} no servicePagesEn.js`);
  return { ...p, ...seo, en, image: `${process.env.PUBLIC_URL}/img/${seo.image}` };
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
export const PAGE_BY_LEVEL = Object.fromEntries(SERVICE_PAGES.map((p) => [p.levelId, p]));
export const PAGE_BY_SERVICE = Object.fromEntries(SERVICE_PAGES.map((p) => [p.serviceId, p]));

/** O preço do carro, que é o "desde" que as páginas anunciam. Vem da tabela. */
export const precoDe = (page) => LEVEL_BY_ID[page.levelId].prices.carro;

/**
 * O nome curto, para os links entre páginas e para o caminho no topo.
 *
 * Em português vem da tabela de preços, que é a mesma que a marcação usa — o
 * nome do serviço não se reescreve em dois sítios. Em inglês vem da tradução,
 * porque a tabela só existe em português.
 */
export const nomeDe = (page, lang) =>
  (lang === 'en' ? page.en.nome : LEVEL_BY_ID[page.levelId].label);
