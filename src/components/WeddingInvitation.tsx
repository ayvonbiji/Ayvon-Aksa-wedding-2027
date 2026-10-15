import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { wedding } from '../config/wedding';
import { asset } from '../lib/assets';
import { useScrollLock } from '../lib/hooks';
import { downloadICS, engagementEvent, googleCalendarUrl, weddingEvent, type CalEvent } from '../lib/calendar';
import * as o from '../art/ornaments.js';
import { Art, art, SvgDefs } from './Art';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { Reveal } from './Reveal';
import '../styles/invitation.css';

const inv = wedding.invitation;
const church = { svg: o.churchScene({ p: 'aa' }), viewBox: '0 0 400 1000' };
const rings = { svg: o.ringsBadge(), viewBox: '0 0 60 60' };
const cross = { svg: o.crossBadge(), viewBox: '0 0 60 60' };
const photoFlowers = { svg: o.cluster(120, 120, 110, { dir: -40, seed: 2 }) + o.sprig(200, 140, 120, { dir: -20 }) + o.sprig(60, 70, 100, { dir: -110, curl: -0.3 }), viewBox: '0 0 300 220' };

interface CardEvent {
  key: string;
  title: string;
  badge: typeof rings;
  date: string;
  weekday: string;
  time: string;
  venue: string;
  place: string;
  mapsUrl?: string;
  calendar: CalEvent;
}

const PrintIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z" />
  </svg>
);

const weekday = (label: string) => label.split(',')[0].trim();

/** Engagement first, then the wedding ceremony — straight from the config. */
export const cardEvents = (): CardEvent[] => {
  const e = wedding.engagement;
  const c = wedding.ceremony;
  const list: CardEvent[] = [];
  if (e.show) {
    list.push({
      key: 'engagement',
      title: e.title,
      badge: rings,
      date: e.shortDateLabel,
      weekday: weekday(e.dateLabel),
      time: e.timeLabel,
      venue: e.venue || e.venuePlaceholder,
      place: e.place,
      mapsUrl: e.venue ? e.mapsUrl : undefined,
      calendar: engagementEvent,
    });
  }
  list.push({
    key: 'wedding',
    title: 'Wedding Ceremony',
    badge: cross,
    date: c.shortDateLabel,
    weekday: weekday(c.dateLabel),
    time: c.timeLabel,
    venue: c.venue,
    place: `${c.town}, ${c.region}, ${c.country}`,
    mapsUrl: c.mapsUrl,
    calendar: weddingEvent,
  });
  return list;
};

function Person({ who, k }: { who: typeof wedding.groom | typeof wedding.bride; k: 'groom' | 'bride' }) {
  return (
    <div className={`inv-card__person inv-card__person--${k}`}>
      <p className={`inv-card__name inv-anim`}>{who.full}</p>
      <p className="inv-card__parents inv-anim">
        <span className="inv-card__rel">{who.relation}</span> {who.parents}
      </p>
      <p className="inv-card__house inv-anim">{who.house} House</p>
    </div>
  );
}

/**
 * The invitation card itself. Real text (selectable, readable by screen
 * readers), laid out like a printed card on wide screens and as a single
 * column on phones.
 */
