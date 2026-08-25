import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Pagina publica: quem a abre nao tem sessao nenhuma no CRM, nem deve ter. As
// fotografias vivem num balde privado e e a Edge Function que assina os URLs.

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL ?? '';
const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY ?? '';

const ORDEM = { before: 0, during: 1, after: 2 };
const TITULO = { before: 'Antes', during: 'Durante', after: 'Depois' };

export default function Galeria() {
  const { token } = useParams();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [aCarregar, setACarregar] = useState(true);

  const carregar = useCallback(async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/galeria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ANON_KEY}`,
          apikey: ANON_KEY,
        },
        body: JSON.stringify({ token }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? 'Não foi possível abrir a galeria.');
      setDados(body);
    } catch (e) {
      setErro(e.message);
    } finally {
      setACarregar(false);
    }
  }, [token]);

  useEffect(() => { carregar(); }, [carregar]);

  // Fora dos motores de busca. O robots.txt tambem o diz, mas isso e um pedido
  // e isto e uma instrucao na propria pagina — um link privado indexado deixa
  // de ser privado, e o token ia no endereco.
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    const anterior = meta?.content;
    if (meta) meta.content = 'noindex, nofollow';
    return () => { if (meta && anterior !== undefined) meta.content = anterior; };
  }, []);

  // Os URLs assinados duram uma hora. Quem deixar o separador aberto a tarde
  // toda volta a encontrar as fotografias, em vez de uma pagina de cruzes.
  useEffect(() => {
    const t = setInterval(carregar, 50 * 60 * 1000);
    return () => clearInterval(t);
  }, [carregar]);

  const porTipo = (dados?.fotografias ?? []).reduce((acc, f) => {
    (acc[f.tipo] = acc[f.tipo] ?? []).push(f);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between gap-4">
          <img src="/img/logo.png" alt="Clean Station Car" className="h-9 w-auto" />
          <a
            href="https://wa.me/351913733791"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] tracking-[0.2em] uppercase text-white/50 hover:text-white transition"
          >
            Falar connosco
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {aCarregar && (
          <div className="py-24 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/40" /></div>
        )}

        {erro && !aCarregar && (
          <div className="py-24 text-center">
            <p className="text-white/70">{erro}</p>
            <a
              href="https://wa.me/351913733791"
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-6 text-blue-400 hover:text-blue-300 text-sm transition"
            >
              Pedir um link novo
            </a>
          </div>
        )}

        {dados && (
          <>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/40">O seu carro</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mt-2">
              {dados.viatura || dados.servico}
            </h1>
            <p className="text-white/50 text-sm mt-2">
              {dados.viatura ? `${dados.servico} · ` : ''}
              {new Date(dados.data).toLocaleDateString('pt-PT', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>

            {Object.keys(porTipo)
              .sort((a, b) => (ORDEM[a] ?? 9) - (ORDEM[b] ?? 9))
              .map((tipo) => (
                <section key={tipo} className="mt-12">
                  <h2 className="text-[10px] tracking-[0.28em] uppercase text-white/45 mb-4">
                    {TITULO[tipo] ?? tipo}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {porTipo[tipo].map((f) => (
                      <img
                        key={f.url}
                        src={f.url}
                        alt={`${TITULO[tipo] ?? tipo} — ${dados.viatura || dados.servico}`}
                        loading="lazy"
                        className="w-full rounded-sm border border-white/10 bg-white/5"
                      />
                    ))}
                  </div>
                </section>
              ))}

            <p className="text-white/30 text-xs mt-16 leading-relaxed">
              Este link é privado e tem prazo. Se quiser guardar as fotografias, transfira-as
              para o seu telemóvel.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
