import { useEffect, useRef } from 'react';

/**
 * Liga um <dialog> nativo a um estado do React.
 *
 * O <dialog> com showModal() dá o que uma div por cima da página não dá:
 * camada de topo, teclado preso lá dentro, resto da página inerte, Escape a
 * fechar e o foco devolvido a quem abriu. Isto é só a cablagem entre ele e o
 * React, que sozinha se escrevia igual em cada janela.
 *
 * @param open    se a janela deve estar aberta
 * @param onClose chamado quando ela fecha, seja por que via for
 * @param blockEscape opcional: devolve true para o Escape não fechar. Serve
 *        para formulários a meio, onde fechar por engano deita fora o que a
 *        pessoa escreveu.
 */
export default function useModalDialog(open, onClose, blockEscape) {
  const ref = useRef(null);

  // Guardados em refs para o efeito não se voltar a montar a cada render: quem
  // usa isto passa funções novas de cada vez, e reinstalar os ouvintes a meio
  // de uma interação é como se perdem eventos.
  const onCloseRef = useRef(onClose);
  const blockRef = useRef(blockEscape);
  onCloseRef.current = onClose;
  blockRef.current = blockEscape;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // showModal() é o que põe a janela na camada de topo. open={true} no JSX
    // abria-a como uma caixa qualquer, sem nada disto.
    if (!el.open) el.showModal();

    // Os ouvintes ficam no próprio elemento e não nas props do JSX: 'close' e
    // 'cancel' não borbulham, e a delegação de eventos do React depende disso.
    const handleClose = () => onCloseRef.current();
    const handleCancel = (e) => { if (blockRef.current && blockRef.current()) e.preventDefault(); };
    el.addEventListener('close', handleClose);
    el.addEventListener('cancel', handleCancel);

    // A camada de topo torna o fundo inerte mas não impede a roda do rato de
    // o rolar por baixo.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      el.removeEventListener('close', handleClose);
      el.removeEventListener('cancel', handleCancel);
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Fechar passa sempre pelo close() do browser antes de desmontar: é ele que
  // devolve o foco a quem abriu. Tirar o elemento do DOM primeiro deixava o
  // foco no body, e quem navega por teclado voltava ao topo da página.
  const dismiss = () => { ref.current?.close(); onClose(); };

  return { ref, dismiss };
}
