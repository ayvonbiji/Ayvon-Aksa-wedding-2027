import { useEffect, useRef, useState } from 'react';
import { wedding } from '../config/wedding';
import { Art, art } from './Art';
import { Logo } from './Logo';
import { prefersReducedMotion } from '../lib/assets';
import { useScrollLock } from '../lib/hooks';

interface Props {
  onOpened: () => void;
}

/** Total length of the opening sequence (ms) — keep in sync with global.css. */
const OPEN_MS = 2600;

/**
 * Opening experience: a burgundy envelope sealed with the gold A&A monogram.
 * "Open Invitation" breaks the seal, lifts the flap, slides the invitation
 * card out and dissolves into the website. Reduced motion → short fade.
 * Clicking again while it plays skips straight to the site.
 */
export function InvitationCover({ onOpened }: Props) {
  const [stage, setStage] = useState<'closed' | 'opening' | 'gone'>('closed');
  const btn = useRef<HTMLButtonElement>(null);
  const timer = useRef<number>();
  useScrollLock(stage !== 'gone');

  useEffect(() => {
    btn.current?.focus({ preventScroll: true });
    return () => window.clearTimeout(timer.current);
  }, []);

  const finish = () => {
    window.clearTimeout(timer.current);
    setStage('gone');
    onOpened();
  };

  const open = () => {
    if (stage === 'opening') return finish(); // second click skips the animation
    setStage('opening');
    timer.current = window.setTimeout(finish, prefersReducedMotion() ? 350 : OPEN_MS);
  };

  if (stage === 'gone') return null;
  const c = wedding.ceremony;

  return (
    <div
      className={`cover cover--${stage}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Wedding invitation of ${wedding.groom.full} and ${wedding.bride.full}`}
    >
      <div className="cover__bg" aria-hidden="true">
        <Art {...art.cornerTL} className="cover__corner cover__corner--tl" />
        <Art {...art.cornerBR} className="cover__corner cover__corner--br" />
        <span className="cover__glow" />
      </div>

      <div className="cover__stage">
        <p className="cover__kicker">You are cordially invited</p>

        <div className="envelope" onClick={open} aria-hidden="true">
          <div className="envelope__back" />
          <div className="envelope__card">
            <Logo variant="monogram" className="envelope__logo" decorative />
            <p className="envelope__script">{wedding.cover.kicker}</p>
            <p className="envelope__names">
              {wedding.groom.first} <span>&amp;</span> {wedding.bride.first}
            </p>
            <p className="envelope__date">{c.numericDateLabel}</p>
          </div>
          <div className="envelope__pocket" />
          <div className="envelope__flap" />
          <div className="envelope__seal">
            <Logo variant="compact" className="envelope__seal-logo" decorative />
          </div>
        </div>

        <div className="cover__text">
          <p className="cover__names">
            <span>{wedding.groom.full}</span>
            <span className="cover__amp">&amp;</span>
            <span>{wedding.bride.full}</span>
          </p>
          <p className="cover__date">
            {c.dateLabel} · {c.timeLabel}
          </p>
          <button ref={btn} type="button" className="btn btn--gold cover__btn" onClick={open}>
            {stage === 'opening' ? 'Opening…' : wedding.cover.button}
          </button>
        </div>
      </div>
    </div>
  );
}
