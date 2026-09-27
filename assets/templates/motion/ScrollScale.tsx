"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

import { useMotion } from "@/components/motion/MotionProvider";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";

type ScrollScaleProps = {
  children: ReactNode;
  /** Starting scale of the media. It grows to full-bleed (1) as the section scrolls. */
  from?: number;
  className?: string;
};

/**
 * Media that starts small and scrubs up to full-bleed. Uses CSS sticky (no JS pin, no pin
 * spacer) so the layout is final at first paint; GSAP only drives the scale. Without JS or with
 * reduced motion it is a plain full-bleed block.
 */
export function ScrollScale({ children, from = 0.5, className }: ScrollScaleProps) {
  const root = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();

  useGSAP(
    () => {
      if (reduced) return;
      gsap.fromTo(
        media.current,
        { scale: from },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        },
      );
    },
    { dependencies: [reduced, from], scope: root, revertOnUpdate: true },
  );

  return (
    <div
      ref={root}
      data-track
      style={{ "--track": "220svh" } as CSSProperties}
      className={cn("relative", className)}
    >
      <div className="flex h-svh items-center justify-center overflow-hidden motion-ok:sticky motion-ok:top-0">
        <div
          ref={media}
          style={{ "--from": from } as CSSProperties}
          className="relative size-full overflow-hidden rounded-card motion-ok:[transform:scale(var(--from))] motion-ok:will-change-transform"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
