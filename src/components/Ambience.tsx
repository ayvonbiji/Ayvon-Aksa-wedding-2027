import { memo, useEffect, useRef } from 'react';
import '../styles/ambience.css';

/* Deterministic pseudo-random layout so every render looks identical. */
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const v = (o: Record<string, string | number>) => o as React.CSSProperties;

export const makePetals = (n: number, seed = 0) =>
  Array.from({ length: n }, (_, j) => {
    const i = j + seed;
    return v({
      left: `${Math.round(rnd(i, 1) * 100)}%`,
      '--size': `${Math.round(12 + rnd(i, 2) * 16)}px`,
      '--dur': `${(11 + rnd(i, 3) * 9).toFixed(1)}s`,
      '--delay': `${(-rnd(i, 4) * 18).toFixed(1)}s`,
      '--drift': `${Math.round((rnd(i, 5) - 0.5) * 220)}px`,
      '--blur': j % 5 === 0 ? '2.5px' : '0px',
    });
  });
export const makeSparks = (n: number, seed = 0) =>
  Array.from({ length: n }, (_, j) => {
    const i = j + seed;
    return v({
      left: `${Math.round(rnd(i, 11) * 100)}%`,
      top: `${Math.round(30 + rnd(i, 12) * 70)}%`,
      '--size': `${(2 + rnd(i, 13) * 3).toFixed(1)}px`,
      '--dur': `${(6 + rnd(i, 14) * 6).toFixed(1)}s`,
      '--delay': `${(-rnd(i, 15) * 10).toFixed(1)}s`,
    });
  });
export const makeBokeh = (n: number, seed = 0) =>
  Array.from({ length: n }, (_, j) => {
    const i = j + seed;
    return v({
      left: `${Math.round(5 + rnd(i, 16) * 90)}%`,
      top: `${Math.round(10 + rnd(i, 17) * 80)}%`,
      '--size': `${Math.round(40 + rnd(i, 18) * 90)}px`,
      '--delay': `${(-rnd(i, 19) * 8).toFixed(1)}s`,
    });
  });

interface Props {
  petals?: number;
  sparks?: number;
  bokeh?: number;
  seed?: number;
  className?: string;
}

/** Decorative light, gold particles and falling petals. Pauses when off-screen. */
export const Ambience = memo(function Ambience({ petals = 10, sparks = 16, bokeh = 6, seed = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-paused', !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`ambience ${className}`} aria-hidden="true">
      {makeBokeh(bokeh, seed).map((st, i) => (
        <span key={`b${i}`} className="bokeh" style={st} />
      ))}
      {makeSparks(sparks, seed).map((st, i) => (
        <span key={`s${i}`} className="spark" style={st} />
      ))}
      {makePetals(petals, seed).map((st, i) => (
        <span key={`p${i}`} className={`fpetal fpetal--${i % 3}`} style={st} />
      ))}
    </div>
  );
});
