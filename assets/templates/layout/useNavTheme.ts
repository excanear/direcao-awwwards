"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type RefObject } from "react";

import type { NavTone } from "@/components/ui/Section";

/**
 * Reports the tone of the Section currently under the navbar. The observer's root is shrunk to
 * a 1px line at the navbar's vertical center. Usually one section crosses it; when a frozen
 * section lies under the sheet rising over it, both do, and the later one in the document is
 * the one on top. A section may also flip its own data-nav-theme mid-scroll (e.g. a pinned
 * scene that ends on paper); a MutationObserver re-reads the line when that happens.
 */
export function useNavTheme(header: RefObject<HTMLElement | null>): NavTone {
  const pathname = usePathname();
  const [tone, setTone] = useState<NavTone>("light");

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-nav-theme]");
    const line = () => Math.round((header.current?.offsetHeight ?? 56) / 2);
    const toneOf = (el: HTMLElement): NavTone =>
      el.dataset.navTheme === "dark" ? "dark" : "light";
    let observer: IntersectionObserver | undefined;
    const under = new Set<Element>();
    // Last in document order wins: later sections are drawn above earlier ones.
    const update = () => {
      const top = [...sections].reverse().find((section) => under.has(section));
      if (top) setTone(toneOf(top));
    };

    const observe = () => {
      observer?.disconnect();
      under.clear();
      const y = line();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) under.add(entry.target);
            else under.delete(entry.target);
          }
          update();
        },
        // Clamped: a viewport shorter than the navbar would otherwise produce "--Npx".
        { rootMargin: `-${y}px 0px -${Math.max(0, window.innerHeight - y - 1)}px 0px` },
      );
      sections.forEach((section) => observer?.observe(section));
    };

    const mutations = new MutationObserver(update);
    sections.forEach((section) =>
      mutations.observe(section, { attributes: true, attributeFilter: ["data-nav-theme"] }),
    );

    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(observe);
    };

    observe();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
      mutations.disconnect();
    };
  }, [header, pathname]);

  return tone;
}
