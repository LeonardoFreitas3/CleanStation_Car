import React from 'react';
import LegalModal from './LegalModal';

export default function PrivacyPolicy({ open, onClose }) {
  return (
    <LegalModal open={open} onClose={onClose} title="Política de Privacidade">
      <p><strong>Última atualização:</strong> Junho de 2025</p>

      <h2>1. Responsável pelo Tratamento</h2>
      <p>
        <strong>Clean Station Car</strong><br />
        R. Conselheiro Lobato 533, 4705-089 Braga, Portugal<br />
        Email: <a href="mailto:cleanstationcar@gmail.com" className="text-blue-400">cleanstationcar@gmail.com</a><br />
        Telefone: +351 934 177 308
      </p>

      <h2>2. Dados Recolhidos</h2>
      <p>Recolhemos os seguintes dados pessoais aquando da marcação online:</p>
      <ul>
        <li>Nome completo</li>
        <li>Número de telefone</li>
        <li>Endereço de email</li>
        <li>Informações sobre o veículo</li>
        <li>Notas adicionais fornecidas voluntariamente</li>
      </ul>

      <h2>3. Finalidade e Base Legal</h2>
      <p>Os dados são tratados para:</p>
      <ul>
        <li><strong>Gestão de marcações</strong> — execução do contrato de prestação de serviços (art. 6.º, n.º 1, al. b) RGPD)</li>
        <li><strong>Comunicações sobre a marcação</strong> — envio de confirmação e lembretes por email/SMS</li>
        <li><strong>Cumprimento de obrigações legais</strong> — faturação e arquivo (art. 6.º, n.º 1, al. c) RGPD)</li>
      </ul>

      <h2>4. Conservação dos Dados</h2>
      <p>Os dados relativos a marcações são conservados durante <strong>3 anos</strong> a contar da data do serviço, salvo obrigação legal que imponha prazo diferente.</p>

      <h2>5. Partilha de Dados</h2>
      <p>Os seus dados não são vendidos nem partilhados com terceiros para fins comerciais. Podemos partilhá-los com:</p>
      <ul>
        <li>Prestadores de serviços de email transacional (Brevo), vinculados por contrato de subprocessamento</li>
        <li>Autoridades competentes, quando exigido por lei</li>
      </ul>

      <h2>6. Os Seus Direitos</h2>
      <p>Ao abrigo do RGPD, tem direito a:</p>
      <ul>
        <li>Aceder aos seus dados pessoais</li>
        <li>Retificar dados incorretos</li>
        <li>Solicitar o apagamento dos dados</li>
        <li>Opor-se ao tratamento</li>
        <li>Portabilidade dos dados</li>
        <li>Apresentar reclamação à CNPD (<a href="https://www.cnpd.pt" className="text-blue-400" target="_blank" rel="noreferrer">www.cnpd.pt</a>)</li>
      </ul>
      <p>Para exercer os seus direitos, contacte-nos por email: <a href="mailto:cleanstationcar@gmail.com" className="text-blue-400">cleanstationcar@gmail.com</a></p>

      <h2>7. Segurança</h2>
      <p>Adotamos medidas técnicas e organizativas adequadas para proteger os seus dados contra acesso não autorizado, perda ou destruição.</p>
    </LegalModal>
  );
}
