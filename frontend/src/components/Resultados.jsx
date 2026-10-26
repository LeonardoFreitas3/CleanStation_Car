import React, { useState } from 'react';
import { useLang } from '../i18n';
import { fotoAlt, fotoSrc } from '../fotos';
import Lightbox from './Lightbox';

// Trabalhos reais, antes e depois. Uma secção só, na inicial, sem entrada no
// menu nem botão a mandar para outro sítio: é para ver de passagem, a seguir
// ao "Sobre nós". O recorte de cada par está acertado no gen-fotos.mjs para as
// duas fotografias encaixarem.
export const PARES = [
  { titulo: 'Polimento de faróis', tituloEn: 'Headlight polishing', antes: 'farol-antes', depois: 'farol-depois' },
  { titulo: 'Limpeza interior · zona do condutor', tituloEn: 'Interior cleaning · driver’s area', antes: 'renault-condutor-antes', depois: 'renault-condutor-depois' },
  { titulo: 'Lavagem detalhada · com os bancos removidos', tituloEn: 'Detailed wash · with the seats removed', antes: 'megane-consola-antes', depois: 'megane-interior' },
  { titulo: 'Limpeza interior · zona do passageiro', tituloEn: 'Interior cleaning · passenger’s area', antes: 'renault-passageiro-antes', depois: 'renault-passageiro-depois' },
];

// Em tamanho completo passa-se de uma para a seguinte, par a par.
const FOTOS = PARES.flatMap((p) => [p.antes, p.depois]);

export default function Resultados() {
  const { lang } = useLang();
  const en = lang === 'en';
  const [aberta, setAberta] = useState(null);

  return (
    <section id="resultados" className="bg-black py-24 md:py-32 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="font-display text-white text-4xl md:text-5xl font-black tracking-wide">
            {en ? 'Results' : 'Resultados'}
          </h2>
          <span className="accent-bar mx-auto mt-5" />
          <p className="text-white/55 text-sm mt-5">
            {en ? 'Real work from our workshop, before and after.' : 'Trabalhos reais da nossa oficina, antes e depois.'}
          </p>
        </div>

        {/* Cada par lado a lado, o antes primeiro, com a etiqueta fora da
            fotografia. Também no telemóvel: quatro pares um por cima do outro
            em fotografias inteiras eram oito ecrãs de imagens no meio da
            inicial. Sem comparador de deslizar: os enquadramentos não
            coincidem. */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-x-10">
          {PARES.map((p, i) => (
            <div key={p.depois}>
              <h3 className="text-white/80 text-xs tracking-[0.2em] uppercase font-semibold mb-4">{en ? p.tituloEn : p.titulo}</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[[p.antes, en ? 'Before' : 'Antes'], [p.depois, en ? 'After' : 'Depois']].map(([nome, rotulo], j) => (
                  <figure key={nome}>
                    <figcaption className={`mb-2 text-[10px] tracking-[0.3em] uppercase font-semibold ${j ? 'text-blue-400' : 'text-white/55'}`}>{rotulo}</figcaption>
                    <button
                      type="button"
                      onClick={() => setAberta(i * 2 + j)}
                      aria-label={`${en ? 'Enlarge' : 'Ampliar'}: ${fotoAlt(nome, lang)}`}
                      className="group relative block w-full aspect-[3/4] overflow-hidden rounded-md border border-white/10 bg-[#0e0e0e]"
                    >
                      <img
                        src={fotoSrc(nome, 'mini')}
                        alt={fotoAlt(nome, lang)}
                        width={600}
                        height={800}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-105"
                      />
                    </button>
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Lightbox fotos={FOTOS} indice={aberta} onIndice={setAberta} lang={lang} />
    </section>
  );
}
