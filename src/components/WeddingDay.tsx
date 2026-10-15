import { wedding } from '../config/wedding';
import { downloadICS, engagementEvent, googleCalendarUrl, weddingEvent, type CalEvent } from '../lib/calendar';
import { Art, art } from './Art';
import { Reveal } from './Reveal';
import { Icon, type IconName } from './Icon';
import { Ambience } from './Ambience';

interface Row {
  icon: IconName;
  label: string;
  value: string;
  muted?: boolean;
  small?: boolean;
}

interface EventData {
  key: 'engagement' | 'wedding';
  category: string;
  title: string;
  rows: Row[];
  mapsUrl?: string;
  venueLabel: string;
  calendar: CalEvent;
}

const couple = `${wedding.groom.full} & ${wedding.bride.full}`;

/** The two celebrations, in display order: engagement first, then the wedding. */
function events(): EventData[] {
  const e = wedding.engagement;
  const c = wedding.ceremony;
  const list: EventData[] = [];
  if (e.show) {
    list.push({
      key: 'engagement',
      category: 'The Engagement',
      title: e.title,
      rows: [
        { icon: 'calendar', label: 'Date', value: e.dateLabel },
        { icon: 'clock', label: 'Time', value: e.timeLabel },
        { icon: 'church', label: 'Venue', value: e.venue || e.venuePlaceholder, muted: !e.venue },
        ...(e.place ? [{ icon: 'pin' as const, label: 'Location', value: e.place, small: true }] : []),
      ],
      mapsUrl: e.venue && e.mapsUrl ? e.mapsUrl : undefined,
      venueLabel: e.venue || 'engagement venue',
      calendar: engagementEvent,
    });
  }
  list.push({
    key: 'wedding',
    category: 'The Wedding',
    title: 'Holy Matrimony',
    rows: [
      { icon: 'calendar', label: 'Date', value: c.dateLabel },
      { icon: 'clock', label: 'Time', value: c.timeLabel },
      { icon: 'church', label: 'Venue', value: c.venue },
      { icon: 'pin', label: 'Location', value: `${c.town}, ${c.region}, ${c.country}`, small: true },
    ],
    mapsUrl: c.mapsUrl,
    venueLabel: c.venue,
    calendar: weddingEvent,
  });
  return list;
}

/** One event card — identical structure and styling for every event. */
function EventCard({ ev, index }: { ev: EventData; index: number }) {
  const id = `event-${ev.key}`;
  let step = 0; // stagger counter for the inner reveal
  const s = () => ({ ['--i' as string]: step++ });
  return (
    <Reveal
      as="article"
      className={`event-card event-card--${ev.key}`}
      variant="up"
      delay={300 + index * 220}
      aria-labelledby={`${id}-title`}
    >
      <span className="event-card__light" aria-hidden="true" />
      <span className="event-card__frame" aria-hidden="true" />
      <Art {...art.goldCorner} className="event-card__corner event-card__corner--tl" />
      <Art {...art.goldCorner} className="event-card__corner event-card__corner--tr" />
      <Art {...art.goldCorner} className="event-card__corner event-card__corner--bl" />
      <Art {...art.goldCorner} className="event-card__corner event-card__corner--br" />
      <Art {...art.sideVine} className="event-card__vine event-card__vine--l" />
      <Art {...art.sideVine} className="event-card__vine event-card__vine--r" />
      <Art {...art.roseSpray} className="event-card__flowers" />

      <header className="event-card__head">
        <p className="event-card__ribbon stagger" style={s()}>
          <span>{ev.category}</span>
        </p>
        <h3 id={`${id}-title`} className="event-card__title stagger" style={s()}>
          {ev.title}
        </h3>
        <p className="event-card__subtitle stagger" style={s()}>{couple}</p>
        <Art {...art.heartDivider} className="event-card__divider stagger" style={s()} />
      </header>

      <dl className="event-card__rows">
        {ev.rows.map((r) => (
          <div key={r.label} className="event-row stagger" style={s()}>
            <dt>
              <span className="event-row__icon"><Icon name={r.icon} /></span>
              <span className="event-row__label">{r.label}</span>
            </dt>
            <dd className={`event-row__value${r.muted ? ' event-row__value--muted' : ''}${r.small ? ' event-row__value--small' : ''}`}>{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className="event-card__actions stagger" style={s()}>
        {ev.mapsUrl && (
          <a className="btn btn--solid event-card__btn event-card__directions" href={ev.mapsUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="pin" /> Get Directions
            <span className="sr-only"> to {ev.venueLabel} (opens Google Maps in a new tab)</span>
          </a>
        )}
        <div className="event-card__cal">
          <button type="button" className="btn btn--pill event-card__btn" onClick={() => downloadICS(ev.calendar)}>
            <Icon name="download" /> Apple / Outlook
            <span className="sr-only"> calendar file for the {ev.key}</span>
          </button>
          <a className="btn btn--pill event-card__btn" href={googleCalendarUrl(ev.calendar)} target="_blank" rel="noopener noreferrer">
            <Icon name="calendar" /> Google Calendar
            <span className="sr-only"> for the {ev.key} (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </Reveal>
  );
}

/** "Our Special Days": the engagement and the wedding ceremony as matching cards. */
export function WeddingDay() {
  const list = events();
  return (
    <section id="wedding-day" className="section wedding-day" aria-labelledby="wedding-day-title">
      <Reveal className="wedding-day__bg" variant="fade" aria-hidden="true">
        <span className="wedding-day__spot" />
        <span className="wedding-day__arch wedding-day__arch--l" />
        <span className="wedding-day__arch wedding-day__arch--r" />
      </Reveal>
      <Ambience petals={9} sparks={18} bokeh={6} seed={40} />
      <Art {...art.roseCorner} className="wd-roses wd-roses--tl" />
      <Art {...art.roseCorner} className="wd-roses wd-roses--tr" />
      <Art {...art.roseCorner} className="wd-roses wd-roses--bl" />
      <Art {...art.roseCorner} className="wd-roses wd-roses--br" />
      <Reveal className="section__head wedding-day__head" delay={150}>
        <Art {...art.fleuron} className="wedding-day__fleuron" />
        <h2 id="wedding-day-title" className="section__title">Our Special Days</h2>
        <p className="section__lead">Love is all we celebrate</p>
        <Art {...art.goldDivider} className="wedding-day__divider" />
      </Reveal>

      <div className={`events events--${list.length}`}>
        {list.map((ev, i) => (
          <EventCard key={ev.key} ev={ev} index={i} />
        ))}
      </div>
    </section>
  );
}
