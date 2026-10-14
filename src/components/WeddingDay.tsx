import { wedding } from '../config/wedding';
import { downloadICS, engagementEvent, googleCalendarUrl, weddingEvent, type CalEvent } from '../lib/calendar';
import { Art, art } from './Art';
import { Reveal } from './Reveal';
import { Icon, type IconName } from './Icon';

interface Row {
  icon: IconName;
  label: string;
  value: string;
  muted?: boolean;
}

interface CardProps {
  kind: 'primary' | 'secondary';
  ribbon: string;
  title: string;
  subtitle?: string;
  rows: Row[];
  mapsUrl?: string;
  event: CalEvent;
  delay?: number;
}

/** One premium event card: ribbon, florals, gold double border, staggered rows. */
function EventCard({ kind, ribbon, title, subtitle, rows, mapsUrl, event, delay = 0 }: CardProps) {
  const id = `event-${event.id}`;
  return (
    <Reveal as="article" className={`event-card event-card--${kind}`} variant="zoom" delay={delay} aria-labelledby={`${id}-title`}>
      <span className="event-card__frame" aria-hidden="true" />
      <Art {...(kind === 'primary' ? art.bouquet : art.bouquetAlt)} className="event-card__flowers" />
      <p className="event-card__ribbon">
        <span>{ribbon}</span>
      </p>
      <h3 id={`${id}-title`} className="event-card__title">{title}</h3>
      {subtitle && <p className="event-card__subtitle">{subtitle}</p>}
      <Art {...art.divider} className="event-card__divider" />

      <dl className="event-card__rows">
        {rows.map((r, i) => (
          <div key={r.label} className="event-row" style={{ ['--i' as string]: i }}>
            <dt>
              <span className="event-row__icon"><Icon name={r.icon} /></span>
              <span className="event-row__label">{r.label}</span>
            </dt>
            <dd className={r.muted ? 'event-row__value event-row__value--muted' : 'event-row__value'}>{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className="event-card__actions" style={{ ['--i' as string]: rows.length }}>
        {mapsUrl && (
          <a className="btn btn--solid event-card__btn" href={mapsUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="pin" /> Get Directions
            <span className="sr-only"> to the {event.id === 'wedding' ? 'wedding' : 'engagement'} venue (opens Google Maps in a new tab)</span>
          </a>
        )}
        <div className="event-card__cal">
          <button type="button" className="btn btn--pill event-card__btn" onClick={() => downloadICS(event)}>
            <Icon name="download" /> Apple / Outlook
            <span className="sr-only"> calendar file for the {event.id}</span>
          </button>
          <a className="btn btn--pill event-card__btn" href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
            <Icon name="calendar" /> Google Calendar
            <span className="sr-only"> for the {event.id} (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </Reveal>
  );
}

/** "Our Celebrations": the wedding ceremony (primary) and the engagement (secondary). */
export function WeddingDay() {
  const c = wedding.ceremony;
  const e = wedding.engagement;
  const engagementVenue = [e.venue, e.place].filter(Boolean).join(', ');

  return (
    <section id="wedding-day" className="section wedding-day" aria-labelledby="wedding-day-title">
      <Art {...art.cornerTR} className="corner corner--tr corner--soft" />
      <Art {...art.cornerBL} className="corner corner--bl corner--soft" />
      <Reveal className="section__head">
        <Art {...art.bow} className="section__bow" />
        <h2 id="wedding-day-title" className="section__title">Our Wedding Day</h2>
        <p className="section__lead">Join us as we celebrate</p>
        <Art {...art.divider} className="divider" />
      </Reveal>

      <div className={`events ${e.show ? 'events--two' : ''}`}>
        <EventCard
          kind="primary"
          ribbon="The Wedding"
          title="Holy Matrimony"
          subtitle={`${wedding.groom.full} & ${wedding.bride.full}`}
          rows={[
            { icon: 'calendar', label: 'Date', value: c.dateLabel },
            { icon: 'clock', label: 'Time', value: c.timeLabel },
            { icon: 'church', label: 'Venue', value: c.venue },
            { icon: 'pin', label: 'Location', value: `${c.town}, ${c.region}, ${c.country}` },
          ]}
          mapsUrl={c.mapsUrl}
          event={weddingEvent}
        />
        {e.show && (
          <EventCard
            kind="secondary"
            ribbon="Also celebrating"
            title={e.title}
            rows={[
              { icon: 'calendar', label: 'Date', value: e.dateLabel },
              { icon: 'clock', label: 'Time', value: e.timeLabel },
              { icon: 'pin', label: 'Venue', value: engagementVenue || e.venuePlaceholder, muted: !engagementVenue },
            ]}
            mapsUrl={e.mapsUrl || undefined}
            event={engagementEvent}
            delay={150}
          />
        )}
      </div>
    </section>
  );
}
