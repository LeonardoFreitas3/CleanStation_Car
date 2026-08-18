import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Trash2, X } from 'lucide-react';
import {
  PHOTO_TYPE_LABEL, deletePhoto, listPhotos, uploadPhoto,
} from '../services/photos';
import type { PhotoWithUrl } from '../services/photos';
import { useAuth } from '../contexts/AuthContext';
import { Alert, Spinner } from './ui';
import type { PhotoType } from '../types';

const TYPES: PhotoType[] = ['before', 'during', 'after'];

export function PhotoUploader({ serviceId }: { serviceId: string }) {
  const { hasRole } = useAuth();
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<PhotoType | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<PhotoWithUrl | null>(null);

  // Um input por tipo: o mesmo input reutilizado obrigava a trocar o estado
  // antes de abrir a camara, o que no telemovel dava condicoes de corrida.
  const inputs = useRef<Record<PhotoType, HTMLInputElement | null>>({
    before: null, during: null, after: null,
  });

  const load = useCallback(async () => {
    try {
      setPhotos(await listPhotos(serviceId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar as fotografias.');
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => { load(); }, [load]);

  const handleFiles = async (type: PhotoType, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(type);
    setProgress({ done: 0, total: files.length });

    try {
      // Em serie e nao em paralelo: dentro da lavagem a ligacao e fraca, e
      // seis uploads ao mesmo tempo falham mais do que seis seguidos.
      for (let i = 0; i < files.length; i++) {
        await uploadPhoto(serviceId, type, files[i]);
        setProgress({ done: i + 1, total: files.length });
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível enviar a fotografia.');
    } finally {
      setUploading(null);
      setProgress({ done: 0, total: 0 });
      const input = inputs.current[type];
      if (input) input.value = '';
    }
  };

  const remove = async (photo: PhotoWithUrl) => {
    if (!window.confirm('Eliminar esta fotografia?')) return;
    try {
      await deletePhoto(photo);
      setLightbox(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível eliminar.');
    }
  };

  if (loading) return <div className="py-8 flex justify-center"><Spinner /></div>;

  return (
    <>
      {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}

      <div className="space-y-6">
        {TYPES.map((type) => {
          const ofType = photos.filter((p) => p.photo_type === type);
          const busy = uploading === type;

          return (
            <div key={type}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-[0.28em] text-white/50 uppercase">
                  {PHOTO_TYPE_LABEL[type]}
                  {ofType.length > 0 && <span className="text-white/30 ml-2">{ofType.length}</span>}
                </span>
              </div>

              <input
                ref={(el) => { inputs.current[type] = el; }}
                type="file"
                accept="image/*"
                // capture="environment" abre a camara traseira direto no
                // telemovel, sem passar pela galeria.
                capture="environment"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(type, e.target.files)}
              />

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {ofType.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setLightbox(p)}
                    className="relative aspect-square rounded-sm overflow-hidden border border-white/10 hover:border-blue-600 transition group"
                  >
                    <img src={p.url} alt={PHOTO_TYPE_LABEL[type]} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}

                {/* Alvo grande: usa-se com uma mao, muitas vezes molhada */}
                <button
                  type="button"
                  onClick={() => inputs.current[type]?.click()}
                  disabled={busy}
                  className="aspect-square rounded-sm border-2 border-dashed border-white/20 hover:border-blue-500 hover:bg-blue-950/20 transition flex flex-col items-center justify-center gap-1.5 text-white/45 hover:text-blue-400 disabled:opacity-50"
                >
                  {busy ? (
                    <>
                      <Spinner />
                      <span className="text-[9px]">{progress.done}/{progress.total}</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-6 h-6" strokeWidth={1.5} />
                      <span className="text-[9px] tracking-[0.1em] uppercase">Adicionar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[80] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Fechar"
            className="absolute top-4 right-4 w-10 h-10 border border-white/20 text-white flex items-center justify-center rounded-sm hover:border-blue-500 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src={lightbox.url}
            alt={PHOTO_TYPE_LABEL[lightbox.photo_type]}
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {hasRole('admin', 'manager') && (
            <button
              onClick={(e) => { e.stopPropagation(); remove(lightbox); }}
              className="absolute bottom-6 inline-flex items-center gap-2 px-5 py-3 bg-red-900/60 border border-red-700 text-red-100 text-xs tracking-[0.2em] uppercase font-bold rounded-sm hover:bg-red-900/80 transition"
            >
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          )}
        </div>
      )}
    </>
  );
}
