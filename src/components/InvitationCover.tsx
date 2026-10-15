import { useCallback, useEffect, useRef, useState } from 'react';
import { wedding } from '../config/wedding';
import { Art, art } from './Art';
import { Logo } from './Logo';
import { Ambience } from './Ambience';
import { asset, prefersReducedMotion } from '../lib/assets';
import { useScrollLock } from '../lib/hooks';
import '../styles/cover.css';

interface Props {
  onOpened: () => void;
}

/**
 * Opening experience (timings live in src/styles/cover.css):
 *   1. welcome  — burgundy scene, roses, petals, gold particles; text and envelope fade in
 *   2. opening  — button press → wax seal lifts → flap opens in 3D → card rises, petals burst
 *   3. card     — the full invitation card with names and details revealed in sequence
 *   4. leaving  — the card lifts away and the website appears
 * "Skip" (or Escape) jumps straight to the website at any time.
 * Reduced motion: no particles/petals and simple fades only.
 */
type Stage = 'welcome' | 'opening' | 'card' | 'leaving' | 'gone';

const OPEN_MS = 2000; // envelope opening → invitation card
const LEAVE_MS = 900; // invitation card → website

/* Deterministic pseudo-random layout so every render looks the same. */
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const v = (o: Record<string, string | number>) => o as React.CSSProperties;

