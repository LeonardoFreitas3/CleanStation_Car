import React from 'react';
import LegalModal from './LegalModal';
import { useLang } from '../i18n';

export default function CookiePolicy({ open, onClose }) {
  const { lang } = useLang();

  if (lang === 'en') {
    return (
      <LegalModal open={open} onClose={onClose} title="Cookie Policy">
        <p><strong>Last updated:</strong> June 2025</p>

        <h2>1. What are Cookies?</h2>
        <p>Cookies are small text files stored on your device when you visit a website. They allow the site to recognise your device and store information about your preferences.</p>

        <h2>2. Cookies We Use</h2>

        <h3>Strictly Necessary Cookies</h3>
        <p>Essential for the website to work. They do not require consent.</p>
        <table className="w-full text-sm border-collapse mt-2 mb-4">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-2 pr-4 text-white/60 font-semibold">Cookie</th>
              <th className="text-left py-2 pr-4 text-white/60 font-semibold">Purpose</th>
              <th className="text-left py-2 text-white/60 font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/10">
              <td className="py-2 pr-4 text-white/70">csc_cookie_consent</td>
              <td className="py-2 pr-4 text-white/70">Stores your cookie consent choice</td>
              <td className="py-2 text-white/70">1 year</td>
            </tr>
          </tbody>
        </table>

        <h3>Performance Cookies (Analytics)</h3>
        <p>They let us understand how visitors use the website. Only enabled with your consent.</p>
        <table className="w-full text-sm border-collapse mt-2 mb-4">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-2 pr-4 text-white/60 font-semibold">Cookie</th>
              <th className="text-left py-2 pr-4 text-white/60 font-semibold">Purpose</th>
              <th className="text-left py-2 text-white/60 font-semibold">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/10">
              <td className="py-2 pr-4 text-white/70">_ga</td>
              <td className="py-2 pr-4 text-white/70">Google Analytics — distinguishes users</td>
              <td className="py-2 text-white/70">2 years</td>
            </tr>
            <tr className="border-b border-white/10">
              <td className="py-2 pr-4 text-white/70">_ga_*</td>
              <td className="py-2 pr-4 text-white/70">Google Analytics — keeps session state</td>
              <td className="py-2 text-white/70">2 years</td>
            </tr>
          </tbody>
        </table>

        <h2>3. How to Manage Cookies</h2>
        <p>You can manage your cookie preferences at any time:</p>
        <ul>
          <li><strong>Via the banner</strong> — click "Manage preferences" in the cookie banner that appears on your first visit.</li>
          <li><strong>Via the browser</strong> — most browsers let you block or delete cookies in their settings. Check your browser's help menu.</li>
        </ul>
        <p>Note that disabling certain cookies may affect the functionality of the website.</p>

        <h2>4. Third-Party Cookies</h2>
        <p>The website embeds a Google Maps map. Google may set its own cookies when you interact with the map. See the <a href="https://policies.google.com/privacy" className="text-blue-400" target="_blank" rel="noreferrer">Google Privacy Policy</a> for more information.</p>

        <h2>5. Changes to this Policy</h2>
        <p>We may update this policy from time to time. The "last updated" date at the top of this page indicates when it was last revised.</p>

        <h2>6. Contact</h2>
        <p>For questions about the use of cookies, contact us: <a href="mailto:cleanstationcar@gmail.com" className="text-blue-400">cleanstationcar@gmail.com</a></p>
      </LegalModal>
    );
  }

  return (
    <LegalModal open={open} onClose={onClose} title="Política de Cookies">
      <p><strong>Última atualização:</strong> Junho de 2025</p>

      <h2>1. O que são Cookies?</h2>
      <p>Cookies são pequenos ficheiros de texto armazenados no seu dispositivo quando visita um website. Permitem que o site reconheça o seu dispositivo e guarde informações sobre as suas preferências.</p>

      <h2>2. Cookies que Utilizamos</h2>

      <h3>Cookies Estritamente Necessários</h3>
      <p>Essenciais para o funcionamento do website. Não requerem consentimento.</p>
      <table className="w-full text-sm border-collapse mt-2 mb-4">
        <thead>
          <tr className="border-b border-white/20">
            <th className="text-left py-2 pr-4 text-white/60 font-semibold">Cookie</th>
            <th className="text-left py-2 pr-4 text-white/60 font-semibold">Finalidade</th>
            <th className="text-left py-2 text-white/60 font-semibold">Duração</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-white/10">
            <td className="py-2 pr-4 text-white/70">csc_cookie_consent</td>
            <td className="py-2 pr-4 text-white/70">Guarda a sua escolha de consentimento de cookies</td>
            <td className="py-2 text-white/70">1 ano</td>
          </tr>
        </tbody>
      </table>

      <h3>Cookies de Desempenho (Analíticos)</h3>
      <p>Permitem-nos compreender como os visitantes utilizam o website. Apenas ativados com o seu consentimento.</p>
      <table className="w-full text-sm border-collapse mt-2 mb-4">
        <thead>
          <tr className="border-b border-white/20">
            <th className="text-left py-2 pr-4 text-white/60 font-semibold">Cookie</th>
            <th className="text-left py-2 pr-4 text-white/60 font-semibold">Finalidade</th>
            <th className="text-left py-2 text-white/60 font-semibold">Duração</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-white/10">
            <td className="py-2 pr-4 text-white/70">_ga</td>
            <td className="py-2 pr-4 text-white/70">Google Analytics — distingue utilizadores</td>
            <td className="py-2 text-white/70">2 anos</td>
          </tr>
          <tr className="border-b border-white/10">
            <td className="py-2 pr-4 text-white/70">_ga_*</td>
            <td className="py-2 pr-4 text-white/70">Google Analytics — mantém estado de sessão</td>
            <td className="py-2 text-white/70">2 anos</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Como Gerir os Cookies</h2>
      <p>Pode gerir as suas preferências de cookies a qualquer momento:</p>
      <ul>
        <li><strong>Através do banner</strong> — clique em "Gerir preferências" no banner de cookies que aparece na primeira visita.</li>
        <li><strong>Através do browser</strong> — a maioria dos browsers permite bloquear ou eliminar cookies nas definições. Consulte o menu de ajuda do seu browser.</li>
      </ul>
      <p>Note que desativar certos cookies pode afetar a funcionalidade do website.</p>

      <h2>4. Cookies de Terceiros</h2>
      <p>O website incorpora um mapa do Google Maps. O Google pode definir os seus próprios cookies quando interage com o mapa. Consulte a <a href="https://policies.google.com/privacy" className="text-blue-400" target="_blank" rel="noreferrer">Política de Privacidade do Google</a> para mais informações.</p>

      <h2>5. Alterações a esta Política</h2>
      <p>Podemos atualizar esta política periodicamente. A data de "última atualização" no topo desta página indica quando foi revista pela última vez.</p>

      <h2>6. Contacto</h2>
      <p>Para questões sobre o uso de cookies, contacte-nos: <a href="mailto:cleanstationcar@gmail.com" className="text-blue-400">cleanstationcar@gmail.com</a></p>
    </LegalModal>
  );
}
