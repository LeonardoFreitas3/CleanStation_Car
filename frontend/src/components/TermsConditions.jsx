import React from 'react';
import LegalModal from './LegalModal';
import { SITE } from '../mock';
import { useLang } from '../i18n';

export default function TermsConditions({ open, onClose }) {
  const { lang } = useLang();

  if (lang === 'en') {
    return (
      <LegalModal open={open} onClose={onClose} title="Terms & Conditions">
        <p><strong>Last updated:</strong> June 2025</p>

        <h2>1. Identification</h2>
        <p>
          <strong>Clean Station Car</strong> — provider of car washing and detailing services<br />
          {SITE.address}, Portugal<br />
          Email: <a href={`mailto:${SITE.email}`} className="text-blue-400">{SITE.email}</a>
        </p>

        <h2>2. Services Provided</h2>
        <p>Clean Station Car provides detailed washing, interior sanitisation, polishing and ceramic protection of motor vehicles, at the indicated premises or by previously agreed call-out.</p>

        <h2>3. Bookings</h2>
        <ul>
          <li>Bookings can be made online, by phone or in person.</li>
          <li>Booking confirmation is sent by email to the address provided.</li>
          <li>Customers must arrive on time. Delays of more than 20 minutes may require rescheduling.</li>
          <li>Cancellations must be communicated at least <strong>24 hours in advance</strong>.</li>
        </ul>

        <h2>4. Prices</h2>
        <ul>
          <li>The prices shown are indicative and may vary according to the condition, size and type of vehicle.</li>
          <li>The final price is confirmed after assessment of the vehicle.</li>
          <li>Prices include VAT at the legal rate in force.</li>
        </ul>

        <h2>5. Payment</h2>
        <p>Payment is made on handover of the vehicle, by cash, bank transfer or other agreed means. No advance payment is required for online bookings.</p>

        <h2>6. Liability</h2>
        <ul>
          <li>Clean Station Car is not liable for pre-existing damage not reported at the time of vehicle handover.</li>
          <li>Customers are advised to record and report any visible damage at handover.</li>
          <li>Personal items left inside the vehicle are the customer's sole responsibility.</li>
        </ul>

        <h2>7. Warranty and Complaints</h2>
        <p>If you are not satisfied with the service provided, contact us within <strong>48 hours</strong> of collecting the vehicle. We will review the situation and, where applicable, correct it at no additional cost.</p>

        <h2>8. Opening Hours</h2>
        <p>Monday to Saturday, 08:00 to 19:00. Closed on Sundays and national holidays.</p>

        <h2>9. Governing Law</h2>
        <p>These terms are governed by Portuguese law. In the event of a dispute, the court of the district of Braga has jurisdiction, without prejudice to alternative dispute resolution.</p>
      </LegalModal>
    );
  }

  return (
    <LegalModal open={open} onClose={onClose} title="Termos & Condições">
      <p><strong>Última atualização:</strong> Junho de 2025</p>

      <h2>1. Identificação</h2>
      <p>
        <strong>Clean Station Car</strong> — prestador de serviços de lavagem e detalhamento automóvel<br />
        {SITE.address}, Portugal<br />
        Email: <a href={`mailto:${SITE.email}`} className="text-blue-400">{SITE.email}</a>
      </p>

      <h2>2. Serviços Prestados</h2>
      <p>A Clean Station Car presta serviços de lavagem detalhada, higienização interior, polimento e proteção cerâmica de veículos automóveis, nas instalações indicadas ou mediante deslocação acordada previamente.</p>

      <h2>3. Marcações</h2>
      <ul>
        <li>As marcações são realizadas online, por telefone ou presencialmente.</li>
        <li>A confirmação da marcação é enviada por email para o endereço fornecido.</li>
        <li>O cliente deve comparecer pontualmente. Atrasos superiores a 20 minutos podem implicar reagendamento.</li>
        <li>Cancelamentos devem ser comunicados com pelo menos <strong>24 horas de antecedência</strong>.</li>
      </ul>

      <h2>4. Preços</h2>
      <ul>
        <li>Os preços apresentados são indicativos e podem variar conforme o estado, dimensão e tipo de veículo.</li>
        <li>O preço final é confirmado após avaliação do veículo.</li>
        <li>Os preços incluem IVA à taxa legal em vigor.</li>
      </ul>

      <h2>5. Pagamento</h2>
      <p>O pagamento é efetuado no momento da entrega do veículo, por dinheiro, transferência bancária ou outros meios acordados. Não é exigido qualquer pagamento antecipado para marcações online.</p>

      <h2>6. Responsabilidade</h2>
      <ul>
        <li>A Clean Station Car não se responsabiliza por danos pré-existentes não comunicados no momento da entrega do veículo.</li>
        <li>Recomenda-se que o cliente registe e comunique quaisquer danos visíveis aquando da entrega.</li>
        <li>Os objetos pessoais deixados no interior do veículo são da exclusiva responsabilidade do cliente.</li>
      </ul>

      <h2>7. Garantia e Reclamações</h2>
      <p>Caso não esteja satisfeito com o serviço prestado, contacte-nos no prazo de <strong>48 horas</strong> após a recolha do veículo. Analisaremos a situação e, se aplicável, procederemos à correção sem custos adicionais.</p>

      <h2>8. Horário de Funcionamento</h2>
      <p>Segunda a Sábado, das 08:00 às 19:00. Encerrado aos Domingos e feriados nacionais.</p>

      <h2>9. Lei Aplicável</h2>
      <p>Os presentes termos regem-se pela legislação portuguesa. Em caso de litígio, é competente o tribunal da comarca de Braga, sem prejuízo do recurso a meios alternativos de resolução de conflitos.</p>
    </LegalModal>
  );
}
