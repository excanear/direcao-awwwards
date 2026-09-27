# Entrega

## Verificar antes de dizer que terminou

1. `typecheck`, `lint`, `format:check` (e `build` em mudanças grandes).
2. **Rolar de verdade no navegador**, do topo, com a roda do mouse, em **1440px e 390px** (e uma tela baixa, 1366×768, para o hero). Descer e **subir de volta** (toda cena tem que ser reversível).
3. Testar pelo **IP de rede**, não só `localhost`.
4. Testar com **movimento reduzido** e conferir a versão estática.
5. Console sem erros; **sem rolagem horizontal** (medir `scrollWidth` durante as entradas laterais e zooms).
6. Nas emendas: capturar quadros em movimento e confirmar 0px de branco.
7. Medir o que dá para medir (posição da folha a 25/50/75% da entrada, contagens, alinhamentos em px) em vez de "parece certo".
8. Se não conseguiu ver (extensão do navegador não conectou), diga isso claramente e o que conferiu no lugar.

## Formato do relatório

Português claro, frases curtas, sem jargão de código no corpo:

1. **Uma linha de abertura:** o que ficou pronto, onde foi conferido e que os checks passaram. Diga se está sem commit.
2. **O que acontece na rolagem:** lista numerada das batidas, como o usuário vai ver.
3. **Detalhes:** celular, movimento reduzido, navbar.
4. **Problemas que encontrei e corrigi no caminho:** causa real em uma frase cada.
5. **Pontos para você revisar:** todo texto/dado que você escreveu, e onde editar (`content/x.ts`); decisões de marca que você não tomou sozinho.
6. **Para ajustar:** as constantes que controlam ritmo (ex. `SHEET_ENTRANCE_SCREENS`).
7. "Recarregue com **Ctrl+Shift+R**", e pergunte se quer commit/push.

Ao propor direções (Fluxo 1), termine com a recomendação e a pergunta "Qual você quer que eu construa?". Nada de implementar antes.
