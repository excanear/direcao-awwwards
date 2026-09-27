/**
 * The single motion system for the whole site. GSAP and CSS share the exact same curve:
 * `EASE` is registered as a CustomEase in lib/gsap.ts, `EASE_CSS` mirrors `--ease-maple`.
 */
export const EASE_BEZIER = [0.22, 1, 0.36, 1] as const;

export const EASE = "maple";

export const EASE_SVG_PATH = `M0,0 C${EASE_BEZIER[0]},${EASE_BEZIER[1]} ${EASE_BEZIER[2]},${EASE_BEZIER[3]} 1,1`;

export const EASE_CSS = `cubic-bezier(${EASE_BEZIER.join(", ")})`;

/** Seconds. fast = feedback/micro, base = reveals, slow = hero-scale moments. */
export const DURATION = {
  fast: 0.6,
  base: 0.9,
  slow: 1.2,
} as const;

export const STAGGER = 0.08;

/** Where scroll-triggered reveals fire, relative to the viewport. */
export const REVEAL_START = "top 85%";

/**
 * Screens of scroll a sideways sheet entrance takes (SlideInSheet), and so how long the section
 * it covers stays frozen (FreezeBehind). The extra screens beyond the first are a lead-in space
 * above the incoming section, only with motion (`data-sheet-lead` in globals.css).
 */
export const SHEET_ENTRANCE_SCREENS = 2;
