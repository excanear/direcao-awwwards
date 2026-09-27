"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

import { useNavTheme } from "@/components/layout/useNavTheme";
import { useMotion } from "@/components/motion/MotionProvider";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * Floating capsule navbar. It detaches from the page edge, reads the tone of the section under
 * it (glass paper or glass ink), and firms up once the page has scrolled. A single highlight
 * glides between the links under the pointer. Mobile: the capsule opens a floating menu card.
 */
export function Navbar() {
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const links = useRef<HTMLUListElement>(null);
  const menuId = useId();
  const [menuOpen, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [glide, setGlide] = useState<{ x: number; w: number } | null>(null);
  const { lenis } = useMotion();
  const isDesktop = useMediaQuery("(min-width: 48rem)");
  const sectionTone = useNavTheme(header);
  // The mobile menu cannot exist on desktop, even if it was left open before a resize.
  const open = menuOpen && !isDesktop;
  const dark = sectionTone === "dark" && !open;

  // The page background follows the section on screen. Whatever shows through for a frame
  // while pinned scenes catch up with a fast scroll is then the same color as around it.
  useEffect(() => {
    document.documentElement.dataset.pageTone = sectionTone;
  }, [sectionTone]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const smoothScroll = lenis.current;
    smoothScroll?.stop();
    firstLink.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      root.style.overflow = "";
      smoothScroll?.start();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, lenis]);

  const close = () => setOpen(false);

  // Moves the gliding highlight under the hovered/focused link (measured on its <li>, which is
  // the link's offsetParent).
  const glideTo = (target: HTMLElement) => {
    const item = target.parentElement ?? target;
    setGlide({ x: item.offsetLeft, w: item.offsetWidth });
  };

  return (
    <header
      ref={header}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-(--nav-height)"
    >
      <nav
        aria-label="Principal"
        className={cn(
          "pointer-events-auto absolute inset-x-(--gutter) top-3 mx-auto flex h-13 max-w-5xl items-center justify-between rounded-pill pr-1.5 pl-3",
          "backdrop-blur-xl backdrop-saturate-150",
          "transition-[background-color,color,box-shadow] duration-fast ease-maple",
          dark
            ? "bg-maple-ink/70 text-maple-paper shadow-[inset_0_0_0_1px_rgb(225_227_219/0.12),0_1rem_2.5rem_-1rem_rgb(0_0_0/0.5)]"
            : "bg-maple-paper/70 text-maple-ink shadow-[inset_0_0_0_1px_rgb(34_34_34/0.08),0_1rem_2.5rem_-1.25rem_rgb(34_34_34/0.28)]",
          // At the very top of a page the capsule sits lighter, then firms up on scroll.
          !scrolled && !open && (dark ? "bg-maple-ink/35" : "bg-maple-paper/45"),
        )}
      >
        <Link href="/" className="text-[0.9375rem]" onClick={close}>
          <Logo className="h-12" sizes="48px" priority />
          <span className="sr-only">, página inicial</span>
        </Link>

        <ul
          ref={links}
          onMouseLeave={() => setGlide(null)}
          className="absolute left-1/2 hidden -translate-x-1/2 items-center text-small md:flex"
        >
          <li
            aria-hidden="true"
            style={{ "--x": `${glide?.x ?? 0}px`, "--w": `${glide?.w ?? 0}px` } as CSSProperties}
            className={cn(
              "absolute top-0 left-0 h-full w-(--w) translate-x-(--x) rounded-pill",
              "transition-[translate,width,opacity] duration-fast ease-maple",
              dark ? "bg-maple-paper/10" : "bg-maple-ink/[0.06]",
              glide ? "opacity-100" : "opacity-0",
            )}
          />
          {site.nav.map((item) => (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                onMouseEnter={(event) => glideTo(event.currentTarget)}
                onFocus={(event) => glideTo(event.currentTarget)}
                onBlur={() => setGlide(null)}
                className="block rounded-pill px-4 py-2 opacity-75 transition-opacity duration-fast ease-maple hover:opacity-100 focus-visible:opacity-100"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Visibility lives on a wrapper: Button owns its display value. */}
        <div className="hidden md:block">
          <Button href={site.primaryCta.href} size="sm" className="h-10 px-5">
            {site.primaryCta.label}
          </Button>
        </div>

        <button
          ref={toggle}
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((value) => !value)}
          className="relative grid size-10 place-items-center rounded-pill md:hidden"
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute h-px w-4.5 bg-current transition-transform duration-fast ease-maple",
              open ? "rotate-45" : "-translate-y-[3px]",
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "absolute h-px w-4.5 bg-current transition-transform duration-fast ease-maple",
              open ? "-rotate-45" : "translate-y-[3px]",
            )}
          />
        </button>
      </nav>

      {/* Mobile: a floating card under the capsule, over a dimmed page. */}
      <div
        aria-hidden="true"
        onClick={close}
        className={cn(
          "fixed inset-0 -z-10 bg-maple-ink/30 backdrop-blur-sm transition-opacity duration-fast ease-maple md:hidden",
          open ? "pointer-events-auto opacity-100" : "opacity-0",
        )}
      />
      <div
        id={menuId}
        inert={!open}
        className={cn(
          "fixed inset-x-(--gutter) top-[calc(var(--nav-height)+0.25rem)] origin-top rounded-card bg-maple-paper p-3 text-maple-ink md:hidden",
          "shadow-[inset_0_0_0_1px_rgb(34_34_34/0.08),0_2rem_4rem_-1.5rem_rgb(34_34_34/0.45)]",
          "transition-[opacity,transform,scale] duration-fast ease-maple",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-[0.98] opacity-0",
        )}
      >
        <ul className="flex flex-col">
          {site.nav.map((item, index) => (
            <li
              key={item.href}
              className={cn(
                "border-b border-maple-line transition-[opacity,transform] duration-base ease-maple",
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              )}
              style={{ transitionDelay: open ? `${60 + index * 50}ms` : "0ms" }}
            >
              <Link
                ref={index === 0 ? firstLink : undefined}
                href={item.href}
                onClick={close}
                className="flex rounded-sm px-3 py-4 text-title font-semibold active:bg-maple-ink/5"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div
          className={cn(
            "flex flex-col gap-4 px-3 pt-5 pb-2 transition-[opacity,transform] duration-base ease-maple",
            open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
          style={{ transitionDelay: open ? "220ms" : "0ms" }}
        >
          <p className="font-serif text-lead text-maple-muted italic">{site.slogan}</p>
          <Button href={site.primaryCta.href} size="lg" onClick={close}>
            {site.primaryCta.label}
          </Button>
        </div>
      </div>
    </header>
  );
}
