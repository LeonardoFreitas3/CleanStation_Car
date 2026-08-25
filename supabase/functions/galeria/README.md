# galeria

Mostra ao cliente as fotografias do seu carro, através de um link privado.

## Porque existe

Tiram-se fotografias de cada fase e ficavam todas fechadas no CRM. Num negócio
que vende **detalhe**, o antes-e-depois é o argumento de venda — e o cliente
nunca lhe punha os olhos, a não ser que lhas mandassem uma a uma pelo WhatsApp.

## Como funciona

O link é criado na ficha do serviço, no CRM: **Fotografias → Criar link**. Fica
copiado para a área de transferência, e há um botão que o manda por WhatsApp com
uma mensagem já escrita.

O token é um UUID — 122 bits ao acaso. Não há nada para adivinhar, e é por
serviço: quem tem o link de um carro não chega ao do lado.

Válido 30 dias. **Renovar** estica o prazo mantendo o mesmo link, para quem já o
recebeu continuar a poder abri-lo. **Revogar** corta o acesso a toda a gente.

## O que sai, e o que não sai

Devolve o mínimo para o cliente reconhecer o trabalho: serviço, marca e modelo,
data e fotografias.

**Não devolve** telefone, email, matrícula nem preço. Um link partilhado num
grupo de WhatsApp é um link que saiu das mãos do cliente, e a partir daí o que
lá está é o que qualquer pessoa vê. A matrícula fica de fora de propósito:
identifica o carro em qualquer parque do país, e o dono já sabe qual é o carro
dele.

As fotografias continuam num balde privado. O que a página recebe são URLs
assinados de uma hora, renovados enquanto o separador estiver aberto.

## Publicar

```bash
npx supabase functions deploy galeria
```

Sem secrets próprios: usa a `SUPABASE_SERVICE_ROLE_KEY` que o Supabase já
injeta.

## Experimentar

Criar o link num serviço que tenha fotografias e abri-lo numa janela anónima —
sem sessão nenhuma, que é como o cliente o vai ver.

Um serviço sem fotografias devolve 404 com uma mensagem em português, em vez de
uma galeria vazia.
