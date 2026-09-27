# Engenharia de scroll

Stack de referência: Next.js (App Router) + TypeScript strict + Tailwind 4 + `gsap` (ScrollTrigger, SplitText, CustomEase, todos grátis) + `@gsap/react` + `lenis`. Em Next 16+, leia `node_modules/next/dist/docs/` antes de codar. Código real em `../assets/templates/`.

## Fundação

- **Um único ponto de registro do GSAP** (`lib/gsap.ts`): registra plugins, cria o CustomEase da marca, define `gsap.defaults`. Todo componente importa GSAP dali.
- **Um easing e uma escala de durações** (`lib/motion.ts`), espelhados no CSS:
  - `EASE` = `cubic-bezier(0.22, 1, 0.36, 1)` (entradas); `--ease-maple-in-out` = `cubic-bezier(0.76, 0, 0.24, 1)` (transições de capítulo).
  - `DURATION` fast 0.6 / base 0.9 / slow 1.2s; `STAGGER` 0.08; `REVEAL_START` "top 85%".
  - Constantes ajustáveis num lugar só (ex. `SHEET_ENTRANCE_SCREENS = 2`).
- **Lenis** só com ponteiro fino e movimento permitido, ligado ao ticker do GSAP (`autoRaf: false`, `lenis.on("scroll", ScrollTrigger.update)`, `lagSmoothing(0)`). `ScrollTrigger.refresh()` depois de `document.fonts.ready`.
- **`MotionProvider`** expõe `reduced`; override por `<html data-motion="reduce|full">` para testar no `/styleguide`.
- Classe `js` no `<html>` antes do primeiro paint (script inline no layout). Variantes Tailwind `motion-ok` (JS + movimento permitido) e `reduced`.
- `useGSAP` com `dependencies: [reduced]` e `revertOnUpdate: true`. Anime **só transform e opacity**.

## Cena fixa (pinned scene)

- Prefira **`position: sticky`** num trilho alto a `pin` do GSAP: mais barato e estável.
- **O comprimento do trilho nunca depende de uma classe utilitária gerada** (`h-[520svh]`). Use `data-track` + `style={{ "--track": "520svh", "--track-md": "..." }}` e **uma regra fixa** no CSS global aplicada só com JS + movimento. Motivo: quando o dev server parou de gerar CSS novo, a classe sumiu, a cena ficou com uma tela de altura e o usuário via "só o primeiro item e já pula para a próxima seção".
- Timeline com `scrub: 0.6`, `ease: "none"` por padrão, `invalidateOnRefresh: true`. Batidas com `addLabel`; **pausas de leitura** com `.to({}, { duration: 1 })`.
- Mais scroll no desktop que no celular (ex. 420svh vs 340svh). Estime ~1 tela por batida de conteúdo + pausas.
- Medidas geométricas (centro de um glifo, escala final de um zoom) refeitas em `ScrollTrigger.addEventListener("refreshInit", measure)`. Meça com `offset*` (ignoram transforms).
- **Zoom extremo (60×–150×): arredonde a geometria para pixels inteiros.** Meio pixel entre origem e alvo vira 80px de deslize no fim.
- Um objeto ampliado estica a página: `overflow: clip` na seção nos dois eixos (não `hidden`, para não quebrar sticky).
- Se a cena termina numa cor diferente de onde começou, troque `data-nav-theme` da seção no `onUpdate` no quadro exato.

## Transições entre capítulos

- **Folha que sobe:** utilitário `sheet` (z-index 1, cantos superiores `--sheet-radius`) + `-mt-(--sheet-radius)` para os cantos ficarem sobre a seção anterior.
- **Congelar e cobrir de lado:** `FreezeBehind` na seção que sai (pin sem pinSpacing de `bottom bottom` por N telas, conteúdo `data-freeze-content` recua 0.88 e escurece) + `SlideInSheet from="right|left"` na que entra. A que entra fica presa no topo (um `y` que cancela exatamente o percurso vertical), desliza com `power2.inOut`, recortada a uma tela com `clip-path: inset(... round ...)` só na borda de ataque; a de trás é empurrada ~8% ao contrário. Offsets removidos em `refreshInit` e recolocados em `refresh`.
- **Entrada lenta = mais scroll**, não mais duração: 2 telas por entrada. O usuário achou 1 tela "rápido demais".
- O espaço extra antes da entrada é calculado **em pixels de `window.innerHeight`**, não em `vh`/`svh` (no celular, `vh` conta a barra de endereço como escondida e sobra uma faixa sem cobertura).

