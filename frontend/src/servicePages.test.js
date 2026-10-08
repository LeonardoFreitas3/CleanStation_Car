// As paginas de servico erram em silencio: um slug que nao case com o
// paginasSeo.json, ou um cartao que aponte para uma pagina que nao existe, dao
// uma pagina bonita com o titulo errado ou um link que manda para a inicial.
// Nada disso da erro nenhum a quem publica.

import { SERVICE_PAGES, PAGE_BY_SERVICE, PAGE_BY_SLUG, LIGACAO, conteudo, nomeDe, precoDe } from './servicePages';
import { SERVICES } from './mock';
import { LEVEL_BY_ID, DURATIONS, formatDuration } from './booking/pricing';
import SEO from './paginasSeo.json';

// So as que tem nivel de lavagem tem preco, duracao e cartao na inicial.
const COM_NIVEL = SERVICE_PAGES.filter((p) => p.levelId);

describe('paginas de servico', () => {
  test('uma por nivel de lavagem, mais detalhe, limpeza interior e polimento', () => {
    expect(COM_NIVEL.map((p) => p.levelId)).toEqual(['simples', 'selante', 'premium', 'detalhada']);
    expect(SERVICE_PAGES.filter((p) => !p.levelId).map((p) => p.slug)).toEqual([
      'detalhe-automovel-braga', 'limpeza-interior-automovel-braga', 'polimento-automovel-braga',
      'polimento-farois-braga',
    ]);
  });

  test('cada pagina tem titulo, descricao e imagem vindos do JSON', () => {
    for (const p of SERVICE_PAGES) {
      expect(SEO[p.slug]).toBeDefined();
      expect(p.title).toBe(SEO[p.slug].title);
      expect(p.description).toBe(SEO[p.slug].description);
      expect(p.ogImage).toBe(SEO[p.slug].image);
      expect(p.image).toMatch(/\.webp$/);
    }
  });

  test('o JSON nao tem paginas a mais — seriam estampadas no build sem rota', () => {
    const doJson = Object.keys(SEO).filter((k) => !k.startsWith('_'));
    expect(doJson.sort()).toEqual(SERVICE_PAGES.map((p) => p.slug).sort());
  });

  test('o cartao da pagina inicial que cada pagina reclama existe mesmo', () => {
    for (const p of COM_NIVEL) {
      expect(SERVICES.some((s) => s.id === p.serviceId)).toBe(true);
      expect(PAGE_BY_SERVICE[p.serviceId]).toBe(p);
    }
  });

  test('o nivel existe no catalogo, senao o preco vinha indefinido', () => {
    for (const p of COM_NIVEL) {
      expect(LEVEL_BY_ID[p.levelId]).toBeDefined();
      expect(precoDe(p)).toBeGreaterThan(0);
    }
    for (const p of SERVICE_PAGES) expect(nomeDe(p)).toBeTruthy();
  });

  // Um link para uma pagina que nao existe cai no not-found: um 404 que o
  // Search Console aponta e que ninguem ve a escrever o texto.
  test('os links no meio do texto vao dar a paginas que existem', () => {
    for (const pagina of SERVICE_PAGES) {
      for (const lingua of ['pt', 'en']) {
        const p = conteudo(pagina, lingua);
        const textos = [...p.intro, ...p.sections.flatMap((s) => [s.entrada ?? '', s.nota ?? '', ...(s.paragrafos ?? [])])];
        for (const [, , href] of textos.join(' ').matchAll(LIGACAO)) {
          expect([pagina.slug, lingua, href]).toEqual([pagina.slug, lingua, expect.stringMatching(/^\/[a-z0-9-]+\/$/)]);
          expect([pagina.slug, lingua, Boolean(PAGE_BY_SLUG[href.slice(1, -1)])]).toEqual([pagina.slug, lingua, true]);
        }
      }
    }
  });

  // A cadeia que o plano de SEO pede: lavagem -> detalhe -> interior -> polimento.
  test('cada pagina principal leva a seguinte', () => {
    const cadeia = ['lavagem-automovel-braga', 'detalhe-automovel-braga', 'limpeza-interior-automovel-braga', 'polimento-automovel-braga', 'polimento-farois-braga'];
    for (let i = 0; i < cadeia.length - 1; i += 1) {
      for (const lingua of ['pt', 'en']) {
        const p = conteudo(PAGE_BY_SLUG[cadeia[i]], lingua);
        expect([cadeia[i], lingua, JSON.stringify(p.sections).includes(`(/${cadeia[i + 1]}/)`)]).toEqual([cadeia[i], lingua, true]);
      }
    }
  });

  // O preco esta escrito por extenso nas meta-descricoes que o dono aprovou
  // ("desde 30€", "65€"). Se a tabela mudar e o texto ficar, o Google anuncia
  // um preco que a marcacao ja nao pratica — que e a queixa mais cara que ha.
  test('o preco escrito na descricao e o que a tabela pratica', () => {
    for (const pagina of SERVICE_PAGES) {
      // Nas duas linguas e nas duas ordens: em portugues escreve-se "30€" e em
      // ingles "€30". So a portuguesa era verificada, e a inglesa podia ficar
      // com um preco antigo sem ninguem dar por isso.
      for (const lingua of ['pt', 'en']) {
        const p = conteudo(pagina, lingua);
        const numeros = [
          ...p.description.matchAll(/(\d+)€/g),
          ...p.description.matchAll(/€(\d+)/g),
        ].map((m) => Number(m[1]));
        for (const n of numeros) {
          expect([pagina.slug, lingua, n]).toEqual([pagina.slug, lingua, precoDe(pagina)]);
        }
      }
    }
  });

  test('cada pagina responde a alguma coisa: intro, seccoes e perguntas', () => {
    for (const p of SERVICE_PAGES) {
      expect(p.intro.length).toBeGreaterThan(0);
      expect(p.sections.length).toBeGreaterThan(0);
      expect(p.faq.length).toBeGreaterThan(0);
      for (const f of p.faq) {
        expect(f.q).toBeTruthy();
        expect(f.a).toBeTruthy();
      }
    }
  });

  test('os slugs sao enderecos e nao titulos', () => {
    for (const p of SERVICE_PAGES) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.slug).toContain('braga');
    }
  });
});

