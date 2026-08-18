import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Ban } from 'lucide-react';
import {
  BUCKET_CLASS, BUCKET_LABEL, listFollowUps,
} from '../services/dashboard';
import type { FollowUp } from '../services/dashboard';
import { daysAgo, eur, whatsappNumber } from '../lib/format';
import { Alert, Card, PageTitle, Spinner } from '../components/ui';

const WINDOWS = [
  { value: 30, label: '30+ dias' },
  { value: 60, label: '60+ dias' },
  { value: 90, label: '90+ dias' },
  { value: 120, label: '120+ dias' },
];

export default function FollowUps() {
  const [minDays, setMinDays] = useState(30);
  const [rows, setRows] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listFollowUps(minDays)
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Não foi possível carregar.'))
      .finally(() => setLoading(false));
  }, [minDays]);

  return (
    <>
      <PageTitle sub={rows.length > 0 ? `${rows.length} ${rows.length === 1 ? 'cliente' : 'clientes'}` : undefined}>
        Follow-ups
      </PageTitle>

      <div className="flex gap-2 mb-6 flex-wrap">
        {WINDOWS.map((w) => (
          <button
            key={w.value}
            onClick={() => setMinDays(w.value)}
            className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase font-semibold border rounded-sm transition ${
              minDays === w.value
                ? 'bg-blue-950/40 border-blue-600 text-blue-300'
                : 'border-white/15 text-white/50 hover:text-white hover:border-white/30'
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      <p className="text-white/40 text-xs mb-6 leading-relaxed">
        Só aparecem clientes que já passaram o seu próprio ritmo habitual. Quem costuma vir de
        60 em 60 dias não é listado aos 30.
      </p>

      {error && <div className="mb-6"><Alert tone="error">{error}</Alert></div>}
      {loading && <div className="py-20 flex justify-center"><Spinner size={26} /></div>}

      {!loading && !error && rows.length === 0 && (
        <div className="border border-dashed border-white/15 rounded-md p-10 text-center">
          <p className="text-white/60 text-sm">Nenhum cliente a contactar nesta janela.</p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((f) => {
            const wa = whatsappNumber(f.phone);
            const message = `Olá ${f.name.split(' ')[0]}! Já passou algum tempo desde a última visita à Clean Station Car. Quer agendar?`;

            return (
              <Card key={f.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/crm/clientes/${f.id}`} className="text-white font-semibold hover:text-blue-400 transition">
                      {f.name}
                    </Link>
                    <div className="text-white/45 text-xs mt-1 truncate">
                      {f.last_service_name ?? 'Sem serviços'} · {daysAgo(f.days_since_last_visit)}
                    </div>
                    <div className="text-white/30 text-xs mt-1">
                      {f.visit_count} {f.visit_count === 1 ? 'visita' : 'visitas'} · {eur(f.total_spent)}
                      {f.avg_days_between_visits && ` · costuma vir a cada ${f.avg_days_between_visits} dias`}
                    </div>
                  </div>

                  <span className={`shrink-0 px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase font-semibold border rounded-sm ${BUCKET_CLASS[f.bucket]}`}>
                    {BUCKET_LABEL[f.bucket]}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10">
                  {/* Reativar um cliente e marketing, nao execucao de servico.
                      Sem consentimento, o RGPD nao permite — e o botao nao
                      aparece, em vez de aparecer e falhar. */}
                  {!f.marketing_consent ? (
                    <span className="inline-flex items-center gap-2 text-white/35 text-xs">
                      <Ban className="w-3.5 h-3.5" /> Sem consentimento de marketing
                    </span>
                  ) : wa ? (
                    <a
                      href={`https://wa.me/${wa}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] tracking-[0.18em] uppercase font-bold rounded-sm transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  ) : (
                    <span className="text-white/35 text-xs">Sem telefone registado</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
