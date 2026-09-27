# Repertório de cenas

Tudo que foi construído no site Maple Tech (agência de marketing para restaurantes), descrito como padrão transferível. Use como vocabulário e banco de ideias, **nunca como molde**: a nova marca pede a própria metáfora. Regra de ouro: cada cena **termina na cor/superfície exata em que a próxima começa**, então não existe corte seco, é um plano-sequência.

## Sequência do filme (a home)

| Seção        | Cena                                                          | Como entra                                      | Como sai                                          |
| ------------ | ------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| Hero         | Vídeo cinematográfico de fundo, título estático, celular sobe | carregamento                                    | celular domina a tela                             |
| Problema     | **Mergulho no "o"**                                           | folha escura sobe sobre o hero                  | zoom entra no miolo do "o" até a tela virar papel |
| Antes/Depois | **Celular que vira e mergulha**                               | já está no papel                                | verso do celular (tinta) cobre a tela             |
| Soluções     | **O Diafragma**                                               | nasce do preto                                  | última foto aberta até a próxima folha subir      |
| Para quem    | **O Relógio da Fome**                                         | folha clara sobe sobre o escuro                 | congela no mosaico noturno                        |
| Método       | **O Tambor**                                                  | entra da **direita** sobre a anterior congelada | congela                                           |
| Dados        | **A Comanda**                                                 | entra da **esquerda** (direção oposta)          | comanda arrancada, CTA bordô sobe                 |
| CTA + Rodapé | **A Folha que Cai** (voo depois removido)                     | folha bordô sobe                                | folha no CTA e no logo do rodapé                  |

Alternar a direção das entradas laterais (direita, depois esquerda) dá ritmo de montagem.

## As cenas

### Mergulho na letra (Problema)

Cena fixa. A frase começa quase apagada e acende palavra por palavra (a virada em serif dourada). O texto de apoio entra e fica tempo suficiente para ser lido. Tudo escurece menos uma letra ("o" de "olhos"), cujo miolo acende como pupila. A câmera acelera (power4.in, ~60×) para dentro da letra até o miolo, com a cor da próxima seção, ocupar a tela. **Transferível:** entrar por um glifo que tem significado para a frase.

### Virada do objeto (Antes/Depois)

