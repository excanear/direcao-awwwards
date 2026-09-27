"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { useMotion } from "@/components/motion/MotionProvider";
import { ArrowRight } from "@/components/ui/ArrowRight";
import type { ServiceSlug } from "@/content/types";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";

export type IrisItem = {
  slug: ServiceSlug;
  name: string;
  summary: string;
  photo: { src: string; wide: string; alt: string };
};

/** Blades of the diaphragm. Odd, like most real lenses, so no two blades mirror each other. */
const BLADES = 7;
/** How far the blades turn (radians) between closed and fully open. */
const TWIST = 1.15;

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * "O diafragma". The solutions as four shots seen through a camera's aperture. The stage is
 * pinned; it starts shut (the dive into the leaf left the screen in ink), then the blades turn
 * and draw back until the first service's photo fills the frame, its name and line rise over
 * it, and it holds. Scrolling on, the blades close to a point of light and open again on the
 * next service: four cuts. The last one stays open for the next chapter to cover.
 *
 * The aperture is a regular polygon; each blade is the band between the extensions of two
 * consecutive sides, shaded by its angle as if lit from above, with a gold rim of light on
 * the aperture's edge. All of it is recomputed from one "openness" value per frame.
 *
 * Only the service in frame is interactive (the others are inert); the index of all four
 * stays visible and linked. Only mounted with motion (see Solutions).
 */
