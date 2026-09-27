"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";

import { useMotion } from "@/components/motion/MotionProvider";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

type ProblemStageProps = {
  eyebrow: string;
  statement: string;
  statementTurn: string;
  support: string;
  /** The word whose first letter becomes the portal. Falls back to the last "o". */
  eyeWord?: string;
};

/** Share of the "o" glyph's ink width that the lit pupil covers: stays inside the counter. */
const PUPIL = 0.42;

/**
 * "Dive into the o". One pinned, scroll-scrubbed shot:
 * 1. the statement lights up word by word, the serif turn included;
 * 2. the support line enters and holds long enough to be read;
 * 3. everything dims but the "o" of "olhos", whose counter fills with light like a pupil;
 * 4. the camera accelerates into that "o" until the lit counter, paper-colored, fills the
 *    screen — the exact surface of the next section, so the story continues without a cut.
 * Transform/opacity only. Reduced motion or no JS: the static, fully lit statement.
 */
export function ProblemStage({
  eyebrow,
  statement,
  statementTurn,
  support,
  eyeWord = "olhos",
}: ProblemStageProps) {
  const root = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl || reduced) return;

      const q = gsap.utils.selector(rootEl);
      const stage = q("[data-stage]")[0] as HTMLElement;
      const scaler = q("[data-scaler]")[0] as HTMLElement;
      const eye = q("[data-eye]")[0] as HTMLElement | undefined;
      const pupil = q("[data-pupil]")[0] as HTMLElement;
      const section = rootEl.closest<HTMLElement>("[data-nav-theme]");
      if (!stage || !scaler || !eye || !pupil) return;

      // The counter's center, from the real font metrics. Offsets ignore transforms, so this is
      // valid at any point of the scrub (it re-runs on every ScrollTrigger refresh).
      const geometry = { x: 0, y: 0, d: 0, scale: 1 };
      const measure = () => {
        const style = getComputedStyle(eye);
        const ctx = document.createElement("canvas").getContext("2d");
        if (!ctx) return;
        ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const m = ctx.measureText("o");
        const inkWidth = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
        geometry.x = eye.offsetLeft + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
        // Baseline, measured rather than derived: a zero-height inline-block sits on it.
        const probe = document.createElement("span");
        probe.style.cssText = "display:inline-block;width:0;height:0";
        eye.append(probe);
        const baseline = probe.offsetTop;
        probe.remove();
        // The glyph's vertical middle, overshoot below the baseline included.
        geometry.y = baseline - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
        geometry.d = inkWidth * PUPIL;

        // Scale at which the pupil covers the farthest corner of the stage, plus a margin.
        const px = scaler.offsetLeft + geometry.x;
        const py = scaler.offsetTop + geometry.y;
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        const far = Math.max(
          Math.hypot(px, py),
          Math.hypot(w - px, py),
          Math.hypot(px, h - py),
          Math.hypot(w - px, h - py),
        );
        geometry.scale = (far / (geometry.d / 2)) * 1.08;

        // Whole pixels: the origin and the pupil must agree exactly, since any sub-pixel gap
        // between them is multiplied by the final scale (~60x).
        geometry.x = Math.round(geometry.x);
        geometry.y = Math.round(geometry.y);
        geometry.d = Math.round(geometry.d / 2) * 2;
        gsap.set(scaler, { transformOrigin: `${geometry.x}px ${geometry.y}px` });
        gsap.set(pupil, {
          left: geometry.x - geometry.d / 2,
          top: geometry.y - geometry.d / 2,
          width: geometry.d,
          height: geometry.d,
        });
      };
      measure();
      ScrollTrigger.addEventListener("refreshInit", measure);

      const words = q("[data-word]");
      const eyeWordEl = eye.closest("[data-word]");
      // Everything but the "o" itself recedes in the focus beat.
      const recede = [...words.filter((word) => word !== eyeWordEl), ...q("[data-eye-rest]")];

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: rootEl,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          // The shot ends on paper: hand the navbar its light theme exactly then.
          onUpdate: (self) => {
            if (!section) return;
            const tone = self.progress > 0.97 ? "light" : "dark";
            if (section.dataset.navTheme !== tone) section.dataset.navTheme = tone;
          },
        },
      });

      timeline
        // 1. Light the sentence (from a low floor: the scene starts in the dark).
        .fromTo(words, { opacity: 0.14 }, { opacity: 1, stagger: 0.28, duration: 0.6 }, 0)
        // 2. The support line enters, then holds.
        .fromTo(
          q("[data-support]"),
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          ">-0.1",
        )
        .to({}, { duration: 1 })
        // 3. Focus: the rest recedes, the "o" turns gold and its counter catches the light.
        .addLabel("focus")
        .to(q("[data-support], [data-eyebrow]"), { opacity: 0, y: -16, duration: 0.6 }, "focus")
        .to(recede, { opacity: 0.22, duration: 0.6 }, "focus")
        .to(eye, { color: "#d4ae76", duration: 0.6 }, "focus")
        .fromTo(pupil, { scale: 0 }, { scale: 1, duration: 0.6, ease: "power2.out" }, "focus+=0.35")
        .to(q("[data-glow]"), { opacity: 0, duration: 1 }, "focus+=0.5")
        // 4. The dive: exponential-feeling acceleration into the lit counter.
        .fromTo(
          scaler,
          { scale: 1 },
          { scale: () => geometry.scale, duration: 2.4, ease: "power4.in" },
          "focus+=0.9",
        )
        // A beat on the full paper frame before the next section takes over.
        .to({}, { duration: 0.15 });

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", measure);
        if (section) section.dataset.navTheme = "dark";
      };
    },
    { dependencies: [reduced], scope: root, revertOnUpdate: true },
  );

  return (
    <div
      ref={root}
      data-track
      style={{ "--track": "340svh", "--track-md": "420svh" } as CSSProperties}
      className="relative"
    >
      <div
        data-stage
        className="relative flex min-h-svh items-center overflow-hidden py-[24svh] md:py-[30svh] motion-ok:sticky motion-ok:top-0 motion-ok:h-svh motion-ok:py-0"
      >
        <div
          data-glow
          aria-hidden="true"
          className="pointer-events-none absolute -right-[20%] -bottom-[30%] aspect-square w-[min(70rem,160vw)] rounded-full bg-[radial-gradient(closest-side,rgb(128_0_0/0.45),transparent)]"
        />

        <div data-scaler className="relative container-site">
          <div data-eyebrow>
            <Eyebrow>{eyebrow}</Eyebrow>
          </div>
          <h2 id="problem-title" className="mt-6 max-w-[15ch] text-display-lg font-semibold">
            {words(statement, eyeWord)}{" "}
            <span className="font-serif text-[1.08em] font-normal tracking-[-0.02em] text-maple-gold italic">
              {words(statementTurn)}
            </span>
          </h2>
          <p
            data-support
            className="mt-12 max-w-xl text-lead text-maple-muted-inverse md:mt-20 md:mr-[8%] md:ml-auto"
          >
            {support}
          </p>

          {/* The lit pupil, placed on the counter of the "o" by JS; the paper of the next scene. */}
          <span
            data-pupil
            aria-hidden="true"
            className="pointer-events-none absolute hidden rounded-full bg-maple-paper motion-ok:block motion-ok:[transform:scale(0)]"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Splits a sentence into word spans for the scrub (spaces stay real text, so the heading reads
 * normally). In the word matching `eyeWord`, the first letter gets its own span: the portal.
 */
function words(sentence: string, eyeWord?: string): ReactNode[] {
  const parts = sentence.split(" ");
  let eyeIndex = eyeWord ? parts.findIndex((part) => part.toLowerCase().startsWith(eyeWord)) : -1;
  if (eyeWord && eyeIndex === -1) {
    eyeIndex = parts.findLastIndex((part) => part.toLowerCase().startsWith("o"));
  }

  return parts.flatMap((part, index) => {
    const word =
      index === eyeIndex ? (
        <span key={index} data-word className="inline-block">
          <span data-eye>{part[0]}</span>
          <span data-eye-rest>{part.slice(1)}</span>
        </span>
      ) : (
        <span key={index} data-word className="inline-block">
          {part}
        </span>
      );
    return index < parts.length - 1 ? [word, " "] : [word];
  });
}
