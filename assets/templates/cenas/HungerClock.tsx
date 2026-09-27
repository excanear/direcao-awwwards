"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { useMotion } from "@/components/motion/MotionProvider";
import type { Audience } from "@/content/types";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The light of the day, keyed by clock minutes: noon paper, golden late afternoon, a bordô
 * sunset, dusk, and night in the ink of the method that rises next.
 */
const SKY: { at: number; bg: string; fg: string }[] = [
  { at: 12 * 60, bg: "#e1e3db", fg: "#222222" },
  { at: 16 * 60 + 30, bg: "#e7d6b3", fg: "#222222" },
  { at: 18 * 60 + 30, bg: "#5c2420", fg: "#e1e3db" },
  { at: 20 * 60, bg: "#2a2321", fg: "#e1e3db" },
  { at: 21 * 60 + 30, bg: "#222222", fg: "#e1e3db" },
];
/** From this minute on the surface is dark: the navbar switches with it. */
const DARK_FROM = 17 * 60 + 45;

const lerpColor = (a: string, b: string, t: number) => gsap.utils.interpolate(a, b, t);

function skyAt(minutes: number) {
  const last = SKY[SKY.length - 1]!;
  if (minutes >= last.at) return last;
  const next = SKY.findIndex((stop) => stop.at > minutes);
  if (next <= 0) return SKY[0]!;
  const from = SKY[next - 1]!;
  const to = SKY[next]!;
  const t = (minutes - from.at) / (to.at - from.at);
  return { at: minutes, bg: lerpColor(from.bg, to.bg, t), fg: lerpColor(from.fg, to.fg, t) };
}

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  return `${h}h${String(m).padStart(2, "0")}`;
};

/**
 * "O relógio da fome". Each kind of restaurant lives off its own hour of hunger. The stage is
 * pinned and scroll runs the day: the clock's hands spin from noon to late night, the light
 * turns from paper through a golden afternoon and a bordô sunset to ink, the sun sinks and
 * becomes a lamp. At each audience's hour its photo rises into the frame with its name. The
 * last beat gathers all four, at night, into the still frame that freezes as the method's
 * sheet rises over it (FreezeBehind). Decorative for assistive tech: the section renders the
 * audiences as a list alongside it. Only mounted with motion (see Audience).
 */
