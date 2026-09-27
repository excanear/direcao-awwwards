"use client";

import { useRef } from "react";

import { useMotion } from "@/components/motion/MotionProvider";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SHEET_ENTRANCE_SCREENS } from "@/lib/motion";

type SlideInSheetProps = {
  /** The side it comes in from. Its leading edge (the opposite one) is rounded. */
  from?: "right" | "left";
};

/**
 * Brings the Section it is placed in onto the screen from the side, over the frozen section
 * before it (FreezeBehind), instead of letting it scroll up from below.
 *
 * Over SHEET_ENTRANCE_SCREENS screens of scroll (its top travelling down from that far below
 * the viewport to the top, thanks to the `data-sheet-lead` space above it, sized here in pixels
 * of the visible viewport so it matches FreezeBehind exactly on phones too), a vertical offset
 * cancels that travel exactly, so the section stays at the top while it glides in sideways:
 * slow off the mark, steady through the middle, settling softly. Meanwhile it is cut to one
 * screen with its leading corners rounded, a sheet being laid over the last one, and the
 * frozen section underneath drifts a little the other way, pushed by it. Transforms only.
 * Reduced motion: plain scroll.
 */
export function SlideInSheet({ from = "right" }: SlideInSheetProps) {
  const marker = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotion();

  useGSAP(
    () => {
      const section = marker.current?.closest<HTMLElement>("section");
      if (!section || reduced) return;

      const side = from === "right" ? 1 : -1;
      const radius = "var(--sheet-radius)";
      // inset(... round top-left top-right bottom-right bottom-left): only the leading edge.
      const corners = from === "right" ? `${radius} 0 0 ${radius}` : `0 ${radius} ${radius} 0`;
      let progress = 0;
      const screens = SHEET_ENTRANCE_SCREENS;

      // The frozen section underneath (its pinned wrapper, when ScrollTrigger has added one).
      let before = section.previousElementSibling;
      if (before?.classList.contains("pin-spacer")) before = before.firstElementChild;
      const underneath = before?.querySelector<HTMLElement>("[data-freeze-content]") ?? null;
      /** How far the section underneath is pushed, as a share of the screen width. */
      const PUSH = 0.08;

      const clear = () => {
        gsap.set(section, { clearProps: "transform,clipPath" });
        if (underneath) gsap.set(underneath, { x: 0 });
      };
      // The lead-in space in pixels of the viewport ScrollTrigger measures with. A CSS `vh`
      // counts the phone's toolbar as hidden and would outgrow the freeze behind, leaving a
      // stretch where nothing covers the screen.
      const sizeLead = () =>
        section.style.setProperty("--sheet-lead", `${(screens - 1) * window.innerHeight}px`);
      sizeLead();
      const place = () => {
        // Outside the entrance the section sits where the layout puts it.
        if (progress <= 0 || progress >= 1) {
          clear();
          return;
        }
        const eased = gsap.parseEase("power2.inOut")(progress);
        gsap.set(section, {
          x: side * (1 - eased) * window.innerWidth,
          // The section's top would sit this far down; hold it at the top instead.
          y: -(1 - progress) * screens * window.innerHeight,
          clipPath: `inset(0 0 calc(100% - 100svh) 0 round ${corners})`,
        });
        if (underneath) gsap.set(underneath, { x: -side * PUSH * eased * window.innerWidth });
      };

      // Not a scrubbed tween: the vertical hold must follow the scroll exactly, or the sheet
      // would drift while it slides.
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: () => `top ${screens * 100}%`,
        end: "top top",
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress = self.progress;
          place();
        },
      });

      // Every trigger on the page must measure the section where the layout puts it, so the
      // offsets come off before a refresh measures anything and go back once all are done.
      const beforeRefresh = () => {
        clear();
        sizeLead();
      };
      ScrollTrigger.addEventListener("refreshInit", beforeRefresh);
      const restore = () => {
        progress = trigger.progress;
        place();
      };
      ScrollTrigger.addEventListener("refresh", restore);
      restore();

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", beforeRefresh);
        ScrollTrigger.removeEventListener("refresh", restore);
        clear();
      };
    },
    { dependencies: [reduced, from], revertOnUpdate: true },
  );

  return <span ref={marker} aria-hidden="true" className="hidden" />;
}