Um mockup (celular em HTML/CSS) fixo muda de estado em etapas enquanto as frases trocam ao lado ("Encontrado. Desejado. Pedido."). No fim vai ao centro, gira na diagonal mostrando o verso (tinta, câmera, símbolo da marca) e a câmera mergulha no símbolo até a cor dele cobrir a tela. Verso mais escuro que a tinta (#0b0b0b) para ter profundidade.

### O Diafragma (serviços)

Tela preta com um ponto de luz. Sete lâminas SVG sombreadas pelo ângulo, com um fio dourado na borda, giram e recuam com o scroll revelando a foto do serviço em tela cheia (assenta de um leve zoom). Nome grande, uma linha, botão. O diafragma fecha no ponto de luz e reabre no próximo, como cortes de filme. Índice discreto no canto, clicável, o atual em dourado. **Transferível:** qualquer lista curta (3 a 5 itens) que merece uma tela cheia cada.

### O Relógio da Fome (público)

Cena fixa em que o scroll avança o dia. Cada público tem sua hora (lanchonete ao meio-dia, bistrô 20h, pizzaria sexta 21h, alta gastronomia 21h30). Um relógio grande em serif gira os ponteiros; a luz da página vai do papel ao dourado da tarde, ao pôr do sol bordô, até a noite em grafite; um brilho de sol desce e vira lâmpada. A foto de cada público sobe no quadro. Termina com todos em mosaico (o quadro estático que congela). A navbar escurece quando o sol se põe. **Transferível:** transformar uma lista de segmentos em uma passagem de tempo real para aquele negócio.

### O Tambor (método/etapas)

As etapas num tambor tipográfico 3D gigante (rotateX). Palavras fora do centro só em contorno, sumindo ao girar; no centro, uma lente com fios dourados mostra a palavra sólida e um brilho varre a cada troca. Pausa em cada palavra para leitura. Painel lateral com o texto da etapa e barra de progresso. No celular, tambor acima do texto.

### A Comanda (dados)

Uma impressora térmica sob luz quente imprime linha a linha um "extrato do setor" em mono (`DELIVERY ........ 71%`). O papel desce e curva, com textura de cabeça de impressão e serrilhado. Ao sair cada linha, um odômetro no painel ao lado gira até o valor e mostra a frase. O dado que a marca muda sai na cor da marca e é **circulado à mão**. Fecha com uma frase, código de barras, domínio; a comanda é arrancada e sai girando. Cada linha traz a base do número em letra pequena. **Transferível:** dar aos números um objeto físico do universo do cliente (extrato, nota, ingresso, bilhete).

### A Folha que Cai (CTA + rodapé)

O símbolo grande em marca d'água no CTA se solta depois do título e cai com o scroll, balançando e girando em 3D como uma folha real, muda de cor ao cruzar a emenda e pousa exatamente onde o símbolo do logo do rodapé é desenhado (a troca não aparece). Parada, reage ao mouse como vento. Volta subindo se rolar para cima. **Transferível:** o rodapé fecha a história com o símbolo que abriu o site.
**Desfecho real:** o usuário aprovou a ideia, mas depois pediu para manter a folha no CTA e no rodapé **sem a animação**. Depois de um site intenso, o fim pede calma: proponha o rodapé animado, mas deixe fácil desligar o voo. O rodapé também passou por "MAPLE gigante de ponta a ponta", "colado na base da página" e "menor e discreto" antes de chegar nisso: não assuma que wordmark gigante é o final certo.

### Transições entre capítulos

- **Folha que sobe:** seção com cantos superiores arredondados sobe por cima da anterior.
- **Congelar e cobrir (FreezeBehind + SlideInSheet):** a seção anterior congela no último quadro, recua (scale 0.88), escurece (sombra até 75%) e é empurrada ~8% para o lado oposto, enquanto a nova entra de lado com a borda de ataque arredondada, em 2 telas de scroll, curva `power2.inOut`.

## Ideias propostas e não escolhidas (banco)

Úteis para outras marcas. Entre parênteses, por que perderam aqui.

- **Para onde vai cada real:** uma fita que representa o faturamento vai sendo cortada pelo scroll em fatias (desvios). Diagrama de fluxo filmado como plano-sequência. (Ótima para argumento; perdeu para a peça física.)
- **Numerais monumentais:** um número por cena ocupando 60–70% da largura, vídeo passando dentro dos algarismos por máscara, dígitos girando como contador mecânico. (Clássico demais, pouco próprio.)
- **A cidade às 21h:** vista aérea noturna, pontos de luz acendendo, rotas desenhadas. (Frágil no celular, mistura bases dos dados; virou "abertura" possível de um híbrido.)
- **A Cortina:** a página inteira sobe como cortina revelando o rodapé parado por baixo; cursor como lanterna acendendo letras gigantes com foto dentro. (Formato muito conhecido.)
- **O Letreiro:** rodapé como fachada à noite, nome em lâmpadas que acendem uma a uma, "Aberto para novos clientes" com horário ao vivo. (Risco de brega.)
- **Os Créditos:** rodapé como créditos finais de filme, corte seco para o preto, CTA como cena pós-créditos. (Repetia linguagem de outra seção.)
- **Lista em créditos + janela de foto que segue o cursor** com atraso e inclinação pela velocidade (máx. 4°, até 400px, deslocada à direita do cursor, fotos pré-carregadas com prioridade baixa, troca por máscara sem buraco).
- **A Mesa Giratória:** mesa vista de cima com prato por serviço, gira um quarto por trecho. (Exige fotos novas aéreas.)
- **As Quatro Lâminas:** faixas verticais de foto que se abrem uma de cada vez. (Clara, mas conhecida.)
- **A Mesa de Luz:** slides numa mesa de fotógrafo com lupa que amplia. (Exige muita interação, perde no celular.)
- **Mesa de Polaroids:** fotos jogadas uma a uma com peso físico, nome manuscrito. (Quente e de baixo risco.)
- **O Nome é a Janela:** nome gigante com a foto só dentro das letras (máscara), letras que abrem até a foto encher a tela.
- **A Rua à Noite:** travelling lateral por fachadas que acendem. (Ilustração cara.)
- **Grade de 100 pratos:** 100 ícones em que N acendem em cascata para cada percentual. (Funcionou, mas foi superada pela Comanda.)
