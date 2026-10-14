import { wedding } from '../config/wedding';
import { remaining } from '../lib/time';
import { asset } from '../lib/assets';
import { Art, art } from './Art';

const pad = (n: number) => String(n).padStart(2, '0');

/** Each digit re-mounts when it changes, which plays a soft "flip" (see .digit in CSS). */
function Digits({ value, min = 2 }: { value: number; min?: number }) {
  const s = String(value).padStart(min, '0');
  return (
    <span className="countdown__num">
      {s.split('').map((ch, i) => (
        <span key={`${s.length - i}-${ch}`} className="digit">
          {ch}
        </span>
      ))}
    </span>
  );
}

/** Live countdown to the ceremony — or, after it begins, the "forever began" message. */
export function Countdown({ nowMs }: { nowMs: number }) {
  const r = remaining(nowMs);

  if (r.done) return <AfterWedding />;

  const units = [
    { v: r.days, label: r.days === 1 ? 'Day' : 'Days', min: 1 },
    { v: r.hours, label: r.hours === 1 ? 'Hour' : 'Hours', min: 2 },
    { v: r.minutes, label: r.minutes === 1 ? 'Minute' : 'Minutes', min: 2 },
    { v: r.seconds, label: r.seconds === 1 ? 'Second' : 'Seconds', min: 2 },
  ];

  return (
    <div className="countdown">
      <p className="kicker countdown__heading">{wedding.countdown.heading}</p>
      {/* Visual tiles update every second; screen readers get a calmer summary. */}
      <ol className="countdown__tiles" aria-hidden="true">
        {units.map((u, i) => (
          <li key={i} className="countdown__tile">
            <Digits value={u.v} min={u.min} />
            <span className="countdown__unit">{u.label}</span>
          </li>
        ))}
      </ol>
      <p className="sr-only">
        {r.days} days, {pad(r.hours)} hours and {pad(r.minutes)} minutes until the wedding.
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
