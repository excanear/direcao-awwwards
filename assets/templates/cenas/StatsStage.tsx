"use client";

import { useRef, useState } from "react";

import { useMotion } from "@/components/motion/MotionProvider";
import { Logo } from "@/components/ui/Logo";
import type { Stat, StatsContent } from "@/content/types";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";

/** Paper fed past the last printed line, so the line clears the slot before the next one. */
const FEED_MARGIN = 14;

/**
 * "A comanda". Pinned stage: a thermal printer prints the sector's statement while the reader
 * scrolls. Each block feeds out of the slot and holds so it can be read; as a statistic clears
 * the slot, the reading panel rolls to its value and sentence. The line Maple's work moves gets
 * circled in bordô, the closing line prints, and the receipt is torn off and carried away as
 * the bordô call to action rises. Scrubbed, so scrolling back un-prints it. Decorative for
 * assistive tech: the section renders every statistic as text alongside it. Only mounted
 * visually with motion (see Stats).
 */
export function StatsStage({
  items,
  receipt,
}: {
  items: Stat[];
  receipt: StatsContent["receipt"];
}) {
  const root = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState(-1);
  const { reduced } = useMotion();

  useGSAP(
    () => {
      const el = root.current;
      const trigger = el?.closest<HTMLElement>("[data-stats-scroll]");
      const paper = el?.querySelector<HTMLElement>("[data-paper]");
      const clip = el?.querySelector<HTMLElement>("[data-clip]");
      const circle = el?.querySelector<SVGPathElement>("[data-circle]");
      if (!el || !trigger || !paper || !clip || !circle || reduced) return;

      const blocks = Array.from(paper.querySelectorAll<HTMLElement>("[data-receipt-block]"));
      // How much paper must be out for block `index` to have fully cleared the slot.
      const fed = (index: number) => {
        const block = blocks[index];
        return block ? block.offsetTop + block.offsetHeight + FEED_MARGIN : 0;
      };

      // Scene = the last statistic that has cleared the slot. Recorded as timeline times while
      // the timeline is built, then read back on every render (scrubbed in both directions).
      const sceneAt: number[] = [];
      let shownScene = -1;

      const tl = gsap.timeline({
        defaults: { ease: "power1.inOut" },
        scrollTrigger: {
          trigger,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const time = tl.time();
          let next = -1;
          sceneAt.forEach((at, index) => {
            if (time >= at) next = index;
          });
          if (next !== shownScene) {
            shownScene = next;
            setScene(next);
          }
        },
      });

      // The empty printer is seen first.
      tl.to({}, { duration: 0.4 });

      blocks.forEach((block, index) => {
        const stat = block.dataset.receiptStat;
        tl.to(paper, { y: () => -fed(index), duration: stat ? 1 : 0.9 });
        if (stat !== undefined) sceneAt.push(tl.duration());
        if (block.dataset.receiptHighlight !== undefined) {
          tl.fromTo(
            circle,
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.6, ease: "power2.out" },
          );
        }
        // Hold: the reader gets time with each line before the next one prints.
        tl.to({}, { duration: stat ? 0.8 : 0.5 });
      });

      // Torn off at the slot and carried up and away, turning slightly as it goes.
      tl.to(paper, {
        y: () => -(paper.offsetHeight + clip.clientHeight + window.innerHeight * 0.1),
        x: () => paper.offsetWidth * 0.18,
        rotation: -7,
        duration: 1.4,
        ease: "power2.in",
      });
    },
    { dependencies: [reduced, items], scope: root, revertOnUpdate: true },
  );

  const active = Math.max(0, scene);
  const current = items[active];
  if (!current) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="container-site grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16 lg:gap-24"
    >
      {/* The reading: odometer, sentence, base, progress. Desktop only: on a phone the
          receipt itself is the reading. Hidden until the first line prints, since a "00%"
          before any data would read as a real zero. */}
      <div
        className={cn(
          "hidden flex-col justify-center gap-6 transition-opacity duration-base ease-maple md:flex md:gap-8",
          scene < 0 && "opacity-0",
        )}
      >
        <p className="flex items-start text-[clamp(4.5rem,2rem+11vw,12rem)] leading-[0.82] font-semibold tracking-[-0.05em] text-maple-paper tabular-nums">
          <Odometer value={scene < 0 ? 0 : current.value} />
          <span className="text-maple-gold">{current.suffix}</span>
        </p>

        <div className="grid">
          {items.map((item, index) => (
            <p
              key={item.id}
              className={cn(
                "col-start-1 row-start-1 max-w-[22ch] text-[clamp(1.25rem,1rem+1vw,2rem)] leading-[1.25] tracking-[-0.015em] text-maple-paper/90",
                "transition-[opacity,translate] duration-base ease-maple",
                index === active && scene >= 0
                  ? "translate-y-0 opacity-100"
                  : index < active
                    ? "-translate-y-3 opacity-0"
                    : "translate-y-3 opacity-0",
              )}
            >
              {item.label}
            </p>
          ))}
        </div>

        <div className="flex max-w-xs gap-2">
          {items.map((item, index) => (
            <span
              key={item.id}
              className="h-0.5 flex-1 overflow-hidden rounded-pill bg-maple-line-inverse"
            >
              <span
                className={cn(
                  "block h-full origin-left bg-maple-gold transition-transform duration-slow ease-maple",
                  index <= scene ? "scale-x-100" : "scale-x-0",
                )}
              />
            </span>
          ))}
        </div>
      </div>

      {/* The printer and its receipt. */}
      <div className="relative flex min-h-0 justify-center [--paper-w:min(21rem,80vw)] [--slot:3.25rem] md:[--paper-w:min(25rem,34vw)] md:[--slot:4rem]">
        {/* Warm pool of light the receipt rises through. */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 aspect-square w-[min(40rem,120vw)] -translate-x-1/2 translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,rgb(212_174_118/0.14),transparent)]" />

        {/* Behind the paper: the paper is clipped at the slot, so it reads as coming out of it
            while the top face behind the slot stays visible around it. */}
        <Printer />

        {/* Everything above the slot. The paper starts just below its bottom edge (inside the
            printer) and is fed upward; the clip is what makes it come out of the slot. The top
            fades so lines leaving the frame dissolve instead of hitting a hard edge. */}
        <div
          data-clip
          className="absolute inset-x-0 top-0 bottom-(--slot) overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%)]"
        >
          <div className="absolute top-full left-1/2 w-(--paper-w) -translate-x-1/2">
            <div data-paper className="drop-shadow-[0_1.25rem_1.5rem_rgb(0_0_0/0.55)]">
              <Receipt items={items} receipt={receipt} />
            </div>
          </div>
          {/* Shade right above the slot: the paper curls out of the printer's shadow. */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-[rgb(0_0_0/0.45)] to-transparent" />
        </div>
      </div>
    </div>
  );
}