export function InvitationCard({ eager = false }: { eager?: boolean }) {
  const titleWords = inv.title.split(' ');
  const last = titleWords.pop();
  const events = cardEvents();
  return (
    <article className="inv-card" aria-label={`Wedding invitation of ${wedding.groom.full} and ${wedding.bride.full}`}>
      <span className="inv-card__paper" aria-hidden="true" />
      <Art {...church} className="inv-card__church" fit="xMidYMin slice" />
      <span className="inv-card__glow" aria-hidden="true" />
      <span className="inv-card__frame" aria-hidden="true" />
      <Art {...art.goldCorner} className="inv-card__corner inv-card__corner--tl" />
      <Art {...art.goldCorner} className="inv-card__corner inv-card__corner--tr" />
      <Art {...art.goldCorner} className="inv-card__corner inv-card__corner--bl" />
      <Art {...art.goldCorner} className="inv-card__corner inv-card__corner--br" />
      <Art {...art.roseCorner} className="inv-card__flowers inv-card__flowers--tr" />
      <Art {...art.sideVine} className="inv-card__vine" />

      <div className="inv-card__body">
        <Logo variant="monogram" decorative className="inv-card__mono inv-anim" />
        <blockquote className="inv-card__verse inv-anim">
          <p>“{inv.verse.text}”</p>
          <cite>
            — {inv.verse.reference} <span>({inv.verse.translation})</span>
          </cite>
        </blockquote>
        <Art {...art.fleuron} className="inv-card__fleuron inv-anim" />
        <h3 className="inv-card__title inv-anim">
          <span>{titleWords.join(' ')}</span> <span>{last}</span>
        </h3>
        <Art {...art.heartDivider} className="inv-card__heart inv-anim" />
        <p className="inv-card__invite inv-anim">{inv.invite}</p>

        <Person who={wedding.groom} k="groom" />
        <p className="inv-card__amp inv-anim" aria-label="and">
          <Art {...art.sprigL} className="inv-card__amp-sprig" />
          <span aria-hidden="true">&amp;</span>
          <Art {...art.sprigR} className="inv-card__amp-sprig" />
        </p>
        <Person who={wedding.bride} k="bride" />

        <figure className="inv-card__photo">
          <img
            src={asset(inv.photoSmall)}
            srcSet={`${asset(inv.photoSmall)} 438w, ${asset(inv.photo)} 877w`}
            sizes="(min-width: 760px) 380px, 80vw"
            alt={inv.photoAlt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            width={877}
            height={963}
          />
          <Art {...photoFlowers} className="inv-card__photo-flowers" />
        </figure>

        <div className="inv-card__events">
          {events.map((ev, i) => (
            <section key={ev.key} className={`inv-ev inv-ev--${ev.key} inv-anim`} aria-label={ev.title}>
              {i > 0 && <Art {...art.goldDivider} className="inv-ev__divider" />}
              <div className="inv-ev__inner">
                <Art {...ev.badge} className="inv-ev__badge" />
                <div className="inv-ev__text">
                  <h4 className="inv-ev__title">{ev.title}</h4>
                  <ul className="inv-ev__rows">
                    <li>
                      <Icon name="calendar" className="inv-ev__icon" />
                      <span>
                        {ev.date} <span className="inv-ev__sep" aria-hidden="true">|</span>
                        <span className="sr-only">,</span> {ev.weekday}
                      </span>
                    </li>
                    <li>
                      <Icon name="clock" className="inv-ev__icon" />
                      <span>{ev.time}</span>
                    </li>
                    <li>
                      <Icon name="pin" className="inv-ev__icon" />
                      <span>
                        <span className="inv-ev__venue">{ev.venue}</span>
                        {ev.place && <span className="inv-ev__place">{ev.place}</span>}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>

        <p className="inv-card__closing inv-anim">{inv.closing}</p>
        <Art {...art.heartDivider} className="inv-card__heart inv-card__heart--end inv-anim" />
      </div>
    </article>
  );
}

/** Directions and calendar links for each event, shown under the card. */
function InvitationLinks() {
  return (
    <div className="inv-links">
      {cardEvents().map((ev) => (
        <div key={ev.key} className="inv-links__group">
          <p className="inv-links__title">{ev.title}</p>
          <p className="inv-links__row">
            {ev.mapsUrl && (
              <a href={ev.mapsUrl} target="_blank" rel="noopener noreferrer">
                <Icon name="pin" /> Directions<span className="sr-only"> to {ev.venue} (opens Google Maps)</span>
              </a>
            )}
            <a href={googleCalendarUrl(ev.calendar)} target="_blank" rel="noopener noreferrer">
              <Icon name="calendar" /> Google Calendar<span className="sr-only"> for the {ev.title} (opens in a new tab)</span>
            </a>
            <button type="button" onClick={() => downloadICS(ev.calendar)}>
              <Icon name="download" /> Apple / Outlook<span className="sr-only"> calendar file for the {ev.title}</span>
            </button>
          </p>
        </div>
      ))}
    </div>
  );
}

/** Full-screen viewer: Escape or the × button closes it; focus is kept inside and restored. */
function InvitationViewer({ onClose, onPrint }: { onClose: () => void; onPrint: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  useScrollLock(true);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'Tab' && dialog.current) {
        const f = [...dialog.current.querySelectorAll<HTMLElement>('a[href], button')].filter((el) => el.offsetParent !== null);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={dialog}
      className="inv-viewer"
      role="dialog"
      aria-modal="true"
      aria-label="Wedding invitation, full view"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="inv-viewer__bar">
        <a className="inv-viewer__tool" href={asset(inv.pdf)} download>
          <Icon name="download" /> PDF
        </a>
        <button type="button" className="inv-viewer__tool" onClick={onPrint}>
          <PrintIcon /> Print
        </button>
        <button ref={closeBtn} type="button" className="inv-viewer__close" onClick={onClose}>
          <Icon name="close" />
          <span className="sr-only">Close invitation</span>
        </button>
      </div>
      <div className="inv-viewer__scroll" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="inv-wrap inv-wrap--viewer">
          <InvitationCard />
          <InvitationLinks />
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** "Our Wedding Invitation" section: animated preview, full view, print and downloads. */
export function WeddingInvitation() {
  const [viewing, setViewing] = useState(false);
  const [printing, setPrinting] = useState(false);

  const print = useCallback(() => setPrinting(true), []);

  // Render a clean copy of the card at the top level, print it, then remove it.
  useEffect(() => {
    if (!printing) return;
    const html = document.documentElement;
    html.classList.add('inv-printing');
    const done = () => {
      html.classList.remove('inv-printing');
      setPrinting(false);
    };
    window.addEventListener('afterprint', done, { once: true });
    let cancelled = false;
    const imgs = [...document.querySelectorAll<HTMLImageElement>('.inv-print img')];
    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      ...imgs.map((im) => (im.complete ? Promise.resolve() : new Promise((r) => ((im.onload = r), (im.onerror = r))))),
    ]);
    // Never wait more than 3 s for the photo.
    Promise.race([ready, new Promise((r) => window.setTimeout(r, 3000))]).then(() => {
      if (cancelled) return;
      window.print();
      // Some browsers never fire afterprint; tidy up anyway.
      window.setTimeout(done, 1000);
    });
    return () => {
      cancelled = true;
      window.removeEventListener('afterprint', done);
      html.classList.remove('inv-printing');
    };
  }, [printing]);

  return (
    <section id="invitation" className="section invitation" aria-labelledby="invitation-title">
      <Art {...art.cornerTL} className="corner corner--tl corner--soft" />
      <Art {...art.cornerBR} className="corner corner--br corner--soft" />
      <Reveal className="section__head">
        <Art {...art.bow} className="section__bow" />
        <h2 id="invitation-title" className="section__title">{inv.heading}</h2>
        <Art {...art.divider} className="divider" />
        <p className="section__lead section__lead--body">{inv.lead}</p>
      </Reveal>

      <Reveal className="invitation__stage" variant="fade">
        <span className="invitation__halo" aria-hidden="true" />
        <div className="inv-wrap inv-wrap--preview">
          <InvitationCard />
          <span className="invitation__shine" aria-hidden="true" />
        </div>
      </Reveal>
      <Reveal className="invitation__links" delay={100}>
        <InvitationLinks />
      </Reveal>

      <Reveal className="invitation__actions" delay={150}>
        <button type="button" className="btn btn--solid" onClick={() => setViewing(true)}>
          <Icon name="heart" /> View Full Invitation
        </button>
        <a className="btn btn--pill" href={asset(inv.pdf)} download>
          <Icon name="download" /> Download PDF
        </a>
        <a className="btn btn--pill" href={asset(inv.image)} download>
          <Icon name="download" /> Save Image
        </a>
        <button type="button" className="btn btn--pill" onClick={print}>
          <PrintIcon />
          Print
        </button>
      </Reveal>
      <p className="invitation__note">The PDF is print-ready (6 × 9 in); the image is ideal for sharing on WhatsApp.</p>

      {viewing && <InvitationViewer onClose={() => setViewing(false)} onPrint={print} />}
      {printing &&
        createPortal(
          <div className="inv-print" aria-hidden="true">
            <SvgDefs />
            <div className="inv-wrap inv-wrap--print">
              <InvitationCard eager />
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
