import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import { SERVICE_STATUS_LABEL } from './services';
import type { ServiceStatus, ServiceWithRelations } from '../types';

export interface MessageTemplate {
  id: string;
  slug: string;
  name: string;
  category: string;
  content: string;
  active: boolean;
  sort_order: number;
  /**
   * Fase que faz esta mensagem sair sozinha. Null = nunca sai sozinha, so a
   * mao. Ver a 0028: o mapa vive na base de dados para se poder mudar as fases
   * que avisam o cliente sem publicar nada.
   */
  auto_status: ServiceStatus | null;
}

export async function listTemplates(): Promise<MessageTemplate[]> {
  const { data, error } = await getSupabase()
    .from('message_templates')
    .select('*')
    .eq('active', true)
    .order('sort_order');

  if (error) throw new Error(friendlyError(error));
  return (data ?? []) as MessageTemplate[];
}

/** Como listTemplates, mas traz tambem os desativados: as Definicoes reativam-nos. */
export async function listAllTemplates(): Promise<MessageTemplate[]> {
  const { data, error } = await getSupabase()
    .from('message_templates')
    .select('*')
    .order('category')
    .order('sort_order');

  if (error) throw new Error(friendlyError(error));
  return (data ?? []) as MessageTemplate[];
}

/**
 * So o admin chega aqui — a politica do 0006 e clara sobre porque: sao textos
 * que saem em nome da empresa.
 *
 * O slug e a categoria nao se mexem. O slug e a chave estavel (a 0020 escreve
 * por cima dele) e a categoria decide que variaveis o modelo pode usar e em que
 * ecra aparece; mudar qualquer um deles pelo ecra era partir uma referencia sem
 * dar erro nenhum.
 */
export async function updateTemplate(
  id: string,
  patch: { name?: string; content?: string; active?: boolean; auto_status?: ServiceStatus | null },
): Promise<void> {
  const { error } = await getSupabase().from('message_templates').update(patch).eq('id', id);
  if (error) throw new Error(friendlyError(error));
}

/**
 * As variaveis que cada categoria consegue mesmo preencher.
 *
 * Nao e decoracao: a lista de reativacao e por cliente e nao por servico, e por
 * isso o renderFollowUp so tem estas tres a mao. Um {{veiculo}} num modelo de
 * follow-up nao da erro — desaparece, e a mensagem sai com a frase truncada
 * sem ninguem perceber porque. E o aviso que a 0020 escreveu em comentario e
 * que ninguem ia ler.
 */
export const TEMPLATE_VARS: Record<string, string[]> = {
  follow_up: ['nome', 'servico', 'dias'],
};

const TEMPLATE_VARS_DEFAULT = ['nome', 'veiculo', 'matricula', 'servico', 'etapa'];

export const varsForCategory = (category: string): string[] =>
  TEMPLATE_VARS[category] ?? TEMPLATE_VARS_DEFAULT;

/** As variaveis escritas no texto que aquela categoria nao sabe preencher. */
export function unknownVars(content: string, category: string): string[] {
  const permitidas = varsForCategory(category);
  const usadas = [...content.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
  return [...new Set(usadas.filter((v) => !permitidas.includes(v)))];
}

/**
 * Substitui as variaveis do modelo.
 *
 * Uma variavel sem valor e removida junto com o espaco que a precede, em vez
 * de deixar "{{veiculo}}" cru na mensagem enviada ao cliente.
 */
export function applyTemplate(content: string, values: Record<string, string>): string {
  return content
    .replace(/\s*\{\{(\w+)\}\}/g, (match, key: string) => {
      const value = values[key];
      if (!value) return '';
      return match.startsWith(' ') ? ` ${value}` : value;
    })
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function renderTemplate(content: string, service: ServiceWithRelations): string {
  const vehicle = service.vehicle
    ? [service.vehicle.make, service.vehicle.model].filter(Boolean).join(' ') || service.vehicle.plate
    : '';

  return applyTemplate(content, {
    nome: service.client?.name?.split(' ')[0] ?? '',
    veiculo: vehicle,
    matricula: service.vehicle?.plate ?? '',
    servico: service.service_name,
    etapa: SERVICE_STATUS_LABEL[service.status].toLowerCase(),
  });
}

/**
 * O mesmo, para a lista de reativacao.
 *
 * A lista e por cliente e nao por servico, portanto so tem estas tres a mao.
 * Um modelo que peca {{veiculo}} fica com o espaco em branco em vez de mostrar
 * a variavel crua — e o que o applyTemplate ja faz.
 */
export function renderFollowUp(content: string, values: {
  name: string;
  lastServiceName: string | null;
  daysSinceLastVisit: number;
}): string {
  return applyTemplate(content, {
    nome: values.name.split(' ')[0] ?? '',
    servico: values.lastServiceName?.toLowerCase() ?? 'serviço',
    dias: String(values.daysSinceLastVisit),
  });
}

/**
 * Regista o envio.
 *
 * Nao prova que o cliente recebeu — o WhatsApp abre noutra aplicacao e nao ha
 * retorno. Prova que a mensagem foi preparada e por quem, que e o que o RGPD
 * exige poder responder.
 */
export async function logMessage(params: {
  clientId: string;
  serviceId?: string | null;
  templateId?: string | null;
  content: string;
  isMarketing?: boolean;
}): Promise<void> {
  const supabase = getSupabase();
  const { data: auth } = await supabase.auth.getUser();

  const { error } = await supabase.from('message_logs').insert({
    client_id: params.clientId,
    service_id: params.serviceId ?? null,
    template_id: params.templateId ?? null,
    content: params.content,
    is_marketing: params.isMarketing ?? false,
    channel: 'whatsapp',
    sent_by: auth.user?.id ?? null,
  });

  if (error) throw new Error(friendlyError(error));
}

export const MESSAGE_CATEGORY_LABEL: Record<string, string> = {
  rececao: 'Receção',
  inicio: 'Início',
  interior: 'Interior',
  exterior: 'Exterior',
  protecao: 'Proteção',
  controlo: 'Controlo',
  conclusao: 'Conclusão',
  meio: 'A meio',
  follow_up: 'Follow-up',
};
