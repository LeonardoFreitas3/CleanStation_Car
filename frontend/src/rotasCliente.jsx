import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// O CRM e a galeria continuam a ser aplicações de uma página, com o seu
// react-router: estão fechadas por sessão ou por token, o Google não tem nada a
// ver com elas, e reescrever-lhes as rotas não dava nada a ninguém.
//
// O Next não as conhece como páginas. Um endereço /crm/... ou /galeria/... cai
// no not-found (app/not-found.jsx), que monta isto — e o _redirects da Netlify
// serve esse mesmo ficheiro com 200 em vez de 404.
const CrmApp = lazy(() => import('./crm/CrmApp'));
const Galeria = lazy(() => import('./gallery/Galeria'));

// Um endereço que não existe vai para a página inicial, como sempre foi.
function ParaInicial() {
  useEffect(() => { window.location.replace(`${process.env.PUBLIC_URL}/`); }, []);
  return null;
}

export default function RotasCliente() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <Routes>
          <Route path="/crm/*" element={<CrmApp />} />
          {/* Publica de proposito: quem recebe o link nao tem conta nenhuma.
              O token e que da acesso, e so aquele servico. */}
          <Route path="/galeria/:token" element={<><title>Clean Station Car</title><Galeria /></>} />
          <Route path="*" element={<ParaInicial />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
