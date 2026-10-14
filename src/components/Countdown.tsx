import { wedding } from '../config/wedding';
import { remaining } from '../lib/time';
import { asset } from '../lib/assets';
import { Art, art } from './Art';

const pad = (n: number) => String(n).padStart(2, '0');

/** Live countdown — or, after the ceremony, the "forever began" message. */
export function Countdown({ nowMs }: { nowMs: number }) {
  const r = remaining(nowMs);

  if (r.done) return <AfterWedding />;

  const units = [
    { v: r.days, label: r.days === 1 ? 'Day' : 'Days' },
    { v: r.hours, label: r.hours === 1 ? 'Hour' : 'Hours' },
    { v: r.minutes, label: r.minutes === 1 ? 'Minute' : 'Minutes' },
    { v: r.seconds, label: r.seconds === 1 ? 'Second' : 'Seconds' },
  ];

  return (
    <div className="countdown">
      <p className="label countdown__heading">{wedding.countdown.heading}</p>
      {/* The visual tiles update every second; screen readers get a calmer summary. */}
      <ol className="countdown__tiles" aria-hidden="true">
        {units.map((u, i) => (
          <li key={i} className="countdown__tile">
            <span className="countdown__num">{i === 0 ? u.v : pad(u.v)}</span>
            <span className="countdown__unit">{u.label}</span>
          </li>
        ))}
      </ol>
      <p className="sr-only">
        {r.days} days and {r.hours} hours until the wedding.
      </p>
    </div>
  );
}

export function AfterWedding() {
  const c = wedding.countdown;
  return (
    <div className="after" role="status">
      <Art {...art.bow} className="after__bow" />
      <p className="after__message">{c.afterMessage}</p>
      <p className="after__sub">{c.afterSubtext}</p>
      <figure className="after__photo arch">
        {c.afterPhoto ? (
          <img src={asset(c.afterPhoto)} alt={c.afterPhotoAlt} loading="lazy" decoding="async" />
        ) : (
          <div className="placeholder" role="img" aria-label="Wedding photograph coming soon">
            <Art {...art.bouquet} className="placeholder__art" />
            <span>Our wedding photograph will appear here</span>
          </div>
        )}
      </figure>
    </div>
  );
}
