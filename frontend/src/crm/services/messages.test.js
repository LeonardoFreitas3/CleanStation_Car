// O texto que sai daqui vai para o cliente. Uma variavel por substituir e uma
// mensagem que diz "Ola {{nome}}!" a alguem que paga.

import { applyTemplate, renderFollowUp, unknownVars, varsForCategory } from './messages';

describe('substituicao de variaveis', () => {
  test('substitui o que conhece', () => {
    expect(applyTemplate('Olá {{nome}}!', { nome: 'Ana' })).toBe('Olá Ana!');
  });

  test('variavel sem valor sai junto com o espaco que a precede', () => {
    expect(applyTemplate('O seu {{veiculo}} está pronto', { veiculo: '' }))
      .toBe('O seu está pronto');
  });

  test('variavel desconhecida nao fica crua na mensagem', () => {
    expect(applyTemplate('Olá {{apelido}}!', { nome: 'Ana' })).toBe('Olá!');
  });
});

describe('mensagem de reativacao', () => {
  const base = { name: 'Ana Maria Silva', lastServiceName: 'Lavagem Premium', daysSinceLastVisit: 45 };

  test('trata o cliente pelo primeiro nome', () => {
    expect(renderFollowUp('Olá {{nome}}!', base)).toBe('Olá Ana!');
  });

  test('usa os dias e o ultimo servico', () => {
    expect(renderFollowUp('{{dias}} dias desde a {{servico}}', base))
      .toBe('45 dias desde a lavagem premium');
  });

  test('cliente sem servicos nao deixa buraco no texto', () => {
    expect(renderFollowUp('desde o último {{servico}}', { ...base, lastServiceName: null }))
      .toBe('desde o último serviço');
  });
});

// O guarda das Definicoes. Uma variavel que a categoria nao preenche nao da
// erro nenhum no envio — desaparece, e leva com ela a frase a que pertencia.
// Quem escreve a mensagem no CRM tem de saber disso antes de guardar, nao
// depois de o cliente receber uma frase truncada.

describe('variaveis por categoria', () => {
  test('a reativacao e por cliente e nao conhece a viatura', () => {
    expect(varsForCategory('follow_up')).toEqual(['nome', 'servico', 'dias']);
    expect(unknownVars('Olá {{nome}}, o seu {{veiculo}}', 'follow_up')).toEqual(['veiculo']);
  });

  test('as mensagens do servico conhecem a viatura, mas nao os dias', () => {
    expect(unknownVars('O seu {{veiculo}} ({{matricula}}) está na {{etapa}}', 'rececao')).toEqual([]);
    expect(unknownVars('Já passaram {{dias}} dias', 'rececao')).toEqual(['dias']);
  });

  test('uma categoria que ainda nao existe cai nas variaveis do servico', () => {
    expect(varsForCategory('categoria-nova')).toContain('veiculo');
  });

  test('a mesma variavel repetida so e apontada uma vez', () => {
    expect(unknownVars('{{dias}} e mais {{dias}}', 'rececao')).toEqual(['dias']);
  });

  test('texto sem variaveis nenhumas passa', () => {
    expect(unknownVars('O seu carro está pronto.', 'follow_up')).toEqual([]);
  });

  test('chavetas soltas nao contam como variavel', () => {
    expect(unknownVars('Custa {25} euros', 'follow_up')).toEqual([]);
  });
});
