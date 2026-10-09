import React from 'react';

export default function Logo({ size = 56 }) {
  return (
    // A largura sai da proporção do ficheiro (310x168): com os dois atributos
    // o browser reserva o espaço antes de a imagem chegar, e o cabeçalho não
    // salta.
    <img
      src={`${process.env.PUBLIC_URL}/img/logo.webp`}
      alt="Clean Station Car"
      width={Math.round(size * 310 / 168)}
      height={size}
      className="shrink-0"
    />
  );
}
