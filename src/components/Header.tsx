import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Logo } from './Logo';

export const NAV = [
  { id: 'home', label: 'Home' },
  { id: 'invitation', label: 'Invitation' },
  { id: 'love-story', label: 'Our Love Story' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'memories', label: 'Memories' },
] as const;

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
  history.replaceState(null, '', `#${id}`);
}

/** Sticky navigation with active-section highlight and a mobile menu. */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('home');
  const menuBtn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [ink, setInk] = useState<{ left: number; width: number } | null>(null);

  // Slide the gold indicator under the active link
  useLayoutEffect(() => {
    const place = () => {
      const a = list.current?.querySelector<HTMLAnchorElement>(`a[href="#${active}"]`);
      if (a && list.current && a.offsetParent) setInk({ left: a.offsetLeft, width: a.offsetWidth });
    };
    place();
    window.addEventListener('resize', place);
    document.fonts?.ready.then(place).catch(() => undefined);
    return () => window.removeEventListener('resize', place);
  }, [active]);

  // Lock page scroll while the full-screen mobile menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''} ${open ? 'header--open' : ''}`}>
      <div className="header__inner">
        <a href="#home" className="header__brand" onClick={go('home')} aria-label="Ayvon & Aksa — back to top">
          <Logo variant="compact" className="header__logo" decorative />
          <span className="header__names">Ayvon &amp; Aksa</span>
        </a>
        <button
          ref={menuBtn}
          type="button"
          className="header__toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="header__burger" aria-hidden="true" />
        </button>
        <nav id="site-nav" className="header__nav" aria-label="Main">
          <ul ref={list}>
            {ink && <li className="nav-ink" aria-hidden="true" style={{ transform: `translateX(${ink.left}px)`, width: ink.width }} />}
            {NAV.map((n, i) => (
              <li key={n.id} style={{ ['--i' as string]: i }}>
                <a href={`#${n.id}`} onClick={go(n.id)} aria-current={active === n.id ? 'location' : undefined}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
