// As paginas de servico erram em silencio: um slug que nao case com o
// paginasSeo.json, ou um cartao que aponte para uma pagina que nao existe, dao
// uma pagina bonita com o titulo errado ou um link que manda para a inicial.
// Nada disso da erro nenhum a quem publica.

import { SERVICE_PAGES, PAGE_BY_SERVICE, nomeDe, precoDe } from './servicePages';
import { SERVICES } from './mock';
import { LEVEL_BY_ID } from './booking/pricing';
import SEO from './paginasSeo.json';

describe('paginas de servico', () => {
  test('sao quatro, uma por nivel de lavagem', () => {
    expect(SERVICE_PAGES.map((p) => p.levelId)).toEqual(['simples', 'selante', 'premium', 'detalhada']);
  });

  test('cada pagina tem titulo, descricao e imagem vindos do JSON', () => {
    for (const p of SERVICE_PAGES) {
      expect(SEO[p.slug]).toBeDefined();
      expect(p.title).toBe(SEO[p.slug].title);
      expect(p.description).toBe(SEO[p.slug].description);
      expect(p.image).toContain(SEO[p.slug].image);
    }
  });

  test('o JSON nao tem paginas a mais — seriam estampadas no build sem rota', () => {
    const doJson = Object.keys(SEO).filter((k) => !k.startsWith('_'));
    expect(doJson.sort()).toEqual(SERVICE_PAGES.map((p) => p.slug).sort());
  });

  test('o cartao da pagina inicial que cada pagina reclama existe mesmo', () => {
    for (const p of SERVICE_PAGES) {
      expect(SERVICES.some((s) => s.id === p.serviceId)).toBe(true);
      expect(PAGE_BY_SERVICE[p.serviceId]).toBe(p);
    }
  });

  test('o nivel existe no catalogo, senao o preco vinha indefinido', () => {
    for (const p of SERVICE_PAGES) {
      expect(LEVEL_BY_ID[p.levelId]).toBeDefined();
      expect(precoDe(p)).toBeGreaterThan(0);
      expect(nomeDe(p)).toBeTruthy();
    }
  });

  // O preco esta escrito por extenso nas meta-descricoes que o dono aprovou
  // ("desde 30€", "65€"). Se a tabela mudar e o texto ficar, o Google anuncia
  // um preco que a marcacao ja nao pratica — que e a queixa mais cara que ha.
  test('o preco escrito na descricao e o que a tabela pratica', () => {
    for (const p of SERVICE_PAGES) {
      const numeros = [...p.description.matchAll(/(\d+)€/g)].map((m) => Number(m[1]));
      for (const n of numeros) expect(n).toBe(precoDe(p));
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
