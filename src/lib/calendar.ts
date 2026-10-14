import { wedding } from '../config/wedding';

/** A calendar-ready event (built from src/config/wedding.ts). */
export interface CalEvent {
  id: string;
  title: string;
  startISO: string; // with offset, e.g. 2027-08-23T11:00:00+05:30
  timeZone: string;
  durationMinutes: number;
  location: string;
  details: string;
  fileName: string;
  reminder: string;
}

const c = wedding.ceremony;
const e = wedding.engagement;
const couple = `${wedding.groom.full} & ${wedding.bride.full}`;

export const eventTitle = `Wedding of ${couple}`;
export const eventLocation = `${c.venue}, ${c.town}, ${c.region}, ${c.country}`;
export const eventDetails = `Holy Matrimony of ${wedding.groom.full} and ${wedding.bride.full}.\n${c.dateLabel} · ${c.timeLabel}\n${eventLocation}\nDirections: ${c.mapsUrl}\nInvitation: ${wedding.siteUrl}`;

export const weddingEvent: CalEvent = {
  id: 'wedding',
  title: eventTitle,
  startISO: c.startISO,
  timeZone: c.timeZone,
  durationMinutes: c.durationMinutes,
  location: eventLocation,
  details: eventDetails,
  fileName: 'ayvon-aksa-wedding.ics',
  reminder: 'Ayvon & Aksa’s wedding is tomorrow',
};

const engagementLocation = [e.venue, e.place].filter(Boolean).join(', ');
export const engagementEvent: CalEvent = {
  id: 'engagement',
  title: `Engagement of ${couple}`,
  startISO: e.startISO,
  timeZone: e.timeZone,
  durationMinutes: e.durationMinutes,
  location: engagementLocation,
  details: `Engagement of ${wedding.groom.full} and ${wedding.bride.full}.\n${e.dateLabel} · ${e.timeLabel}\n${engagementLocation || e.venuePlaceholder}${e.mapsUrl ? `\nDirections: ${e.mapsUrl}` : ''}\nInvitation: ${wedding.siteUrl}`,
  fileName: 'ayvon-aksa-engagement.ics',
  reminder: 'Ayvon & Aksa’s engagement is tomorrow',
};

const pad = (n: number) => String(n).padStart(2, '0');
const stamp = (dt: Date) =>
  `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}Z`;
const wall = (dt: Date) =>
  `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}`;

/** UTC start/end plus local wall-clock strings, derived from the ISO offset. */
export function eventTimes(ev: CalEvent = weddingEvent) {
  const start = new Date(Date.parse(ev.startISO));
  const end = new Date(start.getTime() + ev.durationMinutes * 60_000);
  const m = ev.startISO.match(/([+-])(\d{2}):(\d{2})$/);
  const off = m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +m[3]) * 60_000 : 0;
  return { start, end, localStart: wall(new Date(start.getTime() + off)), localEnd: wall(new Date(end.getTime() + off)) };
}
/** Backwards-compatible name for the wedding ceremony. */
export const ceremonyTimes = () => eventTimes(weddingEvent);

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
const fold = (line: string) => {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ' ' + rest.slice(74);
  }
  out.push(rest);
  return out.join('\r\n');
};

/** RFC 5545 calendar file for one event. */
export function buildICS(dtStamp: Date = new Date(), ev: CalEvent = weddingEvent): string {
  const t = eventTimes(ev);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ayvon & Aksa//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    `TZID:${ev.timeZone}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0530',
    'TZOFFSETTO:+0530',
    'TZNAME:IST',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:ayvon-aksa-${ev.id}-${t.localStart}@${new URL(wedding.siteUrl).host}`,
    `DTSTAMP:${stamp(dtStamp)}`,
    `DTSTART;TZID=${ev.timeZone}:${t.localStart}`,
    `DTEND;TZID=${ev.timeZone}:${t.localEnd}`,
    `SUMMARY:${esc(ev.title)}`,
    ...(ev.location ? [`LOCATION:${esc(ev.location)}`] : []),
    `DESCRIPTION:${esc(ev.details)}`,
    `URL:${wedding.siteUrl}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(ev.reminder)}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

/** Google Calendar "add event" link (times in UTC, displayed in IST). */
export function googleCalendarUrl(ev: CalEvent = weddingEvent): string {
  const t = eventTimes(ev);
  const p = new URLSearchParams({ action: 'TEMPLATE', text: ev.title, dates: `${stamp(t.start)}/${stamp(t.end)}`, details: ev.details, ctz: ev.timeZone });
  if (ev.location) p.set('location', ev.location);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function downloadICS(ev: CalEvent = weddingEvent) {
  const blob = new Blob([buildICS(new Date(), ev)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = ev.fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
