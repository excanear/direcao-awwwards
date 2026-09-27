# Princípios visuais

## Os cinco inegociáveis

1. **Uma ideia por tela.** Muito espaço vazio. Frases curtas, tom de keynote.
2. **Tipografia é a estrela.** Títulos gigantes (clamp até ~180px no desktop), tracking negativo que aperta conforme o tamanho cresce, line-height apertado.
3. **Cor como evento.** Fundos neutros dominam; a cor forte da marca aparece pouco e sempre com propósito (CTA, o número que importa, o fim do filme).
4. **Movimento que explica, nunca enfeita.** Todo movimento revela, guia, conecta duas cenas ou dá feedback.
5. **Consistência obsessiva.** Um easing, uma escala de durações, um sistema de raios e espaçamento para o site inteiro.

## Tipografia

- **Display/UI:** neo-grotesca premium variável (Geist, Inter Tight), via `next/font`, subsetada.
- **Editorial (frases de alma):** serifa itálica elegante (Instrument Serif, Fraunces itálico) com moderação. Em um site, virou a assinatura: a palavra-virada de cada título em serif itálico, às vezes em dourado.
- **Palavra de impacto do hero:** serifa de alto contraste, **executiva** (Bodoni Moda itálico, dourado sólido, reto, sem inclinação nem halo). Lição real: o usuário testou caligrafia (Pinyon Script) e grafite (Rubik Wet Paint) e voltou para o executivo. Preferir luxo editorial a estilo "arte de rua" quando a marca é um negócio. Tamanho compensado (itálicos e scripts parecem menores).
- **Dados/labels:** mono com números tabulares (Geist Mono).
- **Logo:** sempre como imagem/SVG oficial, nunca carregar as fontes do logotipo para texto.
- Escala fluida de referência: display-xl `clamp(3rem, 0.9rem + 9.6vw, 11.25rem)` lh 0.9 ls -0.05em → display-lg 7.5rem → display-md 5rem → title 2.75rem → lead 1.5rem → body 1rem → label 0.75rem ls +0.08em.
- **Revise o título gigante letra a letra:** pares colados ("ra", "an", "nt") pedem afrouxar o tracking (-0.05 → -0.035em); hastes que tocam pingos pedem line-height maior (0.9 → 0.98); pontuação puxa a linha e pede compensação óptica; no celular, o tamanho acompanha a largura útil para uma palavra nunca ficar sozinha na linha.

## Cor e matéria

- Paleta mínima: **papel** (claro neutro), **tinta** (grafite, não preto puro), **cor da marca** (ex. bordô), **metal** (dourado para números e detalhes no escuro). Derive tons (paper-light/deep, ink-soft, muted com contraste AA ≥ 4.5:1, linhas com opacidade). Restrinja o Tailwind a essa paleta (`--color-*: initial`).
- **Grão de papel** fixo sobre a página (SVG feTurbulence, opacidade ~3%, sem blend mode): dá à cor chapada a textura de impresso.
- Seções alternam papel, tinta e cor da marca como capítulos.
- O mesmo símbolo da marca atravessa o site (a folha: no verso do celular, na transição, no CTA, cai até o rodapé). Um fio condutor visual que liga começo, meio e fim.

## Componentes de nível alto

- **Navbar flutuante em cápsula de vidro**, solta do topo, que troca claro/escuro conforme a seção embaixo, ganha sombra ao rolar, com um destaque que desliza entre os links e o CTA dentro da cápsula. Menu mobile como cartão flutuante sobre a página desfocada. Esc, toque fora e foco por teclado funcionando.
- **Botões pill**: no hover, o texto rola para cima e um preenchimento sobe de baixo.
- **Links** com sublinhado que se desenha da esquerda e recolhe para a direita (background-size, sem custo de layout).
- **Capítulos como folhas**: seções com cantos superiores arredondados (`--sheet-radius: clamp(1.5rem, 0.8rem + 2.4vw, 3rem)`) que sobem por cima da anterior.
- **Imagens**: revelar por máscara, zoom lento no hover, nunca véu escuro por cima da foto (use sombra localizada só onde há texto).

## Fotos e vídeo

- Fotos devem ser **perfeitas para aquela parte**, não "bonitas genéricas": para cada serviço, a foto mostra literalmente o que ele entrega (o mapa com o perfil, o notebook com o site).
- Baixe na resolução original e faça **um corte por formato** com foco escolhido: largo 2560×1600 para desktop, vertical 1080×1920 (9:16) para celular, 4:5 para cards. Nunca deixe o navegador esticar uma fatia de foto horizontal numa janela vertical.
- Fontes livres de uso comercial (Unsplash, Mixkit). Registre créditos e links no arquivo de conteúdo. Nada pago ou pirateado.
- **Vídeo de hero:** montagem de 4 a 6 cortes com a mesma correção de cor (pretos profundos, tons quentes, vinheta), crossfades, abre e fecha no preto para o loop não pular. 1080p no desktop (~5 MB) e versão vertical 720×1280 no celular (~2 MB). 4K não vale o peso. Aparece do preto só quando está tocando, pausa fora da tela, e com movimento reduzido mostra um quadro parado sem baixar o vídeo. Hero sobre vídeo fica escuro: a palavra de destaque passa para o dourado (a cor da marca some no vídeo).

## Anti-"cara de IA" (feito por IA / vibe-coded)

O usuário rejeita tudo que denuncia template ou IA. Não use:

- Numeração decorativa: `01`, `02`, `01 / 04`, "Etapa 01 / 03", selos numerados em fotos, contadores de passo.
- Travessões e fios antes de rótulos e números (`— LABEL`, `01 —`).
- Chips/tags genéricas de "entregáveis" inventados ("Presença digital", "Concorrência do bairro").
- Nomes fictícios de exemplo ("Cantina Alecrim"): use algo neutro e profissional como "Seu Negócio".
- Ícone + título + parágrafo em grade de 3, gradientes roxos, emojis, cursor customizado, preloader longo, partículas.
- Grades bento genéricas e cards iguais onde uma cena caberia.
  Prefira tipografia limpa e conteúdo real. Ao remover um padrão, procure o mesmo padrão no resto do site e ofereça remover também.

## Restrições padrão (salvo pedido contrário)

- 2D. Sem WebGL/Three.js/canvas 3D: 3D só via CSS transforms (perspectiva, rotateX/Y).
- Uma biblioteca de animação só (GSAP). Nada de Framer Motion junto.
- Não inventar números, depoimentos, clientes. Dado de setor sempre com fonte citada e clicável, com a **base de cada número** explícita ("% dos restaurantes" ≠ "% do faturamento").
- Nunca sacrificar usabilidade por efeito: CTAs evidentes, conteúdo acessível, índice clicável em cenas longas.
