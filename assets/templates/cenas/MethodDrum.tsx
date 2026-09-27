"use client";

import { useRef, useState, type CSSProperties } from "react";

import { useMotion } from "@/components/motion/MotionProvider";
import type { MethodStep } from "@/content/types";
import { cn } from "@/lib/cn";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/** Turn between two faces of the drum, in degrees. */
const ANGLE = 26;
/** Height of a face, in em of the drum's type. */
const FACE = 1.12;
/** Drum radius (em) at which faces of that height, ANGLE apart, meet edge to edge. */
const RADIUS = FACE / 2 / Math.tan(((ANGLE / 2) * Math.PI) / 180);
/** How far back the drum starts turning while the sheet rises, in faces. */
const ENTRY_FACES = 3;

/**
 * Detent: inside each step's stretch of scroll, the drum holds still at the start and end and
 * turns in the middle, so every word rests in the lens long enough to be read.
 */
const detent = (position: number) => {
  const step = Math.floor(position);
  const t = Math.min(1, Math.max(0, (position - step - 0.25) / 0.5));
  return step + t * t * (3 - 2 * t);
};

/**
 * "O tambor". The five steps are set around a giant type drum seen edge-on. Out of focus, the
 * words are hairline outlines turning away into the dark; in the lens at the drum's center,
 * framed by gold rules, the same words are solid. While the method's sheet rises, the drum
 * spins up into place and locks on the first step; then each stretch of scroll turns it one
 * step, a glint crosses the lens, and the step's copy takes the side panel.
 * Decorative for assistive tech: the section renders the steps as a list alongside it. Only
 * mounted visually with motion (see Method).
 */
export function MethodDrum({ steps }: { steps: MethodStep[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { reduced } = useMotion();

  useGSAP(
    () => {
      const el = root.current;
      const scroller = el?.closest<HTMLElement>("[data-method-scroll]");
      const section = el?.closest<HTMLElement>("section");
      if (!el || !scroller || !section || reduced) return;

      const drum = { entry: -ENTRY_FACES * ANGLE, position: 0 };
      let shown = 0;
      const render = () => {
        el.style.setProperty("--turn", `${drum.entry + drum.position * ANGLE}deg`);
        const next = Math.round(drum.position);
        if (next !== shown) {
          shown = next;
          setActive(next);
        }
      };
      render();

      // Spin-up: tied to the sheet rising over the frozen section before it.
      gsap.to(drum, {
        entry: 0,
        ease: "power3.out",
        onUpdate: render,
        scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: 0.8 },
      });

      // The turn: scroll sets where the drum should be, a short tween carries it there.
      const last = steps.length - 1;
      ScrollTrigger.create({
        trigger: scroller,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          gsap.to(drum, {
            position: detent(self.progress * last),
            duration: 0.7,
            ease: "power3.out",
            overwrite: true,
            onUpdate: render,
          });
        },
      });
    },
    { dependencies: [reduced, steps], scope: root, revertOnUpdate: true },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      // Where the spin-up starts; the scroll-driven turn overwrites it on this same element.
      style={{ "--turn": `${-ENTRY_FACES * ANGLE}deg` } as CSSProperties}
      className="container-site flex min-h-0 flex-1 flex-col gap-6 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:items-center md:gap-12 lg:gap-20"
    >
      <div className="relative min-h-[3.4em] flex-1 text-[clamp(3.5rem,0.5rem+7.2vw,7.5rem)] leading-none font-semibold tracking-[-0.045em] md:h-full">
        {/* Out of focus: outlines, fading as they turn away. */}
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]">
          <Reel
            steps={steps}
            className="text-transparent [-webkit-text-stroke:1px_rgb(225_227_219/0.3)]"
          />
        </div>

        {/* The lens: the same drum, solid, seen only through the band at the center. */}
        <div className="absolute inset-0 [clip-path:inset(calc(50%-0.62em)_0_calc(50%-0.62em)_0)]">
          <Reel steps={steps} className="text-maple-paper" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[1.24em] -translate-y-1/2 overflow-hidden border-y border-maple-gold/45">
          {/* A glint crosses the lens each time a new step locks in. */}
          <span
            key={active}
            className="absolute inset-y-0 left-0 w-1/3 animate-glint bg-linear-to-r from-transparent via-maple-gold/20 to-transparent"
          />
        </div>
      </div>

      {/* The step's copy. */}
      <div className="flex shrink-0 flex-col gap-6 md:gap-8">
        <div className="grid">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "col-start-1 row-start-1 transition-[opacity,translate] duration-base ease-maple",
                index === active
                  ? "translate-y-0 opacity-100"
                  : index < active
                    ? "-translate-y-3 opacity-0"
                    : "translate-y-3 opacity-0",
              )}
            >
              <p className="max-w-[30ch] text-[clamp(1.0625rem,0.9rem+0.6vw,1.5rem)] leading-[1.35] tracking-[-0.01em] text-maple-paper/90">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        <div className="flex max-w-xs gap-2">
          {steps.map((step, index) => (
            <span
              key={step.id}
              className="h-0.5 flex-1 overflow-hidden rounded-pill bg-maple-line-inverse"
            >
              <span
                className={cn(
                  "block h-full origin-left bg-maple-gold transition-transform duration-slow ease-maple",
                  index <= active ? "scale-x-100" : "scale-x-0",
                )}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The drum: a face per step around the X axis, pushed back by its radius so the face in front
 * sits on the page plane. Turned by the --turn set on the stage. Perspective is taken from the
 * left edge, so the words stay flush with the column as they turn.
 */
function Reel({ steps, className }: { steps: MethodStep[]; className: string }) {
  return (
    <div className="absolute inset-0 [perspective-origin:0%_50%] [perspective:16em]">
      <div
        className="absolute inset-x-0 top-1/2 h-(--face) -translate-y-1/2 [transform-style:preserve-3d]"
        style={
          {
            "--face": `${FACE}em`,
            transform: `translateZ(-${RADIUS}em) rotateX(var(--turn))`,
          } as CSSProperties
        }
      >
        {steps.map((step, index) => (
          <span
            key={step.id}
            className={cn(
              "absolute inset-0 leading-(--face) whitespace-nowrap [backface-visibility:hidden]",
              className,
            )}
            style={{ transform: `rotateX(${-index * ANGLE}deg) translateZ(${RADIUS}em)` }}
          >
            {step.title}
          </span>
        ))}
      </div>
    </div>
  );
}
