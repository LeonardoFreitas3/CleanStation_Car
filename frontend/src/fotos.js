// As fotografias reais da oficina, geradas por scripts/gen-fotos.mjs.
//
// Um nome por fotografia e o texto alternativo nas duas línguas, escrito uma
// vez: a mesma fotografia aparece no cartão, na galeria e em tamanho completo,
// e três descrições dela acabavam a dizer coisas diferentes.
//
// Os ficheiros são public/img/fotos/<nome>-<variante>.webp; as variantes de
// cada fotografia estão no script. O servicePages.test confirma que as que as
// páginas pedem existem.

export const FOTOS = {
  'porsche-frente': { alt: 'Porsche cinzento na oficina, visto de frente e de lado', altEn: 'Grey Porsche in the workshop, seen from the front and side' },
  instalacoes: { alt: 'Oficina da Clean Station Car, com o chão azul e preto', altEn: 'Clean Station Car workshop, with its blue and black floor' },
  entrada: { alt: 'Entrada da oficina na Rua Conselheiro Lobato, junto ao letreiro Doctor Solution', altEn: 'Workshop entrance on Rua Conselheiro Lobato, next to the Doctor Solution sign' },
  'bmw-espuma': { alt: 'BMW roxo coberto de espuma durante a lavagem', altEn: 'Purple BMW covered in foam during the wash' },
  'bmw-frente': { alt: 'Frente de um BMW roxo com os reflexos das luzes no capô', altEn: 'Front of a purple BMW with the lights reflected on the bonnet' },
  'bmw-interior': { alt: 'Interior de um BMW limpo, visto da porta do condutor', altEn: 'Clean BMW interior, seen from the driver’s door' },
  'bmw-volante': { alt: 'Volante e tablier de um BMW depois da limpeza interior', altEn: 'BMW steering wheel and dashboard after the interior clean' },
  'megane-interior': { alt: 'Interior limpo de um Renault Mégane, com banco em tecido', altEn: 'Clean Renault Mégane interior, with a fabric seat' },
  'porsche-traseira': { alt: 'Traseira de um Porsche cinzento, com o farolim e os dois escapes', altEn: 'Rear of a grey Porsche, with the tail light and twin exhausts' },
  'porsche-interior': { alt: 'Interior limpo de um Porsche', altEn: 'Clean Porsche interior' },
  'farol-maquina': { alt: 'Colaborador a polir um farol com a máquina', altEn: 'Technician polishing a headlight with the machine' },
  'farol-colaborador': { alt: 'Colaborador a preparar o farol de um carro para o polimento', altEn: 'Technician preparing a car headlight for polishing' },
  'farol-antes': { alt: 'Farol amarelado e opaco', altEn: 'Yellowed, hazy headlight' },
  'farol-depois': { alt: 'O mesmo farol transparente, depois do polimento', altEn: 'The same headlight, clear after polishing' },
  'megane-antes': { alt: 'Renault Mégane sem bancos, com a alcatifa suja', altEn: 'Renault Mégane with the seats out and a dirty carpet' },
  'megane-depois': { alt: 'O mesmo Renault Mégane com os bancos montados e o interior limpo', altEn: 'The same Renault Mégane with the seats back in and the interior clean' },
  'renault-condutor-antes': { alt: 'Zona do condutor de um Renault, com o chão sujo', altEn: 'Driver’s area of a Renault, with a dirty floor' },
  'renault-condutor-depois': { alt: 'A mesma zona do condutor, limpa', altEn: 'The same driver’s area, clean' },
  'renault-passageiro-antes': { alt: 'Zona do passageiro de um Renault, com o chão sujo', altEn: 'Passenger’s area of a Renault, with a dirty floor' },
  'renault-passageiro-depois': { alt: 'A mesma zona do passageiro, limpa', altEn: 'The same passenger’s area, clean' },
};

// A oficina e a entrada: na secção da oficina e nos contactos, carregar numa
// abre as duas em tamanho completo.
export const FOTOS_OFICINA = ['instalacoes', 'entrada'];

export const fotoSrc = (nome, variante) => `${process.env.PUBLIC_URL}/img/fotos/${nome}-${variante}.webp`;

export const fotoAlt = (nome, lang) => (lang === 'en' ? FOTOS[nome].altEn : FOTOS[nome].alt);