export function HungerClock({ items }: { items: Audience[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { reduced } = useMotion();

  useGSAP(
    () => {
      const el = root.current;
      const scroller = el?.closest<HTMLElement>("[data-hunger-scroll]");
      const section = el?.closest<HTMLElement>("section");
      const q = (selector: string) => el?.querySelector<HTMLElement>(selector);
      const hourHand = el?.querySelector<SVGElement>("[data-hour-hand]");
      const minuteHand = el?.querySelector<SVGElement>("[data-minute-hand]");
      const readout = q("[data-readout]");
      const sun = q("[data-sun]");
      const story = q("[data-story]");
      if (!el || !scroller || !section || !hourHand || !minuteHand || !readout || !sun || !story) {
        return;
      }
      if (reduced) return;

      const photos = gsap.utils.toArray<HTMLElement>("[data-photo]", el);
      const tiles = gsap.utils.toArray<HTMLElement>("[data-tile]", el);
      const first = items[0]?.time ?? 12 * 60;
      const clock = { minutes: first };
      // Timeline times at which each audience takes the stage.
      const arrivals: number[] = [];
      let shown = 0;

      const render = (time: number) => {
        const { minutes } = clock;
        const sky = skyAt(minutes);
        el.style.backgroundColor = sky.bg;
        el.style.color = sky.fg;
        // The section follows the light too: when the freeze pulls the frame back, what shows
        // around it is the same night, not the paper the section started on.
        section.style.setProperty("--surface", sky.bg);
        minuteHand.style.transform = `rotate(${minutes * 6}deg)`;
        hourHand.style.transform = `rotate(${minutes * 0.5}deg)`;
        readout.textContent = formatTime(minutes);

        // The sun arcs down from high on the right and settles low as a warm lamp.
        const day = gsap.utils.clamp(0, 1, (minutes - first) / (19 * 60 - first));
        sun.style.transform = `translate(${-30 * day}vw, ${55 * day}svh)`;
        sun.style.opacity = String(0.55 + 0.25 * day);

        const tone = minutes >= DARK_FROM ? "dark" : "light";
        if (section.dataset.navTheme !== tone) section.dataset.navTheme = tone;

        const next = arrivals.filter((at) => time >= at).length;
        if (next !== shown) {
          shown = next;
          setActive(next);
        }
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

      // Noon: the first audience is already on the table.
      tl.to({}, { duration: 0.6 });
      items.slice(1).forEach((item, index) => {
        const span = Math.max(0.7, (item.time - (items[index]?.time ?? first)) / 300);
        tl.to(clock, { minutes: item.time, duration: span });
        // Its photo rises into the frame as the clock arrives.
        const photo = photos[index + 1];
        tl.fromTo(
          photo ?? {},
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power3.inOut" },
          "-=0.45",
        );
        tl.fromTo(
          photo?.querySelector("img") ?? {},
          { scale: 1.2 },
          { scale: 1, duration: 0.9, ease: "power2.out" },
          "<",
        );
        arrivals.push(tl.duration() - 0.6);
        tl.to({}, { duration: 0.8 });
      });

      // Night: the story gives way to all four at once.
      tl.to(story, { opacity: 0, scale: 0.96, duration: 0.6, ease: "power2.in" });
      tl.fromTo(
        tiles,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: "power3.out" },
        "-=0.2",
      );
      tl.to({}, { duration: 0.6 });

      render(0);
      return () => {
        section.dataset.navTheme = "light";
        section.style.removeProperty("--surface");
      };
    },
    { dependencies: [reduced, items], scope: root, revertOnUpdate: true },
  );

  const current = items[active] ?? items[0];
  if (!current) return null;

  return (
    <div
      ref={root}
      data-freeze-content
      aria-hidden="true"
      className="relative h-full w-full overflow-hidden bg-maple-paper text-maple-ink"
    >
      {/* The sun by day, a lamp by night. */}
      <div
        data-sun
        className="pointer-events-none absolute -top-[25svh] -right-[15vw] aspect-square w-[min(70rem,140vw)] rounded-full bg-[radial-gradient(closest-side,rgb(255_236_200/0.9),rgb(212_174_118/0.35)_45%,transparent)] opacity-55 mix-blend-soft-light"
      />

      {/* The story: clock, name, photo. */}
      <div
        data-story
        className="relative container-site flex h-full flex-col gap-4 pt-[calc(var(--nav-height)+1.25rem)] pb-6 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-12 md:pt-(--nav-height) md:pb-0 lg:gap-20"
      >
        <div className="flex items-center gap-5 md:flex-col md:items-start md:gap-8">
          <Clock className="size-[clamp(5.5rem,18svh,9rem)] shrink-0 md:size-[clamp(10rem,34svh,20rem)]" />
          <div className="flex flex-col gap-1 md:gap-2">
            <p
              data-readout
              className="font-serif text-[clamp(2.5rem,1.5rem+4vw,5.5rem)] leading-none tracking-[-0.02em] italic tabular-nums"
            >
              {formatTime(items[0]?.time ?? 720)}
            </p>
            <p className="font-mono text-label uppercase opacity-70">{current.moment}</p>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 md:contents">
          {/* The frame: each hour's photo rises over the last. */}
          <div className="relative mx-auto aspect-[4/5] h-full max-h-[52svh] min-h-0 overflow-hidden rounded-card shadow-[0_2rem_4rem_-1.5rem_rgb(0_0_0/0.45)] md:col-start-2 md:row-span-2 md:row-start-1 md:max-h-[72svh] md:w-full md:max-w-[34rem]">
            {items.map((item, index) => (
              <div
                key={item.id}
                data-photo
                className="absolute inset-0"
                style={index === 0 ? undefined : { clipPath: "inset(100% 0% 0% 0%)" }}
              >
                <Image
                  src={item.photo.src}
                  alt=""
                  fill
                  sizes="(min-width: 48rem) 34rem, 80vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="grid md:col-start-1 md:row-start-2 md:self-start">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "col-start-1 row-start-1 transition-[opacity,translate] duration-base ease-maple",
                  index === active
                    ? "translate-y-0 opacity-100"
                    : index < active
                      ? "-translate-y-3 opacity-0"
                      : "translate-y-3 opacity-0",
                )}
              >
                <h3 className="text-display-md font-semibold">{item.name}</h3>
                <p className="mt-3 max-w-[30ch] text-lead opacity-80">{item.line}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Night: all four together, the frame that freezes under the method. */}
      <ul className="absolute inset-0 container-site grid grid-cols-2 content-center gap-x-3 gap-y-5 pt-(--nav-height) md:grid-cols-4 md:gap-5">
        {items.map((item) => (
          <li key={item.id} data-tile className="opacity-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-card">
              <Image
                src={item.photo.src}
                alt=""
                fill
                sizes="(min-width: 48rem) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-title leading-tight font-semibold">{item.name}</p>
            <p className="mt-1 font-serif text-lead italic tabular-nums opacity-70">
              {formatTime(item.time)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The clock face: hairline ring, twelve ticks, two hands and a bordô pin. */
function Clock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className}>
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeOpacity="0.25" />
      {Array.from({ length: 12 }, (_, index) => (
        <line
          key={index}
          x1="100"
          y1="10"
          x2="100"
          y2={index % 3 === 0 ? 26 : 18}
          stroke="currentColor"
          strokeOpacity={index % 3 === 0 ? 0.8 : 0.4}
          strokeWidth={index % 3 === 0 ? 3 : 1.5}
          strokeLinecap="round"
          transform={`rotate(${index * 30} 100 100)`}
        />
      ))}
      <line
        data-hour-hand
        x1="100"
        y1="104"
        x2="100"
        y2="52"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        style={{ transformOrigin: "100px 100px", transform: "rotate(360deg)" }}
      />
      <line
        data-minute-hand
        x1="100"
        y1="108"
        x2="100"
        y2="24"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        style={{ transformOrigin: "100px 100px" }}
      />
      <circle cx="100" cy="100" r="6" className="fill-maple-red" />
    </svg>
  );
}
