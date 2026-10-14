import { useState } from 'react';
import { wedding } from '../config/wedding';
import { asset } from '../lib/assets';
import { Art, art } from './Art';
import { Logo } from './Logo';
import { Countdown } from './Countdown';
import { scrollToId } from './Header';

/** The invitation page: names, date, venue, countdown and couple photo. */
export function Hero({ nowMs }: { nowMs: number }) {
  const c = wedding.ceremony;
  const h = wedding.hero;
  const [photoOk, setPhotoOk] = useState(Boolean(h.photo));
  const [weekday, day, month, year] = c.dateLabel.replace(',', '').split(' ');

  return (
    <section id="home" className="hero section" aria-labelledby="hero-names">
      <Art {...art.cornerTL} className="corner corner--tl" />
      <Art {...art.cornerTR} className="corner corner--tr" />

      <div className="hero__grid">
        <div className="hero__text">
          <p className="label hero__eyebrow fade-up" style={{ animationDelay: '.1s' }}>{h.eyebrow}</p>
          <Logo variant="monogram" className="hero__logo fade-up" decorative />

          <h1 id="hero-names" tabIndex={-1} className="hero__names fade-up" style={{ animationDelay: '.25s' }}>
            <span className="script">{wedding.groom.full}</span>
            <span className="hero__amp" aria-label="and">&amp;</span>
            <span className="script">{wedding.bride.full}</span>
          </h1>

          <p className="hero__invite fade-up" style={{ animationDelay: '.4s' }}>{h.invite}</p>

          <div className="datecard fade-up" style={{ animationDelay: '.5s' }}>
            <Art {...art.cartouche} className="datecard__frame" />
            <div className="datecard__body">
              <span className="label datecard__kicker">Our Wedding Day</span>
              <span className="datecard__day">{day}</span>
              <span className="datecard__month">{month}</span>
              <span className="datecard__meta">
                {year} · {weekday}
              </span>
            </div>
          </div>
          <p className="sr-only">{c.dateLabel}</p>

          <p className="hero__when fade-up" style={{ animationDelay: '.6s' }}>
            <span className="hero__time">{c.timeLabel}</span>
            <span className="hero__venue">
              {c.venue}, {c.town}, {c.region}
            </span>
          </p>

          <div className="fade-up" style={{ animationDelay: '.7s' }}>
            <Countdown nowMs={nowMs} />
          </div>

          <a
            href="#wedding-day"
            className="btn btn--solid hero__cta fade-up"
            style={{ animationDelay: '.8s' }}
            onClick={(e) => {
              e.preventDefault();
              scrollToId('wedding-day');
            }}
          >
            {h.button}
          </a>
        </div>

        <figure className="hero__photo fade-up" style={{ animationDelay: '.3s' }}>
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
      </div>
    </section>
  );
}
