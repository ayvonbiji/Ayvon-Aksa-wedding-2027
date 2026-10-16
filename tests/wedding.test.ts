import { describe, expect, it } from 'vitest';
import { wedding } from '../src/config/wedding';
import { CEREMONY_MS, remaining } from '../src/lib/time';
import { buildICS, ceremonyTimes, googleCalendarUrl, engagementEvent, eventTimes } from '../src/lib/calendar';
import { story } from '../src/content/story';
import { gallery } from '../src/content/gallery';
import fs from 'node:fs';
import path from 'node:path';

describe('wedding details', () => {
  it('has the confirmed names, date, time and venue', () => {
    expect(wedding.groom.full).toBe('Ayvon Joseph Biji');
    expect(wedding.bride.full).toBe('Aksa Saji Kunnel');
    expect(wedding.ceremony.dateLabel).toBe('Monday, 23 August 2027');
    expect(wedding.ceremony.timeLabel).toBe('11:00 AM IST');
    expect(wedding.ceremony.venue).toBe('St. Thomas Valiyapally');
    expect(`${wedding.ceremony.town}, ${wedding.ceremony.region}, ${wedding.ceremony.country}`).toBe('Ranni, Kerala, India');
  });

  it('ceremony is 23 Aug 2027 11:00 IST = 05:30 UTC, and it is a Monday', () => {
    expect(new Date(CEREMONY_MS).toISOString()).toBe('2027-08-23T05:30:00.000Z');
    const ist = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(CEREMONY_MS);
    expect(ist).toMatch(/Monday, 23 August 2027/);
    expect(ist).toMatch(/11:00\s?am/i);
  });

  it('site URL is absolute and ends with a slash', () => {
    expect(wedding.siteUrl).toMatch(/^https:\/\/.+\/$/);
  });
});

