"use client";

import Lenis from "lenis";
import {
  createContext,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useMediaQuery } from "@/lib/use-media-query";

export type MotionOverride = "reduce" | "full" | null;

type MotionContextValue = {
  /** True when animations must render their static end state. */
  reduced: boolean;
  override: MotionOverride;
  setOverride: (override: MotionOverride) => void;
  /** Holds the instance only while smooth scroll is active (fine pointer + motion allowed). */
  lenis: RefObject<Lenis | null>;
};

const MotionContext = createContext<MotionContextValue | null>(null);

export function MotionProvider({ children }: { children: ReactNode }) {
  const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const finePointer = useMediaQuery("(pointer: fine)");
  const [override, setOverride] = useState<MotionOverride>(null);
  const lenis = useRef<Lenis | null>(null);

  const reduced = override ? override === "reduce" : prefersReduced;
  const smooth = finePointer && !reduced;

  useEffect(() => {
    const root = document.documentElement;
    if (override) root.dataset.motion = override;
    else delete root.dataset.motion;
  }, [override]);

  useEffect(() => {
    if (!smooth) return;

    const instance = new Lenis({ autoRaf: false, anchors: true });
    const tick = (time: number) => instance.raf(time * 1000);

    instance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.current = instance;

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      lenis.current = null;
    };
  }, [smooth]);

  // Webfonts change line breaks and section heights: re-measure every trigger once they land.
  useEffect(() => {
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ reduced, override, setOverride, lenis }), [reduced, override]);

  return <MotionContext value={value}>{children}</MotionContext>;
}

export function useMotion(): MotionContextValue {
  const context = use(MotionContext);
  if (!context) throw new Error("useMotion must be used inside <MotionProvider>");
  return context;
}
