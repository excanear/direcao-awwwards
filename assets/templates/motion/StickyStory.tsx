"use client";

import { createContext, use, useRef, useState, type ReactNode, type CSSProperties } from "react";

import { cn } from "@/lib/cn";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

export type StoryStep = {
  id: string;
  title: string;
  body?: string;
};

type StickyStoryProps = {
  steps: StoryStep[];
  /** Pinned media. Client children can read the active step with useStoryStep(). */
  media: ReactNode;
  /**
   * One name per step. Once a step is reached, the media wrapper gets `data-<name>`, so
   * server-rendered media can react in pure CSS (no hydration) to how far the story went.
   */
  reachedAttributes?: string[];
  /**
   * Extra scroll after the last step (motion only) during which the media stays stuck. The
   * media can animate an outro over it by targeting `[data-outro]` inside `[data-story]`.
   */
  outro?: boolean;
  className?: string;
};

/** Before the first step reaches the focus line the story is in its "before" state. */
export const STORY_BEFORE = -1;

const StoryStepContext = createContext(STORY_BEFORE);

const focusLine = () => (window.matchMedia("(min-width: 48rem)").matches ? "50%" : "65%");

/** Index of the step in focus inside the nearest StickyStory, or STORY_BEFORE. */
export function useStoryStep(): number {
  return use(StoryStepContext);
}

/**
 * Media stays fixed while text blocks scroll past; the block crossing the focus line becomes
 * active. The step switch is state (not scrub), so it works identically with reduced motion.
 */
export function StickyStory({
  steps,
  media,
  reachedAttributes = [],
  outro = false,
  className,
}: StickyStoryProps) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(STORY_BEFORE);

  useGSAP(
    () => {
      const items = root.current?.querySelectorAll<HTMLElement>("[data-story-step]") ?? [];
      items.forEach((item, index) => {
        ScrollTrigger.create({
          trigger: item,
          // Desktop: the viewport center. Mobile: just under the sticky media.
          start: () => `top ${focusLine()}`,
          end: () => `bottom ${focusLine()}`,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            if (self.isActive) setActive(index);
            else if (index === 0 && self.direction < 0) setActive(STORY_BEFORE);
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <StoryStepContext value={active}>
      <div
        ref={root}
        data-story
        className={cn("container-site grid md:grid-cols-2 md:gap-x-16 lg:gap-x-24", className)}
      >
        <div
          data-story-media
          data-step={active}
          {...Object.fromEntries(
            reachedAttributes.map((name, index) => [
              `data-${name}`,
              index <= active ? "" : undefined,
            ]),
          )}
          className={cn(
            "sticky top-(--nav-height) z-10 flex h-[58svh] items-center justify-center bg-(--surface) md:top-0 md:h-svh md:bg-transparent",
            // Mobile: text slides under the media; a short fade softens the cut.
            "after:absolute after:inset-x-0 after:top-full after:h-10 after:bg-linear-to-b after:from-(--surface) after:to-transparent md:after:hidden",
            // An outro may move the media out of its box: the fade must not cross it.
            "data-flipping:after:hidden",
          )}
        >
          {media}
        </div>

        <ol className="pb-[20svh] md:py-[25svh]">
          {steps.map((step, index) => (
            <li
              key={step.id}
              data-story-step
              aria-current={index === active ? "step" : undefined}
              className={cn(
                // Mobile: the focus line sits right under the media, so text starts at the top.
                "flex min-h-[70svh] flex-col justify-start pt-6 md:justify-center md:pt-0",
              )}
            >
              {/* Inactive titles dim to 0.55 (still ≥ 3:1); inactive bodies hide instead of dimming
                  below AA. Without JS nothing is ever active, so everything stays visible. */}
              <h3
                className={cn(
                  "text-display-md font-semibold transition-opacity duration-fast ease-maple",
                  index !== active && "js:opacity-55",
                )}
              >
                {step.title}
              </h3>
              {step.body && (
                <p
                  className={cn(
                    "mt-5 max-w-md text-lead text-maple-muted transition-[opacity,transform] duration-base ease-maple on-dark:text-maple-muted-inverse",
                    index !== active && "js:translate-y-2 js:opacity-0",
                  )}
                >
                  {step.body}
                </p>
              )}
            </li>
          ))}
        </ol>

        {outro && (
          <div
            data-outro
            data-track
            aria-hidden="true"
            style={{ "--track": "220svh" } as CSSProperties}
            className="md:col-span-2"
          />
        )}
      </div>
    </StoryStepContext>
  );
}