describe('countdown', () => {
  it('counts down correctly', () => {
    const r = remaining(CEREMONY_MS - ((2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000));
    expect(r).toEqual({ days: 2, hours: 3, minutes: 4, seconds: 5, done: false });
  });
  it('never goes negative and switches to done exactly at ceremony time', () => {
    expect(remaining(CEREMONY_MS - 1000).done).toBe(false);
    expect(remaining(CEREMONY_MS)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
    expect(remaining(CEREMONY_MS + 86400_000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  });
  it('is the same instant for visitors in any timezone (e.g. Italy, summer time)', () => {
    // 07:30 in Rome (CEST, UTC+2) on the wedding day = 11:00 IST
    expect(Date.parse('2027-08-23T07:30:00+02:00')).toBe(CEREMONY_MS);
  });
});

describe('calendar', () => {
  const ics = buildICS(new Date('2026-10-14T00:00:00Z'));
  it('creates exactly one event with IST start and end', () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain('DTSTART;TZID=Asia/Kolkata:20270823T110000');
    expect(ics).toContain('DTEND;TZID=Asia/Kolkata:20270823T130000');
    expect(ics).toContain('TZOFFSETTO:+0530');
    expect(ics).toContain('LOCATION:St. Thomas Valiyapally\\, Ranni\\, Kerala\\, India');
  });
  it('uses CRLF line endings and folds long lines', () => {
    expect(ics.includes('\r\n')).toBe(true);
    for (const line of ics.split('\r\n')) expect(line.length).toBeLessThanOrEqual(75);
  });
  it('google calendar link uses UTC times and the Kolkata zone', () => {
    const u = new URL(googleCalendarUrl());
    expect(u.searchParams.get('dates')).toBe('20270823T053000Z/20270823T073000Z');
    expect(u.searchParams.get('ctz')).toBe('Asia/Kolkata');
    expect(ceremonyTimes().localEnd).toBe('20270823T130000');
    expect(ceremonyTimes().localStart).toBe('20270823T110000');
  });
});

describe('content', () => {
  it('only the wedding and the engagement appear — no other functions', () => {
    const src = ['src', 'index.html'].flatMap((p) => walk(p)).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    expect(src).not.toMatch(/reception|mehndi|mylanchi|haldi|sangeet|betrothal|manasammatham/i);
  });
  it('story chapters and gallery photos are well formed', () => {
    for (const c of story.chapters) {
      expect(c.title).toBeTruthy();
      expect(c.text.length).toBeGreaterThan(0);
    }
    for (const p of gallery.photos) {
      expect(p.alt.length).toBeGreaterThan(10);
      if (!/^https?:/.test(p.src)) expect(fs.existsSync(path.join('public', p.src))).toBe(true);
      if (p.thumb) expect(fs.existsSync(path.join('public', p.thumb))).toBe(true);
    }
  });
});

function walk(p: string): string[] {
  const st = fs.statSync(p);
  if (st.isFile()) return [p];
  return fs.readdirSync(p).flatMap((f) => walk(path.join(p, f)));
}

describe('ceremony time', () => {
  it('no stale 11:30 time remains anywhere in the source', () => {
    const files = ['src', 'scripts', 'index.html', 'upload-memories', 'manage-memories', 'README.md'].flatMap((p) => walk(p));
    for (const f of files) expect(fs.readFileSync(f, 'utf8'), f).not.toMatch(/11[:.]30/);
  });
});

describe('engagement (secondary event)', () => {
  const e = wedding.engagement;
  it('is Wednesday, 18 August 2027 at 5:00 PM IST', () => {
    expect(new Date(Date.parse(e.startISO)).toISOString()).toBe('2027-08-18T11:30:00.000Z');
    const ist = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(Date.parse(e.startISO));
    expect(ist).toMatch(/Wednesday, 18 August 2027/);
    expect(ist).toMatch(/5:00\s?pm/i);
    expect(e.dateLabel).toBe('Wednesday, 18 August 2027');
    expect(e.timeLabel).toBe('5:00 PM IST');
  });
  it('uses the confirmed venue and a Google Maps link', () => {
    expect(e.venue).toBe("St. John's Knanaya Jacobite Church (Puthenpally)");
    expect(e.place).toBe('GG8F+GX8, SH 1, Chingavanam, Kerala 686531, India');
    expect(e.mapsUrl).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=St\.\+John%27s\+Knanaya\+Jacobite\+Church\+Puthenpally\+Chingavanam/);
  });
  it('has its own calendar event; the countdown still targets the wedding', () => {
    const ics = buildICS(new Date('2026-10-14T00:00:00Z'), engagementEvent);
    expect(ics).toContain('DTSTART;TZID=Asia/Kolkata:20270818T170000');
    expect(ics).toContain('DTEND;TZID=Asia/Kolkata:20270818T190000');
    expect(ics.replace(/\r\n /g, '')).toContain("LOCATION:St. John's Knanaya Jacobite Church (Puthenpally)\\, GG8F+GX8\\, SH 1\\, Chingavanam\\, Kerala 686531\\, India");
    expect(eventTimes(engagementEvent).localStart).toBe('20270818T170000');
    const g = new URL(googleCalendarUrl(engagementEvent)).searchParams;
    expect(g.get('dates')).toBe('20270818T113000Z/20270818T133000Z');
    expect(g.get('location')).toContain('Chingavanam');
    expect(new Date(CEREMONY_MS).toISOString()).toBe('2027-08-23T05:30:00.000Z');
  });
});

describe('wedding invitation card', () => {
  it('has both families with the correct spellings', () => {
    expect(wedding.groom).toMatchObject({ full: 'Ayvon Joseph Biji', relation: 'Son of', parents: 'Biji Joseph & Asha Kuriakose', house: 'Kadackal' });
    expect(wedding.bride).toMatchObject({ full: 'Aksa Saji Kunnel', relation: 'Daughter of', parents: 'Sajimon Kurian Kunnel & Anjumole Mathew', house: 'Kunnel' });
  });
  it('quotes Job 23:14 (GNT) as verified', () => {
    expect(wedding.invitation.verse).toEqual({ text: 'He will fulfill what he has planned for me.', reference: 'Job 23:14', translation: 'GNT' });
  });
  it('keeps the event times: engagement 5:00 PM, wedding 11:00 AM IST', () => {
    expect(wedding.engagement.startISO).toBe('2027-08-18T17:00:00+05:30');
    expect(wedding.ceremony.startISO).toBe('2027-08-23T11:00:00+05:30');
    expect(wedding.ceremony.timeLabel).toBe('11:00 AM IST');
  });
  it('has the photo and generated downloads in /public', () => {
    for (const f of [wedding.invitation.photo, wedding.invitation.photoSmall, wedding.invitation.pdf, wedding.invitation.image]) {
      const file = path.join(__dirname, '..', 'public', f);
      expect(fs.existsSync(file), f).toBe(true);
      expect(fs.statSync(file).size).toBeGreaterThan(10_000);
    }
    const pdf = fs.readFileSync(path.join(__dirname, '..', 'public', wedding.invitation.pdf));
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  });
});
