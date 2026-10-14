import { useEffect, useRef, useState } from 'react';
import { now } from './time';

/** Re-renders every second, aligned to the start of each second. Cleans up on unmount. */
export function useNow(): number {
  const [t, setT] = useState(() => now());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const n = now();
      setT(n);
      timer = setTimeout(tick, 1000 - (n % 1000) + 5);
    };
    timer = setTimeout(tick, 1000 - (now() % 1000) + 5);
    const onVisible = () => document.visibilityState === 'visible' && setT(now());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return t;
}

/** Adds `is-visible` when the element scrolls into view (fade-in reveals). */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('is-visible'), io.unobserve(e.target))),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Locks page scrolling while `active` (for the cover and lightbox). */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [active]);
}