## Costuras (vazamento de branco)

Sempre que aparecer branco em canto, borda ou durante a rolagem:

1. **Cantos arredondados sobre o fundo da página:** a folha precisa subir sobre a seção anterior (margem negativa do raio), senão os cantos mostram o `html`.
2. **Fundo da página acompanha a seção na tela:** a navbar/observer define `html[data-page-tone="dark"]`. Qualquer lacuna de um quadro entre o scroll e as cenas fixas fica da mesma cor do entorno.
3. **Duas seções adjacentes devem ter exatamente o mesmo fundo** na emenda (inclusive a de trás congelada: faça o fundo dela seguir a luz final da cena).
4. Meça: role com a roda do mouse e capture 100+ quadros em movimento, conte pixels claros no trecho escuro. Só diga "resolvido" com 0px.

## Navbar que troca de tema

`IntersectionObserver` com a raiz reduzida a uma linha de 1px no centro vertical da navbar; com duas seções sob ela (uma congelada embaixo da folha), vence a **última no documento** (desenhada por cima). `MutationObserver` em `data-nav-theme` para seções que trocam de tom no meio da cena.

## Estado sem hidratação

Mockups grandes (celular em HTML/CSS) são renderizados no servidor e mudam de estado por atributos no ancestral (`data-found`, `data-desired`) + variantes Tailwind (`mock-found:`). Dimensione por variável CSS (`--phone-h`) e `em`, **nunca por container queries de tamanho** (dobrou o tempo do primeiro layout).

## Performance (armadilhas medidas)

- **Nada de animação de entrada no título/lead do LCP.** Atrasou o FCP ~0,5s e registrou o LCP de novo. Hero estático; entradas só em detalhes pequenos e abaixo da dobra.
- **Fonte usada dentro do elemento LCP tem que ter `preload: true`.** Sem isso, a troca de fonte re-registrou o LCP (0,9s → 2,4s em CPU 4× lenta). Só uma fonte pré-carregada: a da palavra de destaque.
- Imagens com `next/image`, AVIF/WebP, `sizes` corretos. **Trocou uma foto? Mude o nome do arquivo:** o cache do otimizador do Next serve a versão antiga pelo nome.
- Pré-carregue fotos de hover em segundo plano (`fetchPriority="low"`) só onde a interação existe (desktop).
- Vídeo pausa fora da tela; com movimento reduzido nem é baixado.
- Metas: Lighthouse ≥ 95 mobile, LCP < 1.5s, CLS < 0.05, INP < 200ms. Lighthouse local tende a mostrar TBT pior que o PageSpeed.

## Diagnóstico: "no meu navegador a cena quebra, aqui funciona"

Em ordem:

1. **Origem bloqueada no dev server (Next 16):** o usuário abre por IP de rede/VPN (`192.168.x.x:3000`) e o Next bloqueia recursos internos ("Blocked cross-origin request" no log). A página aparece, mas as animações não rodam. Correção: `allowedDevOrigins` no `next.config.ts` com os IPs, e reiniciar. **Teste sempre também pelo IP de rede**, não só `localhost`.
2. **CSS desatualizado:** o dev server parou de gerar classes novas (disco lento). Reinicie o `next dev` e peça **Ctrl+Shift+R**.
3. **Movimento reduzido ligado no Windows** (Configurações → Acessibilidade → Efeitos visuais).
4. Amostragem enganosa nos seus próprios testes (ex. todas as capturas no instante em que o diafragma estava fechado).

## Acessibilidade

- Leitores de tela recebem sempre o conteúdo completo em texto; o palco visual é `aria-hidden` para não duplicar.
- Sem JS ou com movimento reduzido: layout estático elegante, sem trilho, sem Lenis, sem scrub.
- Foco visível, navegação por teclado, contraste AA, hierarquia de headings, alt descritivo das fotos novas.
