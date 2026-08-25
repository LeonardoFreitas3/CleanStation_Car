// O registo so vale se for legivel. Um despejo de JSON ninguem le, e uma lista
// cheia de "updated_at" esconde a alteracao que interessa.

import { describeChanges, recordPath } from './audit';

const log = (changes, extra = {}) => ({
  id: 1, actor_id: null, actor_email: 'a@b.pt', action: 'update',
  table_name: 'services', record_id: 'abc', created_at: '2026-08-25T10:00:00Z',
  changes, ...extra,
});

describe('resumo das alteracoes', () => {
  test('o updated_at nao entra: muda sempre e nunca e a resposta', () => {
    expect(describeChanges(log({ updated_at: 'x', status: 'entregue' })))
      .toEqual(['estado: entregue']);
  });

  test('traduz os campos conhecidos', () => {
    expect(describeChanges(log({ marketing_consent: true })))
      .toEqual(['consentimento de marketing: sim']);
  });

  test('campo desconhecido aparece com o nome cru em vez de desaparecer', () => {
    expect(describeChanges(log({ campo_novo: 'valor' }))).toEqual(['campo_novo: valor']);
  });

  test('vazio e nulo dizem a mesma coisa', () => {
    expect(describeChanges(log({ notes: null, phone: '' })))
      .toEqual(['notas: vazio', 'telefone: vazio']);
  });

  test('texto comprido e cortado para nao rebentar a linha', () => {
    const [linha] = describeChanges(log({ notes: 'a'.repeat(80) }));
    expect(linha.length).toBeLessThan(50);
    expect(linha.endsWith('…')).toBe(true);
  });

  test('sem alteracoes registadas nao inventa nada', () => {
    expect(describeChanges(log(null))).toEqual([]);
  });
});

describe('para onde leva o registo', () => {
  test('servico, cliente e viatura tem pagina', () => {
    expect(recordPath(log({}, { table_name: 'clients', record_id: 'c1' }))).toBe('/crm/clientes/c1');
    expect(recordPath(log({}, { table_name: 'vehicles', record_id: 'v1' }))).toBe('/crm/viaturas/v1');
    expect(recordPath(log({}, { table_name: 'services', record_id: 's1' }))).toBe('/crm/servicos/s1');
  });

  test('fotografias e contas nao tem: melhor sem link do que um link morto', () => {
    expect(recordPath(log({}, { table_name: 'service_photos' }))).toBeNull();
    expect(recordPath(log({}, { table_name: 'profiles' }))).toBeNull();
  });

  test('registo apagado sem id nao leva a lado nenhum', () => {
    expect(recordPath(log({}, { record_id: null }))).toBeNull();
  });
});