const BURST = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2 + rnd(i, 6) * 0.4;
  const d = 140 + rnd(i, 7) * 160;
  return v({
    '--bx': `${Math.round(Math.cos(a) * d)}px`,
    '--by': `${Math.round(Math.sin(a) * d * 0.75 - 40)}px`,
    '--br': `${Math.round(rnd(i, 8) * 540 - 270)}deg`,
    '--size': `${Math.round(12 + rnd(i, 9) * 12)}px`,
    animationDelay: `${(0.35 + rnd(i, 10) * 0.25).toFixed(2)}s`,
  });
});
export function InvitationCover({ onOpened }: Props) {
  const [stage, setStage] = useState<Stage>('welcome');
  const openBtn = useRef<HTMLButtonElement>(null);
  const enterBtn = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  useScrollLock(stage !== 'gone');

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setStage('gone');
    onOpened();
  }, [onOpened]);

  useEffect(() => {
    openBtn.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && finish();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [finish]);

  useEffect(() => {
    if (stage === 'card') enterBtn.current?.focus({ preventScroll: true });
  }, [stage]);

  const open = () => {
    if (stage !== 'welcome') return;
    if (prefersReducedMotion()) return setStage('card');
    setStage('opening');
    later(() => setStage('card'), OPEN_MS);
  };

  const enter = () => {
    if (stage !== 'card') return;
    if (prefersReducedMotion()) return finish();
    setStage('leaving');
    later(finish, LEAVE_MS);
  };

  if (stage === 'gone') return null;

  const c = wedding.ceremony;
  const showCard = stage === 'card' || stage === 'leaving';

  return (
    <div className={`invite invite--${stage}`} role="dialog" aria-modal="true" aria-label={`Wedding invitation of ${wedding.groom.full} and ${wedding.bride.full}`}>
      {/* ── backdrop: velvet, bokeh, particles, petals, roses, pendants ── */}
      <div className="invite__bg" aria-hidden="true">
        <span className="invite__glow" />
        <Ambience petals={14} sparks={22} bokeh={7} />
        <Art {...art.hanging} className="invite__pendant" />
        <Art {...art.roseCorner} className="invite__roses invite__roses--tl" />
        <Art {...art.roseCorner} className="invite__roses invite__roses--br" />
      </div>

      <button type="button" className="invite__skip" onClick={finish}>
        Skip <span aria-hidden="true">›</span>
        <span className="sr-only"> the invitation and go to the wedding website</span>
      </button>

      {/* ── stages 1–2: welcome & envelope ── */}
      <div className="invite__scene" aria-hidden={showCard || undefined}>
        <p className="invite__title">
          <span>You are cordially invited</span>
        </p>
        <Art {...art.goldDivider} className="invite__divider invite__divider--top" />

        <div className="env" onClick={open}>
          <div className="env__float">
            <div className="env__back" />
            <div className="env__letter">
              <Logo variant="monogram" className="env__letter-logo" decorative />
              <span className="env__letter-names">
                {wedding.groom.first} <em>&amp;</em> {wedding.bride.first}
              </span>
            </div>
            <div className="env__pocket">
              <svg className="env__lines" viewBox="0 0 145 100" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="0,0 72.5,54 145,0" />
                <polyline points="0,100 60,46" />
                <polyline points="145,100 85,46" />
              </svg>
              <Art {...art.envSprig} className="env__sprig env__sprig--l" />
              <Art {...art.envSprig} className="env__sprig env__sprig--r" />
            </div>
            <svg className="env__flap" viewBox="0 0 145 58" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="flapFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#F7ECD7" />
                  <stop offset="1" stopColor="#E9D6B1" />
                </linearGradient>
              </defs>
              <polygon points="0,0 145,0 72.5,58" fill="url(#flapFill)" />
              <polyline points="0,0 72.5,58 145,0" fill="none" stroke="#B9944F" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
            </svg>
            <img className="env__seal" src={asset('brand/wax-seal.svg')} alt="" width={300} height={300} />
            <span className="env__shine" />
          </div>
          <span className="env__reflection" />
          {BURST.map((st, i) => (
            <span key={`x${i}`} className={`burst fpetal--${i % 3}`} style={st} />
          ))}
        </div>

        <div className="invite__names">
          <span className="invite__name">{wedding.groom.full}</span>
          <span className="invite__amp">
            <Art {...art.flourish} className="invite__amp-orn invite__amp-orn--l" />
            <em>&amp;</em>
            <Art {...art.flourish} className="invite__amp-orn invite__amp-orn--r" />
          </span>
          <span className="invite__name">{wedding.bride.full}</span>
        </div>
        <p className="invite__when">
          {c.dateLabel} · {c.timeLabel}
        </p>

        <div className="invite__cta">
          <Art {...art.flourish} className="invite__btn-orn invite__btn-orn--l" />
          <button ref={openBtn} type="button" className="invite__btn" onClick={open} disabled={stage !== 'welcome'} tabIndex={showCard ? -1 : 0}>
            {stage === 'opening' ? 'Opening…' : wedding.cover.button}
            <span aria-hidden="true" className="invite__btn-arrow">›</span>
          </button>
          <Art {...art.flourish} className="invite__btn-orn invite__btn-orn--r" />
        </div>
      </div>

      {/* ── stage 3: the invitation card ── */}
      {showCard && (
        <div className="icard-wrap">
          <article className="icard" aria-labelledby="icard-names">
            <span className="icard__frame" aria-hidden="true" />
            <Art {...art.cardCorner} className="icard__corner icard__corner--tl" />
            <Art {...art.cardCorner} className="icard__corner icard__corner--br" />
            <Logo variant="monogram" className="icard__logo q" decorative />
            <p className="icard__kicker q">{wedding.hero.eyebrow}</p>
            <h2 id="icard-names" className="icard__names">
              <span className="q">{wedding.groom.full}</span>
              <span className="icard__amp q">&amp;</span>
              <span className="q">{wedding.bride.full}</span>
            </h2>
            <p className="icard__invite q">{wedding.hero.invite}</p>
            <Art {...art.goldDivider} className="icard__divider q" />
            <p className="icard__date q">{c.dateLabel}</p>
            <p className="icard__time q">{c.timeLabel}</p>
            <p className="icard__venue q">
              {c.venue}, {c.town}, {c.region}
            </p>
            <button ref={enterBtn} type="button" className="invite__btn icard__btn q" onClick={enter}>
              Continue to Our Wedding <span aria-hidden="true" className="invite__btn-arrow">›</span>
            </button>
          </article>
        </div>
      )}
    </div>
  );
}
