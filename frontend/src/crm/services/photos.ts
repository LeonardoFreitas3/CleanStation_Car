import { getSupabase } from '../lib/supabase';
import { friendlyError } from '../lib/errors';
import type { PhotoType, ServicePhoto } from '../types';

const BUCKET = 'service-photos';

/** Validade dos URLs assinados. Curta de proposito: sao dados de clientes. */
const SIGNED_URL_TTL = 60 * 60;

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/**
 * Comprime no browser antes de enviar.
 *
 * Uma fotografia de telemovel anda pelos 4–8 MB. Enviar isso por dados moveis
 * dentro da lavagem e lento e caro, e para documentar um servico 1600px chega.
 * Se algo falhar na compressao devolve-se o ficheiro original — mais vale
 * enviar grande do que nao enviar.
 */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));

    if (scale === 1 && file.size < 1_000_000) return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));

    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadPhoto(
  serviceId: string,
  type: PhotoType,
  file: File,
): Promise<ServicePhoto> {
  const supabase = getSupabase();
  const { data: auth } = await supabase.auth.getUser();

  const blob = await compressImage(file);
  // Nome unico: duas fotos no mesmo segundo colidiriam e a segunda substituia
  // a primeira em silencio.
  const ext = blob.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() || 'jpg');
  const path = `services/${serviceId}/${type}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false });

  if (uploadError) throw new Error(friendlyError(uploadError));

  const { data, error } = await supabase
    .from('service_photos')
    .insert({
      service_id: serviceId,
      storage_path: path,
      photo_type: type,
      uploaded_by: auth.user?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    // O ficheiro ja subiu mas o registo falhou: limpar, senao fica lixo no
    // Storage que ninguem consegue ver nem apagar pela aplicacao.
    await supabase.storage.from(BUCKET).remove([path]);
    throw new Error(friendlyError(error));
  }

  return data as ServicePhoto;
}

export interface PhotoWithUrl extends ServicePhoto {
  url: string;
}

export async function listPhotos(serviceId: string): Promise<PhotoWithUrl[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('service_photos')
    .select('*')
    .eq('service_id', serviceId)
    .order('created_at');

  if (error) throw new Error(friendlyError(error));

  const rows = (data ?? []) as ServicePhoto[];
  if (rows.length === 0) return [];

  // Um pedido para todos os URLs em vez de um por foto.
  const { data: signed, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(rows.map((r) => r.storage_path), SIGNED_URL_TTL);

  if (signError) throw new Error(friendlyError(signError));

  const urlByPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
  return rows
    .map((r) => ({ ...r, url: urlByPath.get(r.storage_path) ?? '' }))
    .filter((r) => r.url);
}

export async function deletePhoto(photo: ServicePhoto): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from('service_photos').delete().eq('id', photo.id);
  if (error) throw new Error(friendlyError(error));

  // Se a linha desapareceu mas o ficheiro ficou, o pior que acontece e ocupar
  // espaco — ninguem lhe chega sem o registo.
  await supabase.storage.from(BUCKET).remove([photo.storage_path]);
}

export const PHOTO_TYPE_LABEL: Record<PhotoType, string> = {
  before: 'Antes',
  during: 'Durante',
  after: 'Depois',
};

/** Trinta dias. Um link partilhado num grupo fica la para sempre; com prazo,
 *  deixa de servir sozinho. Renovar e voltar a partilhar. */
const PARTILHA_DIAS = 30;

export interface Share {
  url: string;
  expiraEm: string;
}

/**
 * Cria (ou renova) o link publico das fotografias de um servico.
 *
 * O token e um UUID: 122 bits ao acaso, nada para adivinhar. Gerado aqui e nao
 * no servidor porque nao ha nada de secreto no acto de o gerar — o que protege
 * e o tamanho do espaco, e a coluna e unica.
 *
 * Renovar mantem o token: quem ja recebeu o link continua a poder abri-lo, que
 * e o que se quer quando se renova. Para cortar o acesso ha o revogar.
 */
export async function shareGallery(serviceId: string): Promise<Share> {
  const db = getSupabase();

  const { data: atual } = await db.from('services')
    .select('share_token').eq('id', serviceId).maybeSingle();

  const token = atual?.share_token ?? crypto.randomUUID();
  const expiraEm = new Date(Date.now() + PARTILHA_DIAS * 86_400_000).toISOString();

  const { error } = await db.from('services')
    .update({ share_token: token, share_expires_at: expiraEm })
    .eq('id', serviceId);

  if (error) throw new Error(friendlyError(error));

  return { url: `${window.location.origin}/galeria/${token}`, expiraEm };
}

/** Corta o acesso. O link deixa de abrir para toda a gente que o tenha. */
export async function revokeGallery(serviceId: string): Promise<void> {
  const { error } = await getSupabase().from('services')
    .update({ share_token: null, share_expires_at: null })
    .eq('id', serviceId);

  if (error) throw new Error(friendlyError(error));
}