export function SolutionsIris({ items }: { items: IrisItem[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { reduced } = useMotion();

  useGSAP(
    () => {
      const el = root.current;
      const scroller = el?.closest<HTMLElement>("[data-iris-scroll]");
      const blades = el?.querySelector<SVGGElement>("[data-blades]");
      const seams = el?.querySelector<SVGPathElement>("[data-seams]");
      const rim = el?.querySelector<SVGPathElement>("[data-rim]");
      const glow = el?.querySelector<HTMLElement>("[data-glow]");
      if (!el || !scroller || !blades || !seams || !rim || !glow || reduced) return;

      const shots = Array.from(el.querySelectorAll<HTMLElement>("[data-shot]"));
      const copies = Array.from(el.querySelectorAll<HTMLElement>("[data-copy]"));
      const bladePaths = Array.from(blades.querySelectorAll<SVGPathElement>("path"));

      const iris = { open: 0 };
      let shown = -1;
      // Times (on the timeline) at which each next service is swapped in, while shut.
      const cutAt: number[] = [];

      const render = (time: number) => {
        const index = cutAt.filter((at) => time >= at).length;
        if (index !== shown) {
          shown = index;
          setActive(index);
          shots.forEach((shot, i) => shot.style.setProperty("opacity", i === index ? "1" : "0"));
        }

        const width = el.clientWidth;
        const height = el.clientHeight;
        const cx = width / 2;
        const cy = height / 2;
        // Open far enough that the polygon's inner circle clears the corners of the frame.
        const cover = Math.hypot(width, height) / 2 / Math.cos(Math.PI / BLADES);
        const open = iris.open;
        const radius = cover * open;
        const turn = index * 0.9 + open * TWIST;
        const reach = Math.hypot(width, height) * 2;

        const corner = (k: number) => {
          const a = turn + (2 * Math.PI * k) / BLADES;
          return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)] as const;
        };
        // Direction of side k (from corner k to corner k + 1), which blade k extends outward.
        const side = (k: number) =>
          turn + (2 * Math.PI * k) / BLADES + Math.PI / 2 + Math.PI / BLADES;

        let seamPath = "";
        let rimPath = "";
        for (let k = 0; k < BLADES; k++) {
          const [ax, ay] = corner(k + 1);
          const [bx, by] = corner(k + 2);
          const da = side(k);
          const db = side(k + 1);
          const farA = [ax + reach * Math.cos(da), ay + reach * Math.sin(da)];
          const farB = [bx + reach * Math.cos(db), by + reach * Math.sin(db)];
          bladePaths[k]?.setAttribute(
            "d",
            `M${ax} ${ay}L${farA[0]} ${farA[1]}L${farB[0]} ${farB[1]}L${bx} ${by}Z`,
          );
          // Lit from above: blades facing up catch more light.
          const light = (1 - Math.sin(db)) / 2;
          bladePaths[k]?.setAttribute("fill", `hsl(40 3% ${5 + light * 9}%)`);
          seamPath += `M${ax} ${ay}L${farA[0]} ${farA[1]}`;
          rimPath += `${k === 0 ? "M" : "L"}${ax} ${ay}`;
        }
        seams.setAttribute("d", seamPath);
        rim.setAttribute("d", `${rimPath}Z`);
        rim.style.opacity = String(clamp01(open * 6));

        // Point of light as the blades meet; the photo settles from a slight zoom as it opens.
        glow.style.opacity = String(1 - clamp01(open * 5));
        gsap.set(shots[index] ?? [], { scale: 1.16 - 0.16 * smooth(open) });

        // The name and line rise in once the frame is mostly open, and leave before it shuts.
        const reveal = smooth(clamp01((open - 0.55) / 0.35));
        copies.forEach((copy, i) => {
          copy.style.opacity = String(i === index ? reveal : 0);
          copy.style.transform = `translateY(${(1 - reveal) * 1.5}rem)`;
        });
      };

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: scroller,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        onUpdate: () => render(tl.time()),
      });

      // A beat of black before the first shot.
      tl.to({}, { duration: 0.25 });
      items.forEach((_, index) => {
        tl.to(iris, { open: 1, duration: 1 });
        tl.to({}, { duration: 1.1 });
        if (index < items.length - 1) {
          tl.to(iris, { open: 0, duration: 0.8, ease: "power2.in" });
          cutAt.push(tl.duration());
          tl.to({}, { duration: 0.15 });
        }
      });

      render(0);
      const onResize = () => render(tl.time());
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { dependencies: [reduced, items], scope: root, revertOnUpdate: true },
  );

  return (
    <div ref={root} className="relative h-full w-full overflow-hidden bg-[#0b0b0b]">
      {/* The shots. Wide photo on larger screens, portrait on phones. */}
      {items.map((item, index) => (
        <div
          key={item.slug}
          data-shot
          aria-hidden="true"
          className="absolute inset-0"
          style={{ opacity: index === 0 ? 1 : 0 }}
        >
          <Image
            src={item.photo.wide}
            alt=""
            fill
            sizes="100vw"
            className="hidden object-cover md:block"
          />
          <Image
            src={item.photo.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover md:hidden"
          />
          {/* Grounds the copy in the lower left and the index in the upper left, so both
              read on bright photos too. */}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(11_11_11/0.92),rgb(11_11_11/0.5)_40%,transparent_70%),radial-gradient(60%_55%_at_0%_0%,rgb(11_11_11/0.88),rgb(11_11_11/0.4)_45%,transparent)]" />
        </div>
      ))}

      {/* The diaphragm. */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full">
        <g data-blades>
          {Array.from({ length: BLADES }, (_, k) => (
            <path key={k} fill="#0b0b0b" />
          ))}
        </g>
        <path data-seams fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth={1} />
        <path
          data-rim
          fill="none"
          stroke="rgb(212 174 118 / 0.45)"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
      <div
        data-glow
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 size-40 -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(212_174_118/0.55),rgb(212_174_118/0.12)_45%,transparent)]"
      />

      {/* The service in frame. */}
      {items.map((item, index) => (
        <article
          key={item.slug}
          data-copy
          inert={index !== active}
          className="absolute inset-x-0 bottom-0 pb-12 opacity-0 md:pb-16"
        >
          <div className="container-site">
            <h3 className="max-w-[12ch] text-display-xl font-semibold text-maple-paper">
              {item.name}
            </h3>
            <div className="mt-6 flex flex-col gap-6 md:mt-8 md:flex-row md:items-end md:justify-between">
              <p className="max-w-[34ch] text-lead text-maple-paper/85">{item.summary}</p>
              <Link
                href={`/solucoes/${item.slug}`}
                className="group inline-flex w-fit items-center gap-3 rounded-pill bg-maple-paper px-6 py-3.5 font-medium text-maple-ink transition-colors duration-fast ease-maple hover:bg-maple-gold"
              >
                Conhecer a solução
                <ArrowRight className="size-4 transition-transform duration-fast ease-maple group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </article>
      ))}

      {/* The index: all four, always reachable. */}
      <nav
        aria-label="Soluções"
        className="absolute inset-x-0 top-[calc(var(--nav-height)+1.5rem)] md:top-[calc(var(--nav-height)+2.5rem)]"
      >
        <ul className="container-site flex flex-col gap-1.5 font-mono text-label uppercase [text-shadow:0_1px_12px_rgb(0_0_0/0.7)]">
          {items.map((item, index) => (
            <li key={item.slug}>
              <Link
                href={`/solucoes/${item.slug}`}
                aria-current={index === active ? "true" : undefined}
                className={cn(
                  "transition-colors duration-base ease-maple hover:text-maple-paper",
                  index === active ? "text-maple-gold" : "text-maple-paper/60",
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
