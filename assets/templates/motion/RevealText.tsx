"use client";

import { useRef, type ReactNode } from "react";

import { useMotion } from "@/components/motion/MotionProvider";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { DURATION, REVEAL_START, STAGGER } from "@/lib/motion";

// Intersection type lets one ref satisfy every allowed tag.
type RevealElement = HTMLHeadingElement & HTMLParagraphElement;

type RevealTextProps = {
  as?: "h1" | "h2" | "h3" | "p";
  children: ReactNode;
  className?: string;
  id?: string;
  /** Seconds to wait after the trigger fires. */
  delay?: number;
};

/**
 * Line-by-line masked reveal. Lines rise from below their own mask when the text enters the
 * viewport. Re-splits on resize/font load until it has played, then stays put.
 */
export function RevealText({
  as: Tag = "h2",
  children,
  className,
  id,
  delay = 0,
}: RevealTextProps) {
  const ref = useRef<RevealElement>(null);
  const { reduced } = useMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (reduced) {
        el.dataset.reveal = "ready";
        return;
      }

      let played = false;
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        // Lines keep whole words, so assistive tech can read the real text as-is.
        aria: "none",
        autoSplit: true,
        onSplit: (self) => {
          el.dataset.reveal = "ready";
          if (played) return;
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: DURATION.slow,
            stagger: STAGGER,
            delay,
            scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
            onComplete: () => {
              played = true;
            },
          });
        },
      });
    },
    { dependencies: [reduced, delay], scope: ref, revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} id={id} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
