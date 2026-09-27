"use client";

import { useRef, type ReactNode } from "react";

import { useMotion } from "@/components/motion/MotionProvider";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

type ScrubElement = HTMLHeadingElement & HTMLParagraphElement;

type ScrubTextProps = {
  as?: "h2" | "h3" | "p";
  children: ReactNode;
  className?: string;
  id?: string;
};

/**
 * Keynote-style statement: words light up one by one as the reader scrolls through it, so the
 * sentence is read at the pace of the scroll. Static and fully lit with reduced motion.
 */
export function ScrubText({ as: Tag = "h2", children, className, id }: ScrubTextProps) {
  const ref = useRef<ScrubElement>(null);
  const { reduced } = useMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;

      const split = SplitText.create(el, { type: "words", aria: "none" });
      gsap.fromTo(
        split.words,
        // Floor keeps even unlit words above 3:1 contrast (large text), gold included.
        { opacity: 0.55 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
        },
      );
    },
    { dependencies: [reduced], scope: ref, revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
