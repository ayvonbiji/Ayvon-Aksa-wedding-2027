import { useEffect, useRef, useState } from 'react';
import { wedding } from '../config/wedding';
import { Art, art } from './Art';
import { Logo } from './Logo';
import { prefersReducedMotion } from '../lib/assets';
import { useScrollLock } from '../lib/hooks';

interface Props {
  onOpened: () => void;
}

/** The face of the invitation (rendered twice: once per door). */
function CoverFace({ interactive, onOpen, buttonRef }: { interactive: boolean; onOpen?: () => void; buttonRef?: React.Ref<HTMLButtonElement> }) {
  return (
    <div className="cover__face">
      <Art {...art.cornerTL} className="cover__corner cover__corner--tl" />
      <Art {...art.cornerBR} className="cover__corner cover__corner--br" />
      <div className="cover__frame">
        <Art {...art.oval} className="cover__oval" />
        <div className="cover__content">
          <Logo variant="monogram" className="cover__logo" decorative={!interactive} />
          <p className="cover__kicker">{wedding.cover.kicker}</p>
          <p className="cover__names">
            <span>{wedding.groom.full}</span>
            <span className="cover__amp">&amp;</span>
            <span>{wedding.bride.full}</span>
          </p>
          <p className="cover__date">{wedding.ceremony.shortDateLabel}</p>
          {interactive ? (
            <button ref={buttonRef} type="button" className="btn btn--pill cover__btn" onClick={onOpen}>
              {wedding.cover.button}
            </button>
          ) : (
            <span className="btn btn--pill cover__btn" aria-hidden="true">
              {wedding.cover.button}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Opening experience: a gate-fold invitation card. Clicking "Open Invitation"
 * swings the two halves apart to reveal the website (≈1.4 s; a short fade
 * when the visitor prefers reduced motion).
 */
export function InvitationCover({ onOpened }: Props) {
  const [stage, setStage] = useState<'closed' | 'opening' | 'gone'>('closed');
  const btn = useRef<HTMLButtonElement>(null);
  useScrollLock(stage !== 'gone');

  useEffect(() => {
    btn.current?.focus({ preventScroll: true });
  }, []);

  const open = () => {
    if (stage !== 'closed') return;
    setStage('opening');
    const ms = prefersReducedMotion() ? 350 : 1500;
    window.setTimeout(() => {
      setStage('gone');
      onOpened();
    }, ms);
  };

  if (stage === 'gone') return null;

  return (
    <div
      className={`cover cover--${stage}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Wedding invitation of ${wedding.groom.full} and ${wedding.bride.full}`}
    >
      {/* Accessible, interactive face (fades as the doors open) */}
      <div className="cover__front">
        <CoverFace interactive onOpen={open} buttonRef={btn} />
      </div>
      {/* Two visual halves that swing open */}
      <div className="cover__door cover__door--left" aria-hidden="true">
        <div className="cover__door-inner">
          <CoverFace interactive={false} />
        </div>
      </div>
      <div className="cover__door cover__door--right" aria-hidden="true">
        <div className="cover__door-inner">
          <CoverFace interactive={false} />
        </div>
      </div>
      <div className="cover__seam" aria-hidden="true" />
    </div>
  );
}
