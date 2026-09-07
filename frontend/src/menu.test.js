// O menu erra em silencio: um sublinhado na seccao errada nao da erro nenhum,
// so faz o site parecer baralhado a quem esta a descer a pagina.

import { seccaoAtiva } from './menu';

const LINHA = 240; // um terco de um ecra de 720

// Os tops sao relativos ao ecra: negativo = ja passou por cima.
const ecra = (...pares) => pares.map(([href, top]) => ({ href, top }));

describe('seccao acesa no menu', () => {
  test('sem seccoes nenhumas — uma pagina de servico — nao acende nada', () => {
    expect(seccaoAtiva([], { linha: LINHA })).toBeNull();
  });

  test('no topo acende a primeira, mesmo antes de ela passar a linha', () => {
    const s = ecra(['#home', 0], ['#testimonials', 720], ['#services', 1521]);
    expect(seccaoAtiva(s, { linha: LINHA })).toBe('#home');
  });

  test('acende a ultima que ja passou a linha, e nao a que assoma no fundo', () => {
    // Os testemunhos acabaram de subir acima da linha; os servicos ainda vem a
    // caminho, la em baixo. Era aqui que o observer acendia os servicos.
    const s = ecra(['#home', -700], ['#testimonials', 100], ['#services', 900]);
    expect(seccaoAtiva(s, { linha: LINHA })).toBe('#testimonials');
  });

  test('a ordem do menu nao manda: manda a posicao na pagina', () => {
    // A mesma situacao com as entradas trocadas — o resultado tem de ser igual.
    const s = ecra(['#services', 900], ['#home', -700], ['#testimonials', 100]);
    expect(seccaoAtiva(s, { linha: LINHA })).toBe('#testimonials');
  });

  test('nao salta para tras quando duas estao a vista', () => {
    // Duas passadas: acende a de baixo, que e onde se esta a olhar.
    const s = ecra(['#about', -300], ['#faq', 200], ['#contact', 1100]);
    expect(seccaoAtiva(s, { linha: LINHA })).toBe('#faq');
  });

  test('no fundo da pagina acende a ultima, chegue ela a linha ou nao', () => {
    // O rodape e curto: os contactos ficam a 400 e nunca passam a linha.
    const s = ecra(['#faq', -900], ['#contact', 400]);
    expect(seccaoAtiva(s, { linha: LINHA, noFundo: true })).toBe('#contact');
    // E sem estar no fundo, a mesma geometria acende a anterior.
    expect(seccaoAtiva(s, { linha: LINHA, noFundo: false })).toBe('#faq');
  });

  test('uma seccao exatamente na linha ja conta como passada', () => {
    const s = ecra(['#home', -100], ['#services', LINHA]);
    expect(seccaoAtiva(s, { linha: LINHA })).toBe('#services');
  });
});