/** The printed statement. Blocks are fed one at a time by the stage. */
function Receipt({ items, receipt }: { items: Stat[]; receipt: StatsContent["receipt"] }) {
  return (
    <div className="px-6 pt-7 pb-12 font-mono text-[0.75rem] leading-[1.5] tracking-[0.02em] text-maple-ink uppercase receipt-paper md:px-7 md:text-[0.8125rem]">
      <div data-receipt-block className="flex flex-col items-center text-center">
        <Logo className="h-16" sizes="64px" />
        <p className="mt-3 text-[1.05em] font-semibold">{receipt.title}</p>
        <p className="text-maple-muted">{receipt.subtitle}</p>
        <Rule />
        <dl className="w-full">
          {receipt.meta.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-maple-muted">{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        <Rule />
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          data-receipt-block
          data-receipt-stat={item.id}
          data-receipt-highlight={item.highlight ? "" : undefined}
          className="py-2.5"
        >
          <div
            className={cn(
              "flex items-baseline gap-2 font-semibold",
              item.highlight && "text-maple-red",
            )}
          >
            <span>{item.ticket}</span>
            <span className="mb-[0.3em] flex-1 border-b border-dotted border-current opacity-40" />
            <span className="relative text-[1.6em] leading-none tracking-[-0.02em] tabular-nums">
              {item.value}
              {item.suffix}
              {item.highlight && (
                // Circled by hand, in the brand's ink, when this line prints.
                <svg
                  viewBox="0 0 120 60"
                  preserveAspectRatio="none"
                  fill="none"
                  className="pointer-events-none absolute -inset-x-[0.55em] -inset-y-[0.5em] h-[calc(100%+1em)] w-[calc(100%+1.1em)] overflow-visible"
                >
                  <path
                    data-circle
                    d="M98 10C80 2 32 2 13 17-3 30 8 52 52 55 93 58 119 43 112 24 107 11 86 5 66 7"
                    pathLength={1}
                    stroke="currentColor"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeDasharray={1}
                    strokeDashoffset={1}
                  />
                </svg>
              )}
            </span>
          </div>
          <p className="mt-0.5 text-[0.85em] tracking-[0.04em] text-maple-muted normal-case">
            {item.base}
          </p>
        </div>
      ))}

      <div data-receipt-block className="flex flex-col items-center text-center">
        <Rule />
        <p className="max-w-[24ch] text-[1.05em] leading-[1.35] font-semibold">{receipt.closing}</p>
        <span className="mt-5 block h-10 w-4/5 bg-[repeating-linear-gradient(90deg,var(--color-maple-ink)_0_2px,transparent_2px_4px,var(--color-maple-ink)_4px_5px,transparent_5px_8px,var(--color-maple-ink)_8px_11px,transparent_11px_12px)]" />
        <p className="mt-2 text-[0.85em] tracking-[0.3em] text-maple-muted">maple.tech</p>
      </div>
    </div>
  );
}

