// A etiqueta do cliente decide o que a equipa ve na lista, e passou a depender
// de limiares editaveis: um limiar mal aplicado nao rebenta nada, so mente.

import { clientStatus, setVipThresholds } from './clients';

const c = (visit_count, total_spent, days_since_last_visit = 1) => ({
  visit_count, total_spent, days_since_last_visit,
});

describe('estado do cliente', () => {
  beforeEach(() => setVipThresholds(500, 6));

  test('VIP por valor gasto ou por numero de visitas, qualquer um chega', () => {
    expect(clientStatus(c(1, 500))).toBe('vip');
    expect(clientStatus(c(6, 0))).toBe('vip');
  });

  test('abaixo dos dois limiares nao e VIP', () => {
    expect(clientStatus(c(5, 499))).toBe('recorrente');
  });

  test('sem visitas e novo, mesmo com dinheiro gasto a zero', () => {
    expect(clientStatus(c(0, 0, null))).toBe('novo');
  });

  test('inativo a partir da janela de reativacao', () => {
    expect(clientStatus(c(3, 100, 120))).toBe('inativo');
    expect(clientStatus(c(3, 100, 119))).toBe('recorrente');
  });

  test('mudar os limiares muda a etiqueta sem tocar nos dados', () => {
    const cliente = c(3, 200);
    expect(clientStatus(cliente)).toBe('recorrente');
    setVipThresholds(150, 6);
    expect(clientStatus(cliente)).toBe('vip');
  });

  test('VIP ganha ao inativo: quem gastou muito nao desaparece da lista', () => {
    expect(clientStatus(c(10, 900, 200))).toBe('vip');
  });
});
