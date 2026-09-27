"use client";

import { useRef } from "react";

import { useMotion } from "@/components/motion/MotionProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { SHEET_ENTRANCE_SCREENS } from "@/lib/motion";

/**
 * Freezes the Section it is placed in once its end reaches the bottom of the screen, so the
 * next section (a sheet drawn above it) rises over it instead of pushing it away. While it is
 * covered, the frozen content recedes (a slight pull-back of the camera) and a shade darkens
 * it. It stays frozen for as long as a sideways sheet entrance lasts (SHEET_ENTRANCE_SCREENS).
 * Put it as a direct child of the Section and mark the content to recede with
 * `data-freeze-content`. Reduced motion: plain scroll.
 */
export function FreezeBehind() {
  const shade = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();

  useGSAP(
    () => {
      const section = shade.current?.closest<HTMLElement>("section");
      const content = section?.querySelector<HTMLElement>("[data-freeze-content]");
      if (!section || !content || reduced) return;

      // Recede around the middle of the visible part, which is the section's last screen.
      gsap.set(content, { transformOrigin: "50% calc(100% - 50svh)" });

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "bottom bottom",
            end: `+=${SHEET_ENTRANCE_SCREENS * 100}%`,
            pin: true,
            pinSpacing: false,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(content, { scale: 0.88, ease: "power1.in" }, 0)
        .to(shade.current, { opacity: 1, ease: "power2.in" }, 0);
    },
    { dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <div
      ref={shade}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 bg-[rgb(0_0_0/0.75)] opacity-0"
    />
  );
}
