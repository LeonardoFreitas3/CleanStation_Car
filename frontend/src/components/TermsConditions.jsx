import React from 'react';
import LegalModal from './LegalModal';

export default function TermsConditions({ open, onClose }) {
  return (
    <LegalModal open={open} onClose={onClose} title="Termos & Condições">
      <p><strong>Última atualização:</strong> Junho de 2025</p>

      <h2>1. Identificação</h2>
      <p>
        <strong>Clean Station Car</strong> — prestador de serviços de lavagem e detalhamento automóvel<br />
        R. Conselheiro Lobato 533, 4705-089 Braga, Portugal<br />
        Email: <a href="mailto:cleanstationcar@gmail.com" className="text-blue-400">cleanstationcar@gmail.com</a>
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
