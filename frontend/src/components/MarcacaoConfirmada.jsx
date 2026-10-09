'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import Header from './Header';
import { eur, formatDuration } from '../booking/pricing';
import { initAnalytics, trackBookingConfirmed } from '../analytics';

// O formulário de marcação escreve aqui a marcação acabada de gravar, e só
// depois manda para esta página. Sem ela, quem chega cá (um link partilhado, o
// histórico, um refresh) vai para a inicial: a visita a esta página é a
// conversão do Google Ads, e só pode contar quando houve marcação a sério.
export const MARCACAO_KEY = 'csc_marcacao_confirmada';

export default function MarcacaoConfirmada() {
  const [marcacao, setMarcacao] = useState(null);

  useEffect(() => {
    let lida = null;
    try {
      lida = JSON.parse(sessionStorage.getItem(MARCACAO_KEY));
    } catch {
      // sessionStorage bloqueado: trata-se como se não houvesse marcação.
    }
    if (!lida) {
      window.location.replace(`${process.env.PUBLIC_URL}/`);
      return undefined;
    }
    setMarcacao(lida);
    // A conversão, uma vez por referência: a função anota a referência e um
    // refresh — ou um segundo clique no histórico — não a volta a contar. Só
    // sai se houver consentimento, que é o que carrega a etiqueta.
    initAnalytics();
    trackBookingConfirmed({ reference: lida.reference ?? lida.eventId, value: lida.price });
    // Lida uma vez: um refresh não volta a contar a conversão. Apagada num
    // timeout e não logo: o React em desenvolvimento corre o efeito duas vezes,
    // e a segunda já não a encontrava.
    const t = setTimeout(() => {
      try { sessionStorage.removeItem(MARCACAO_KEY); } catch { /* idem */ }
    });
    return () => clearTimeout(t);
  }, []);

  if (!marcacao) return <div className="min-h-screen bg-black" />;

  const quando = new Date(`${marcacao.date}T${marcacao.time}`).toLocaleDateString('pt-PT', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const linhas = [
    ['Veículo', marcacao.vehicle],
    ['Serviço', marcacao.service],
    ['Entrega', `${quando}, ${marcacao.time}`],
    ['Duração estimada', marcacao.duration ? formatDuration(marcacao.duration) : null],
    ['Preço estimado', marcacao.price ? `${eur(marcacao.price)} · IVA incluído` : null],
  ].filter(([, v]) => v);

  return (
    <div className="bg-black text-white min-h-screen">
      <Header />
      <main className="max-w-xl mx-auto px-6 pt-40 pb-24 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-900/40 border border-emerald-700 flex items-center justify-center mx-auto">
          <Check className="w-7 h-7 text-emerald-400" aria-hidden="true" />
        </div>
        {/* "Pedido recebido" e não "confirmada": a hora fica reservada na
            agenda, mas é a oficina que confirma por contacto. Prometer uma
            confirmação que ainda vai acontecer era prometer a mais. */}
        <h1 className="font-display text-white text-2xl md:text-3xl font-black mt-6">
          Pedido recebido. Obrigado por escolheres a Clean Station Car.
        </h1>
        <p className="text-white/60 text-sm mt-5 leading-relaxed">
          A tua hora ficou reservada na nossa agenda. Entramos em contacto para confirmar.
        </p>

        <dl className="mt-8 text-left border border-white/10 bg-[#0e0e0e] rounded-md divide-y divide-white/10">
          {linhas.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-5 py-3 text-sm">
              <dt className="text-white/60">{k}</dt>
              <dd className="text-white text-right">{v}</dd>
            </div>
          ))}
        </dl>

        {marcacao.reference && (
          <p className="text-white/50 text-xs mt-4">
            Referência <span className="text-blue-400 font-mono">#{marcacao.reference}</span>
          </p>
        )}
        <p className="text-white/60 text-xs mt-5 leading-relaxed">
          {marcacao.email
            ? 'Enviámos também esta confirmação para o teu email.'
            : 'Sem email não há mensagem; esta página é a tua confirmação.'}
          {' '}O valor é uma estimativa para o tipo de veículo escolhido e pode ter suplemento se a
          sujidade for fora do normal — sempre aprovado contigo antes do serviço.
        </p>
        <Link
          href="/"
          className="mt-10 inline-block px-7 py-4 border border-white/20 hover:border-blue-500 text-white text-xs tracking-[0.2em] uppercase font-bold transition"
        >
          Voltar ao início
        </Link>
      </main>
    </div>
  );
}
