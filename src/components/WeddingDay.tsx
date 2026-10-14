import { wedding } from '../config/wedding';
import { downloadICS, googleCalendarUrl } from '../lib/calendar';
import { Art, art } from './Art';
import { Reveal } from './Reveal';
import { Icon } from './Icon';

/** The one and only event: the wedding ceremony. */
export function WeddingDay() {
  const c = wedding.ceremony;
  const rows = [
    { icon: 'calendar' as const, label: 'Date', value: c.dateLabel },
    { icon: 'clock' as const, label: 'Time', value: c.timeLabel },
    { icon: 'church' as const, label: 'Venue', value: c.venue },
    { icon: 'pin' as const, label: 'Location', value: `${c.town}, ${c.region}, ${c.country}` },
  ];

  return (
    <section id="wedding-day" className="section wedding-day" aria-labelledby="wedding-day-title">
      <Art {...art.cornerTR} className="corner corner--tr corner--soft" />
      <Art {...art.cornerBL} className="corner corner--bl corner--soft" />
      <Reveal className="section__head">
        <Art {...art.bow} className="section__bow" />
        <h2 id="wedding-day-title" className="section__title">Our Wedding Day</h2>
        <p className="section__lead">Holy Matrimony</p>
        <Art {...art.divider} className="divider" />
      </Reveal>

      <Reveal className="details-card" delay={100}>
        <Art {...art.bouquet} className="details-card__flowers" />
        <dl className="details-card__list">
          {rows.map((r) => (
            <div key={r.label} className="details-card__row">
              <dt>
                <Icon name={r.icon} />
                <span className="label">{r.label}</span>
              </dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>

        <div className="details-card__actions">
          <a className="btn btn--pill" href={c.mapsUrl} target="_blank" rel="noopener noreferrer">
            <Icon name="pin" /> Get Directions
            <span className="sr-only"> (opens Google Maps in a new tab)</span>
          </a>
        </div>

        <div className="calendar">
          <p className="label calendar__label">Add to Calendar</p>
          <div className="calendar__buttons">
            <button type="button" className="btn btn--ghost" onClick={downloadICS}>
              <Icon name="download" /> Apple / Outlook (.ics)
            </button>
            <a className="btn btn--ghost" href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer">
              <Icon name="calendar" /> Google Calendar
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
