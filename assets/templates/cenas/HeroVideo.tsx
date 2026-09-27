"use client";

import { useEffect, useRef, useState } from "react";

import { useMotion } from "@/components/motion/MotionProvider";
import { cn } from "@/lib/cn";

/**
 * The hero's opening shot: a 14s graded montage of restaurant life (wine being poured, a
 * smoking cocktail, a flambé, the teppanyaki grill, plates reaching the table), looping out of
 * and back into black. Mixkit clips, free license (mixkit.co/license). Landscape 1920×1080 by
 * default, a 720×1280 portrait cut on phones held upright.
 *
 * It fades in from ink only once it is actually playing, so the first paint is never a blank
 * frame; pauses when scrolled out of view; and stays on its poster with reduced motion,
 * without downloading the film at all. The
 * shade on top keeps the headline legible over any frame; HeroStage deepens it on scroll.
 */
export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const { reduced } = useMotion();

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    // Asked directly as well: on the first render the motion context has not read the media
    // query yet, and a play() issued in that instant would start the download.
    const override = document.documentElement.dataset.motion;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || override === "reduce" || (prefersReduced && override !== "full")) {
      el.pause();
      return;
    }

    el.preload = "auto";
    const play = () => void el.play().catch(() => undefined);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) play();
      else el.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div
      data-hero-backdrop
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-maple-ink"
    >
      <video
        ref={video}
        muted
        loop
        playsInline
        // Nothing is fetched until it is going to play: with reduced motion it never downloads.
        preload="none"
        poster="/videos/hero-poster.jpg"
        onPlaying={() => setPlaying(true)}
        className={cn(
          "size-full object-cover transition-opacity duration-[1.4s] ease-maple",
          playing || reduced ? "opacity-100" : "opacity-0",
        )}
      >
        <source src="/videos/hero-mobile.mp4" type="video/mp4" media="(orientation: portrait)" />
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Legibility: darker at the top (navbar) and bottom (where the phone rises), with a soft
          pool of shadow behind the centered headline. */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_48%,rgb(11_11_11/0.55),transparent),linear-gradient(to_bottom,rgb(11_11_11/0.7),rgb(11_11_11/0.35)_35%,rgb(11_11_11/0.45)_65%,rgb(11_11_11/0.85))]" />
      {/* Deepened by HeroStage as the phone rises, so the device takes the focus. */}
      <div data-hero-shade className="absolute inset-0 bg-maple-ink opacity-0" />
    </div>
  );
}
