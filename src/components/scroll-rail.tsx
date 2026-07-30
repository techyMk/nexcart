"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";

type ScrollRailProps = {
  children: ReactNode;
  /** Applied to the scroll container — callers pass their existing full-bleed/snap classes. */
  className?: string;
  ariaLabel: string;
  /** Extra classes for both arrow buttons (e.g. "lg:hidden" when the rail becomes a grid). */
  arrowClassName?: string;
  /**
   * Auto-advance one "page" every ~3.5s, looping back to the start at the end.
   * Pauses on any user interaction (hover, touch, wheel, drag) and resumes
   * after ~6s idle. Self-disables under reduced motion or when content fits.
   */
  autoPlay?: boolean;
  /**
   * Only run autoplay while the viewport is at most this wide (px) — lets a
   * rail auto-scroll on phones while staying fully manual on wider screens.
   */
  autoPlayMaxWidth?: number;
};

const AUTOPLAY_INTERVAL_MS = 3500;
const IDLE_RESUME_MS = 6000;
/** Quiet window after the last scroll event before a programmatic smooth scroll is considered settled. */
const PROGRAMMATIC_SETTLE_MS = 150;

export function ScrollRail({
  children,
  className,
  ariaLabel,
  arrowClassName,
  autoPlay = false,
  autoPlayMaxWidth,
}: ScrollRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [userPaused, setUserPaused] = useState(false);
  // Starts false so SSR and the first client render agree; the media-query
  // effect below flips it before autoplay's first 3.5s tick.
  const [inAutoViewport, setInAutoViewport] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!autoPlay) return;
    if (autoPlayMaxWidth == null) {
      setInAutoViewport(true);
      return;
    }
    const mq = window.matchMedia(`(max-width: ${autoPlayMaxWidth}px)`);
    const sync = () => setInAutoViewport(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [autoPlay, autoPlayMaxWidth]);

  // True while a component-initiated smooth scroll is in flight, so its scroll
  // events aren't mistaken for user interaction (e.g. a scrollbar drag).
  const programmaticScroll = useRef(false);
  const settleTimer = useRef<number>();
  const idleTimer = useRef<number>();

  const contentFits = atStart && atEnd;
  const autoEnabled = autoPlay && inAutoViewport && !reducedMotion && !contentFits;

  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // 2px tolerance absorbs fractional scroll positions at odd zoom levels.
    setAtStart(scrollLeft <= 2);
    setAtEnd(scrollLeft >= scrollWidth - clientWidth - 2);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    const el = railRef.current;
    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (el && ro) ro.observe(el);
    return () => {
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, [measure]);

  // Any manual control pauses autoplay and (re)starts the idle-resume clock.
  const interact = useCallback(() => {
    if (!autoPlay) return;
    // User input cancels an in-flight smooth scroll; subsequent events are theirs.
    programmaticScroll.current = false;
    setUserPaused(true);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      setUserPaused(false);
    }, IDLE_RESUME_MS);
  }, [autoPlay]);

  const handleScroll = useCallback(() => {
    measure();
    if (programmaticScroll.current) {
      // Debounce-clear the flag once our smooth scroll stops emitting events.
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        programmaticScroll.current = false;
      }, PROGRAMMATIC_SETTLE_MS);
    } else {
      // Scroll we didn't start — scrollbar drag, touch fling, etc.
      interact();
    }
  }, [measure, interact]);

  // Autoplay loop: advance one page each tick; wrap back to the start at the end.
  useEffect(() => {
    if (!autoEnabled || userPaused) return;
    const id = window.setInterval(() => {
      const el = railRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      programmaticScroll.current = true;
      if (el.scrollLeft >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: el.clientWidth * 0.8, behavior: "smooth" });
      }
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [autoEnabled, userPaused]);

  // Timers survive effect re-runs above; make sure they die with the component.
  useEffect(() => {
    return () => {
      window.clearTimeout(settleTimer.current);
      window.clearTimeout(idleTimer.current);
    };
  }, []);

  const scrollBy = (dir: -1 | 1) => {
    const el = railRef.current;
    if (!el) return;
    interact(); // covers keyboard activation, which fires no pointer events
    programmaticScroll.current = true;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  // Mirrors the hero slider's arrow treatment (border-border bg-card
  // backdrop-blur-md hover:bg-card-2, h-9 w-9) so rails feel like one system.
  const arrowBase =
    "absolute top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-text backdrop-blur-md transition duration-200 hover:bg-card-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

  return (
    <div
      className="relative"
      onPointerEnter={autoPlay ? interact : undefined}
      onPointerDown={autoPlay ? interact : undefined}
      onTouchStart={autoPlay ? interact : undefined}
      onWheel={autoPlay ? interact : undefined}
    >
      <div
        ref={railRef}
        role="group"
        aria-label={ariaLabel}
        onScroll={handleScroll}
        className={className}
      >
        {children}
      </div>
      <button
        type="button"
        aria-label="Scroll left"
        disabled={atStart}
        onClick={() => scrollBy(-1)}
        className={`${arrowBase} left-2 ${
          atStart ? "pointer-events-none opacity-0" : "opacity-100"
        } ${arrowClassName ?? ""}`}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        disabled={atEnd}
        onClick={() => scrollBy(1)}
        className={`${arrowBase} right-2 ${
          atEnd ? "pointer-events-none opacity-0" : "opacity-100"
        } ${arrowClassName ?? ""}`}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
