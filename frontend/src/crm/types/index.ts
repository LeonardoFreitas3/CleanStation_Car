// Tipos do dominio do CRM. Espelham as tabelas criadas em
// supabase/migrations/0001_schema.sql — se mexeres numa, mexe na outra.

export type UserRole = 'admin' | 'manager' | 'employee';

export type ClientType = 'particular' | 'empresa' | 'stand';

/** Ordem igual a do enum service_status no Postgres: e a ordem do fluxo. */
export type ServiceStatus =
  | 'agendado'
  | 'recebido'
  | 'preparacao'
  | 'lavagem'
  | 'detalhe_interior'
  | 'detalhe_exterior'
  | 'protecao'
  | 'controlo_qualidade'
  | 'concluido'
  | 'entregue'
  | 'cancelado';

export type PhotoType = 'before' | 'during' | 'after';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  client_type: ClientType;
  notes: string | null;
  data_consent: boolean;
  data_consent_at: string | null;
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  deleted_at: string | null;
}

export interface Vehicle {
  id: string;
  client_id: string;
  plate: string;
  /** Coluna gerada pelo Postgres: maiusculas, sem separadores. Nunca escrever. */
  plate_norm: string;
  make: string | null;
  model: string | null;
  variant: string | null;
  year: number | null;
  color: string | null;
  fuel_type: string | null;
  mileage: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ServiceType {
  id: string;
  slug: string;
  name: string;
  /** 'extras' identifica os complementos faturaveis, nao servicos principais. */
  category: string;
  base_price: number;
  /** Preço por tipo de veículo. Vazio = preço único em base_price. */
  prices: Record<string, number>;
  /**
   * Dias ate valer a pena repetir o servico. Null = nunca lembrar, que e o
   * valor por omissao. Ver a migracao 0024: e o que decide quem recebe o
   * lembrete de manutencao.
   */
  repeat_after_days: number | null;
  active: boolean;
  sort_order: number;
}

export interface ServiceExtra {
  slug: string;
  name: string;
  price: number;
}

export interface Service {
  id: string;
  /** Numero curto para falar com o cliente. Gerado pelo Postgres. */
  reference: number;
  client_id: string;
  vehicle_id: string | null;
  employee_id: string | null;
  /** Quando saiu o lembrete da vespera. Null: ainda nao saiu. */
  reminded_at: string | null;
  /** Quando saiu o lembrete de manutencao deste servico. Null: ainda nao saiu. */
  maintenance_reminded_at: string | null;
  /**
   * Quando o cliente levou mesmo o carro. Carimbado no 'entregue', ao contrario
   * do completed_at, que fica no 'concluido' e nunca mais mexe. Ver a 0025.
   */
  delivered_at: string | null;
  /** Quando saiu o pedido de avaliacao. Null: ainda nao saiu. */
  review_requested_at: string | null;
  /** Token da galeria publica. Null: nunca foi partilhada, ou foi revogada. */
  share_token: string | null;
  share_expires_at: string | null;
  service_type_id: string | null;
  /** Instantaneo do catalogo: o historico nao pode mudar se o preco mudar. */
  service_name: string;
  price: number;
  extras_total: number;
  discount: number;
  /** Coluna gerada: price + extras_total - discount. Nunca escrever. */
  total: number;
  extras: ServiceExtra[];
  status: ServiceStatus;
  notes: string | null;
  scheduled_at: string | null;
  /** Quanto tempo ocupa a oficina. Nulo nos servicos anteriores a 0013. */
  duration_minutes: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  deleted_at: string | null;
}

/**
 * Linha da vista client_overview: cliente com estatisticas ja agregadas pelo
 * Postgres. O estado (Novo/VIP/Inativo) nao vem daqui — e derivado em
 * clientStatus() a partir destes numeros, para os limiares viverem num sitio
 * so ate existir a pagina de definicoes.
 */
export interface ClientOverview {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  client_type: ClientType;
  notes: string | null;
  data_consent: boolean;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  visit_count: number;
  total_spent: number;
  last_visit_at: string | null;
  vehicle_count: number;
  days_since_last_visit: number | null;
  avg_days_between_visits: number | null;
}

export type ClientStatus = 'novo' | 'ativo' | 'recorrente' | 'vip' | 'inativo';

export interface ServicePhoto {
  id: string;
  service_id: string;
  storage_path: string;
  photo_type: PhotoType;
  uploaded_by: string | null;
  created_at: string;
}

export interface AuditLog {
  id: number;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  changes: Record<string, unknown> | null;
  created_at: string;
}

/** Linhas com as relacoes ja resolvidas, como vem dos selects com join. */
export interface ServiceWithRelations extends Service {
  client: Pick<Client, 'id' | 'name' | 'phone' | 'email'> | null;
  vehicle: Pick<Vehicle, 'id' | 'plate' | 'make' | 'model'> | null;
  employee: Pick<Profile, 'id' | 'full_name'> | null;
}

/** Folga marcada no CRM. Bloqueia as horas nas marcacoes do site. */
export interface TimeOff {
  id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_at: string;
  created_by: string | null;
  /** Evento correspondente no Google Calendar. Null se o espelho falhou. */
  google_event_id: string | null;
}
