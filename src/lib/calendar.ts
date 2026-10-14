import { wedding } from '../config/wedding';

const c = wedding.ceremony;

/** "2027-08-23T11:30:00+05:30" → local wall-clock parts in the ceremony timezone. */
function localParts(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) throw new Error(`Invalid ceremony date: ${iso}`);
  return { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5], s: +(m[6] ?? 0) };
}

const pad = (n: number) => String(n).padStart(2, '0');
const stamp = (dt: Date) =>
  `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}Z`;

export function ceremonyTimes() {
  const start = new Date(Date.parse(c.startISO));
  const end = new Date(start.getTime() + c.durationMinutes * 60_000);
  // Local wall-clock end, computed from the IST offset in the ISO string.
  const offMatch = c.startISO.match(/([+-])(\d{2}):(\d{2})$/);
  const offMin = offMatch ? (offMatch[1] === '-' ? -1 : 1) * (+offMatch[2] * 60 + +offMatch[3]) : 0;
  const endLocal = new Date(end.getTime() + offMin * 60_000);
  const s = localParts(c.startISO);
  return {
    start,
    end,
    localStart: `${s.y}${pad(s.mo)}${pad(s.d)}T${pad(s.h)}${pad(s.mi)}${pad(s.s)}`,
    localEnd: `${endLocal.getUTCFullYear()}${pad(endLocal.getUTCMonth() + 1)}${pad(endLocal.getUTCDate())}T${pad(endLocal.getUTCHours())}${pad(endLocal.getUTCMinutes())}${pad(endLocal.getUTCSeconds())}`,
  };
}

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/** Fold long lines to 75 octets as required by RFC 5545. */
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

export const eventTitle = `Wedding of ${wedding.groom.full} & ${wedding.bride.full}`;
export const eventLocation = `${c.venue}, ${c.town}, ${c.region}, ${c.country}`;
export const eventDetails = `Holy Matrimony of ${wedding.groom.full} and ${wedding.bride.full}.\n${c.dateLabel} · ${c.timeLabel}\n${eventLocation}\nDirections: ${c.mapsUrl}\nInvitation: ${wedding.siteUrl}`;

/** RFC 5545 calendar file for the wedding ceremony only. */
export function buildICS(dtStamp: Date = new Date()): string {
  const t = ceremonyTimes();
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ayvon & Aksa//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    `TZID:${c.timeZone}`,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0530',
    'TZOFFSETTO:+0530',
    'TZNAME:IST',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:ayvon-aksa-wedding-${t.localStart}@${new URL(wedding.siteUrl).host}`,
    `DTSTAMP:${stamp(dtStamp)}`,
    `DTSTART;TZID=${c.timeZone}:${t.localStart}`,
    `DTEND;TZID=${c.timeZone}:${t.localEnd}`,
    `SUMMARY:${esc(eventTitle)}`,
    `LOCATION:${esc(eventLocation)}`,
    `DESCRIPTION:${esc(eventDetails)}`,
    `URL:${wedding.siteUrl}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Ayvon & Aksa’s wedding is tomorrow',
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

/** Google Calendar "add event" link (times in UTC, displayed in IST). */
export function googleCalendarUrl(): string {
  const t = ceremonyTimes();
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle,
    dates: `${stamp(t.start)}/${stamp(t.end)}`,
    details: eventDetails,
    location: eventLocation,
    ctz: c.timeZone,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

export function downloadICS() {
  const blob = new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ayvon-aksa-wedding.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
