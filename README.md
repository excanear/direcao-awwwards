# Direção Awwwards

Skill para Claude Code que dirige sites como um estúdio premiado no Awwwards: cinematografia, impacto, criatividade e engenharia de scroll. Nasceu do site da Maple Tech, construído do zero com esse método.

## O que ela faz

- **Propõe antes de construir:** para cada seção, lê a cena anterior e a seguinte, lista os efeitos que o site já usa e propõe 4 direções (A a D), cada uma com nome, roteiro da cena, por que funciona e risco. Recomenda uma e espera a escolha.
- **Trata o site como um filme:** cada seção termina na cor em que a próxima começa, sem corte seco. O símbolo da marca atravessa o site do começo ao fim.
- **Evita a "cara de IA":** sem numeração decorativa, travessões, tags genéricas ou nomes fictícios. Não inventa dados.
- **Engenharia estável:** GSAP + Lenis com um easing só, cenas fixas que não quebram, transições sem vazar branco, versão estática para movimento reduzido, cuidado com LCP e fontes.
- **Entrega verificada:** rola a página no desktop e no celular antes de dizer que terminou, e conta a cena como o usuário vai vê-la.

## Instalação

```bash
git clone https://github.com/excanear/direcao-awwwards.git ~/.claude/skills/direcao-awwwards
```

No Windows (PowerShell):

```powershell
git clone https://github.com/excanear/direcao-awwwards.git "$env:USERPROFILE\.claude\skills\direcao-awwwards"
```

Para usar só em um projeto, clone em `.claude/skills/direcao-awwwards` dentro dele.

## Uso

Digite `/direcao-awwwards` no Claude Code, ou peça naturalmente: "preciso de uma direção de elite de Awwwards para a seção de depoimentos".

## Estrutura

| Caminho                              | Conteúdo                                                       |
| ------------------------------------ | -------------------------------------------------------------- |
| `SKILL.md`                           | O método: projeto novo, direção por seção, pedidos pontuais    |
| `references/principios-visuais.md`   | Tipografia, cor, componentes, fotos e vídeo, anti-"cara de IA" |
| `references/repertorio-de-cenas.md`  | Cenas construídas e ideias não escolhidas, como banco          |
| `references/engenharia-de-scroll.md` | Padrões GSAP/Lenis e armadilhas medidas                        |
| `references/entrega.md`              | Verificação e formato do relatório                             |
| `assets/templates/`                  | Código de referência (Next.js + Tailwind 4 + GSAP + Lenis)     |
