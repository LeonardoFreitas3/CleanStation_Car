// O texto que sai daqui vai para o cliente. Uma variavel por substituir e uma
// mensagem que diz "Ola {{nome}}!" a alguem que paga.

import { applyTemplate, renderFollowUp } from './messages';

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
