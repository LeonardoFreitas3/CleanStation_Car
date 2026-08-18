import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import { SERVICE_STATUS_LABEL } from './services';
import type { ServiceWithRelations } from '../types';

export interface MessageTemplate {
  id: string;
  slug: string;
  name: string;
  category: string;
  content: string;
  active: boolean;
  sort_order: number;
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

/**
 * Substitui as variaveis do modelo.
 *
 * Uma variavel sem valor e removida junto com o espaco que a precede, em vez
 * de deixar "{{veiculo}}" cru na mensagem enviada ao cliente.
 */
export function renderTemplate(content: string, service: ServiceWithRelations): string {
  const vehicle = service.vehicle
    ? [service.vehicle.make, service.vehicle.model].filter(Boolean).join(' ') || service.vehicle.plate
    : '';

  const values: Record<string, string> = {
    nome: service.client?.name?.split(' ')[0] ?? '',
    veiculo: vehicle,
    matricula: service.vehicle?.plate ?? '',
    servico: service.service_name,
    etapa: SERVICE_STATUS_LABEL[service.status].toLowerCase(),
  };

  return content
    .replace(/\s*\{\{(\w+)\}\}/g, (match, key: string) => {
      const value = values[key];
      if (!value) return '';
      return match.startsWith(' ') ? ` ${value}` : value;
    })
    .replace(/\s{2,}/g, ' ')
    .trim();
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
  follow_up: 'Follow-up',
};
