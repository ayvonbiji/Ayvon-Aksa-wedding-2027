import { useState } from 'react';
import { wedding } from '../config/wedding';
import { asset } from '../lib/assets';
import { Art, art } from './Art';
import { Logo } from './Logo';
import { Countdown } from './Countdown';
import { scrollToId } from './Header';

/** Delays (s) for the staggered entrance — feels like the card is being revealed line by line. */
const d = (s: number) => ({ animationDelay: `${s}s` });

/** The invitation page: names, date, venue, countdown and couple photo. */
export function Hero({ nowMs }: { nowMs: number }) {
  const c = wedding.ceremony;
  const h = wedding.hero;
  const [photoOk, setPhotoOk] = useState(Boolean(h.photo));
  const [weekday, day, month, year] = c.dateLabel.replace(',', '').split(' ');

  return (
    <section id="home" className="hero section" aria-labelledby="hero-names">
      <div className="hero__bg" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="sparkle" style={{ ['--i' as string]: i }} />
        ))}
      </div>
      <Art {...art.cornerTL} className="corner corner--tl" />
      <Art {...art.cornerTR} className="corner corner--tr" />

      <div className="hero__grid">
        <figure className="hero__photo enter enter--photo" style={d(0.9)}>
          <div className="arch arch--photo">
            {photoOk ? (
              <img
                src={asset(h.photo)}
                alt={h.photoAlt}
                style={{ objectPosition: h.photoPosition }}
                {...{ fetchpriority: 'high' }}
                decoding="async"
                width={960}
                height={1280}
                onError={() => setPhotoOk(false)}
              />
            ) : (
              <div className="placeholder" role="img" aria-label="Couple photograph coming soon">
                <Art {...art.bouquet} className="placeholder__art" />
                <span>Our photograph</span>
              </div>
            )}
          </div>
          <Art {...art.bouquet} className="hero__photo-flowers hero__photo-flowers--top" />
          <Art {...art.bouquetAlt} className="hero__photo-flowers hero__photo-flowers--bottom" />
        </figure>

        <div className="invite-panel">
          <span className="invite-panel__frame" aria-hidden="true" />
          <p className="kicker enter" style={d(0.15)}>{h.eyebrow}</p>
          <div className="logo-glow enter enter--zoom" style={d(0.3)}>
            <Logo variant="monogram" className="hero__logo" decorative />
          </div>

          <h1 id="hero-names" tabIndex={-1} className="hero__names">
            <span className="name-line enter enter--name" style={d(0.55)}>{wedding.groom.full}</span>
            <span className="hero__amp enter enter--zoom" style={d(0.85)} aria-label="and">&amp;</span>
            <span className="name-line enter enter--name" style={d(1.05)}>{wedding.bride.full}</span>
          </h1>

          <p className="hero__invite enter" style={d(1.35)}>{h.invite}</p>

          <div className="date-row enter" style={d(1.55)} aria-hidden="true">
            <span className="date-row__side">{weekday}</span>
            <span className="date-row__day">{day}</span>
            <span className="date-row__side">
              {month}
              <br />
              {year}
            </span>
          </div>
          <p className="sr-only">{c.dateLabel}</p>

          <p className="hero__when enter" style={d(1.7)}>
            <span className="hero__time">{c.timeLabel}</span>
            <span className="hero__venue">
              {c.venue}, {c.town}, {c.region}
            </span>
          </p>

          <div className="enter" style={d(1.85)}>
            <Countdown nowMs={nowMs} />
          </div>

          <a
            href="#wedding-day"
            className="btn btn--solid hero__cta enter"
            style={d(2)}
            onClick={(e) => {
              e.preventDefault();
              scrollToId('wedding-day');
            }}
          >
            {h.button}
          </a>
        </div>
      </div>

      <a
        href="#wedding-day"
        className="scroll-cue"
        aria-label="Scroll to wedding details"
        onClick={(e) => {
          e.preventDefault();
          scrollToId('wedding-day');
        }}
      >
        <span />
      </a>
    </section>
  );
}
