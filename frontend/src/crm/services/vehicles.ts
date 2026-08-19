import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import type { Vehicle } from '../types';

export type VehicleInput = Pick<Vehicle, 'client_id' | 'plate'> &
  Partial<Pick<Vehicle, 'make' | 'model' | 'variant' | 'year' | 'color' | 'fuel_type' | 'mileage' | 'notes'>>;

export async function listVehiclesByClient(clientId: string): Promise<Vehicle[]> {
  const { data, error } = await getSupabase()
    .from('vehicles')
    .select('*')
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw new Error(friendlyError(error));
  return (data ?? []) as Vehicle[];
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const { data, error } = await getSupabase()
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(friendlyError(error));
  return (data as Vehicle) ?? null;
}

export async function createVehicle(input: VehicleInput): Promise<Vehicle> {
  const { data, error } = await getSupabase()
    .from('vehicles')
    // plate_norm e coluna gerada pelo Postgres — nunca enviada daqui.
    .insert({ ...input, plate: input.plate.trim().toUpperCase() })
    .select()
    .single();

  if (error) throw new Error(friendlyError(error));
  return data as Vehicle;
}

export async function updateVehicle(id: string, input: Partial<VehicleInput>): Promise<Vehicle> {
  const payload = { ...input };
  if (payload.plate) payload.plate = payload.plate.trim().toUpperCase();

  const { data, error } = await getSupabase()
    .from('vehicles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(friendlyError(error));
  return data as Vehicle;
}

/** Soft delete: o historico de servicos aponta para a viatura. */
export async function softDeleteVehicle(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('vehicles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(friendlyError(error));
}

/** "12-AB-34" a partir de "12ab34", quando o utilizador escreve sem traços. */
export function formatPlate(plate: string): string {
  const clean = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (clean.length !== 6) return plate.toUpperCase();
  return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4, 6)}`;
}
