// Os tres numeros no topo dos follow-ups.
//
// Se as categorias se sobrepuserem ou deixarem alguem de fora, os numeros
// deixam de somar ao total e ninguem repara — sao tres numeros pequenos num
// canto do ecra. E o que decide se "quarenta clientes" quer dizer quarenta
// telefonemas ou doze.

import { resumoFollowUps } from './dashboard';

/** Uma linha da lista, com o minimo que o resumo olha. */
const linha = (over = {}) => ({
  id: 'x',
  name: 'Cliente',
  phone: '912345678',
  marketing_consent: true,
  last_contacted_at: null,
  ...over,
});

describe('resumo dos follow-ups', () => {
  test('lista vazia da tudo a zero', () => {
    expect(resumoFollowUps([])).toEqual({
      total: 0, porContactar: 0, contactados: 0, semContacto: 0,
    });
  });

  test('quem tem consentimento e telefone e nunca levou mensagem esta por contactar', () => {
    expect(resumoFollowUps([linha(), linha()])).toMatchObject({ total: 2, porContactar: 2 });
  });

  test('quem ja levou mensagem conta como contactado', () => {
    const r = resumoFollowUps([linha(), linha({ last_contacted_at: '2026-08-01T10:00:00Z' })]);
    expect(r).toMatchObject({ total: 2, porContactar: 1, contactados: 1, semContacto: 0 });
  });

  test('sem consentimento de marketing nao ha como escrever', () => {
    const r = resumoFollowUps([linha({ marketing_consent: false })]);
    expect(r).toMatchObject({ semContacto: 1, porContactar: 0 });
  });

  test('sem telefone tambem nao', () => {
    expect(resumoFollowUps([linha({ phone: null })])).toMatchObject({ semContacto: 1 });
    expect(resumoFollowUps([linha({ phone: '   ' })])).toMatchObject({ semContacto: 1 });
  });

  // O whatsappNumber deixa passar um numero curto — e de proposito, porque um
  // cliente espanhol nao tem nove digitos com prefixo 351. O resumo usa a mesma
  // funcao que o botao: se o botao aparece, a pessoa conta como contactavel.
  // Um numero mal escrito da um link partido, e nenhum dos dois pode fingir
  // que sabe disso antes de alguem carregar.
  test('o resumo concorda com o botao, mesmo num numero improvavel', () => {
    expect(resumoFollowUps([linha({ phone: '123' })]))
      .toMatchObject({ porContactar: 1, semContacto: 0 });
  });

  // Ja contactado e sem consentimento ao mesmo tempo acontece: o consentimento
  // pode ter sido retirado depois da mensagem ter saido. Conta uma vez so, e
  // conta no que interessa — hoje nao da para lhe escrever.
  test('quem nao pode ser contactado conta ai, mesmo ja tendo levado mensagem', () => {
    const r = resumoFollowUps([
      linha({ marketing_consent: false, last_contacted_at: '2026-07-01T10:00:00Z' }),
    ]);
    expect(r).toMatchObject({ total: 1, semContacto: 1, contactados: 0, porContactar: 0 });
  });

  test('as tres categorias somam sempre ao total', () => {
    const rows = [
      linha(),
      linha({ last_contacted_at: '2026-08-01T10:00:00Z' }),
      linha({ marketing_consent: false }),
      linha({ phone: null }),
      linha({ phone: null, marketing_consent: false, last_contacted_at: '2026-08-01T10:00:00Z' }),
    ];
    const r = resumoFollowUps(rows);
    expect(r.total).toBe(5);
    expect(r.porContactar + r.contactados + r.semContacto).toBe(r.total);
  });
});