// A traducao inglesa e uma copia com o texto trocado. Se uma seccao se
// acrescentar em portugues e nao em ingles, a pagina inglesa fica sem ela e
// ninguem da por isso — quem escreve o texto le uma lingua de cada vez.
describe('traducao', () => {
  test('cada pagina tem a versao inglesa, com a mesma estrutura', () => {
    for (const p of SERVICE_PAGES) {
      const en = conteudo(p, 'en');
      expect(en.title).toBeTruthy();
      expect(en.title).not.toBe(p.title);
      expect(en.intro.length).toBe(p.intro.length);
      expect(en.sections.length).toBe(p.sections.length);
      expect(en.faq.length).toBe(p.faq.length);

      // Uma seccao com lista de um lado e paragrafos do outro nao e a mesma
      // seccao traduzida — e outra coisa qualquer no lugar dela.
      p.sections.forEach((sec, i) => {
        const secEn = en.sections[i];
        expect(secEn.items?.length ?? 0).toBe(sec.items?.length ?? 0);
        expect(secEn.paragrafos?.length ?? 0).toBe(sec.paragrafos?.length ?? 0);
        expect(secEn.grupos?.length ?? 0).toBe(sec.grupos?.length ?? 0);
        expect(Boolean(secEn.entrada)).toBe(Boolean(sec.entrada));
        expect(Boolean(secEn.nota)).toBe(Boolean(sec.nota));
      });
    }
  });

  test('o preco e a imagem nao mudam com a lingua', () => {
    for (const p of COM_NIVEL) {
      const en = conteudo(p, 'en');
      expect(precoDe(en)).toBe(precoDe(p));
      expect(en.image).toBe(p.image);
      expect(en.slug).toBe(p.slug);
    }
  });

  test('o nome do servico muda de lingua', () => {
    for (const p of SERVICE_PAGES) {
      expect(nomeDe(p, 'en')).toBeTruthy();
      expect(nomeDe(p, 'en')).not.toBe(nomeDe(p, 'pt'));
    }
  });
});

// A duracao esta escrita por extenso no texto ("Aproximadamente 1h45") e a
// serio na tabela do pricing.js, que e quem calcula as vagas da marcacao. A da
// selante ficou em 1h30 no texto quando a tabela ja dizia 105 minutos: a pagina
// prometia um tempo e a marcacao ocupava outro.
describe('duracao escrita nas paginas', () => {
  const horas = (texto) => [...texto.matchAll(/\d{1,2}h\d{2}/g)].map((m) => m[0]);

  const textoTodo = (p) => [
    ...p.sections.flatMap((s) => s.paragrafos ?? []),
    ...p.faq.map((f) => f.a),
  ].join(' ');

  for (const lingua of ['pt', 'en']) {
    test(`bate certo com a tabela, em ${lingua}`, () => {
      for (const pagina of COM_NIVEL) {
        const p = conteudo(pagina, lingua);
        const daTabela = formatDuration(DURATIONS[pagina.levelId].carro);

        // So as escritas em "XhYY". A premium diz "4 horas" e a detalhada
        // "1 dia" — sao frases e nao numeros, e o dono e que as escreve.
        for (const escrita of horas(textoTodo(p))) {
          expect([pagina.slug, lingua, escrita]).toEqual([pagina.slug, lingua, daTabela]);
        }
      }
    });
  }
});
