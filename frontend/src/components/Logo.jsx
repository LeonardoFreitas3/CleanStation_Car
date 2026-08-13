import React from 'react';

export default function Logo({ size = 56 }) {
  return (
    <img
      src={`${process.env.PUBLIC_URL}/img/logo.png`}
      alt="Clean Station Car"
      style={{ height: size, width: 'auto' }}
      className="shrink-0"
    />
  );
}