function Rule() {
  return <span className="my-3 block w-full border-t border-dashed border-maple-ink/35" />;
}

/**
 * The thermal printer, seen from the front and a little above: a lit top face with the slot,
 * a darker front, a status light. The slot sits exactly where the receipt's clip ends, --slot
 * above the column's bottom.
 */
function Printer() {
  return (
    <div className="absolute bottom-0 left-1/2 h-[calc(var(--slot)+1.5rem)] w-[calc(var(--paper-w)+3rem)] -translate-x-1/2 md:h-[calc(var(--slot)+2rem)]">
      {/* Top face. */}
      <div className="absolute inset-x-0 top-0 h-[calc(100%-var(--slot)+1.25rem)] rounded-t-[1.1rem] bg-linear-to-b from-[#2c2c2b] to-[#1b1b1a] shadow-[inset_0_1px_0_rgb(255_255_255/0.09)]" />
      {/* Slot: a dark groove across the top face, right where the paper clip ends. */}
      <div className="absolute inset-x-5 top-[calc(100%-var(--slot)-3px)] h-1.5 rounded-pill bg-[#000] shadow-[inset_0_1px_2px_rgb(0_0_0/0.9),0_1px_0_rgb(255_255_255/0.07)]" />
      {/* Front. */}
      <div className="absolute inset-x-0 bottom-0 h-[calc(var(--slot)-1.25rem)] rounded-b-[0.6rem] bg-linear-to-b from-[#151515] to-[#0c0c0c] shadow-[0_2rem_3rem_-1rem_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.05)]">
        <span className="absolute top-1/2 right-5 size-1.5 -translate-y-1/2 rounded-full bg-maple-gold shadow-[0_0_0.6rem_rgb(212_174_118/0.8)]" />
        <span className="absolute top-1/2 left-5 flex -translate-y-1/2 gap-1">
          {[0, 1, 2, 3].map((vent) => (
            <span key={vent} className="h-3 w-0.5 rounded-pill bg-white/[0.07]" />
          ))}
        </span>
      </div>
    </div>
  );
}

/** Two rolling digit columns, like a mechanical counter. */
function Odometer({ value }: { value: number }) {
  const digits = String(value).padStart(2, "0").split("").map(Number);
  return (
    <span className="inline-flex">
      {digits.map((digit, position) => (
        <span key={position} className="relative inline-block h-[0.82em] overflow-hidden">
          <span
            className="flex flex-col transition-transform duration-slow ease-maple"
            style={{
              transform: `translateY(${-digit * 0.82}em)`,
              transitionDelay: `${position * 70}ms`,
            }}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="block h-[0.82em] leading-[0.82]">
                {n}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
