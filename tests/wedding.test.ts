import { describe, expect, it } from 'vitest';
import { wedding } from '../src/config/wedding';
import { CEREMONY_MS, remaining } from '../src/lib/time';
import { buildICS, ceremonyTimes, googleCalendarUrl } from '../src/lib/calendar';
import { story } from '../src/content/story';
import { gallery } from '../src/content/gallery';
import fs from 'node:fs';
import path from 'node:path';

describe('wedding details', () => {
  it('has the confirmed names, date, time and venue', () => {
    expect(wedding.groom.full).toBe('Ayvon Joseph Biji');
    expect(wedding.bride.full).toBe('Aksa Saji Kunnel');
    expect(wedding.ceremony.dateLabel).toBe('Monday, 23 August 2027');
    expect(wedding.ceremony.timeLabel).toBe('11:30 AM IST');
    expect(wedding.ceremony.venue).toBe('St. Thomas Valiyapally');
    expect(`${wedding.ceremony.town}, ${wedding.ceremony.region}, ${wedding.ceremony.country}`).toBe('Ranni, Kerala, India');
  });

  it('ceremony is 23 Aug 2027 11:30 IST = 06:00 UTC, and it is a Monday', () => {
    expect(new Date(CEREMONY_MS).toISOString()).toBe('2027-08-23T06:00:00.000Z');
    const ist = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(CEREMONY_MS);
    expect(ist).toMatch(/Monday, 23 August 2027/);
    expect(ist).toMatch(/11:30\s?am/i);
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
    // 08:00 in Rome (CEST, UTC+2) on the wedding day = 11:30 IST
    expect(Date.parse('2027-08-23T08:00:00+02:00')).toBe(CEREMONY_MS);
  });
});

describe('calendar', () => {
  const ics = buildICS(new Date('2026-10-14T00:00:00Z'));
  it('creates exactly one event with IST start and end', () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain('DTSTART;TZID=Asia/Kolkata:20270823T113000');
    expect(ics).toContain('DTEND;TZID=Asia/Kolkata:20270823T133000');
    expect(ics).toContain('TZOFFSETTO:+0530');
    expect(ics).toContain('LOCATION:St. Thomas Valiyapally\\, Ranni\\, Kerala\\, India');
  });
  it('uses CRLF line endings and folds long lines', () => {
    expect(ics.includes('\r\n')).toBe(true);
    for (const line of ics.split('\r\n')) expect(line.length).toBeLessThanOrEqual(75);
  });
  it('google calendar link uses UTC times and the Kolkata zone', () => {
    const u = new URL(googleCalendarUrl());
    expect(u.searchParams.get('dates')).toBe('20270823T060000Z/20270823T080000Z');
    expect(u.searchParams.get('ctz')).toBe('Asia/Kolkata');
    expect(ceremonyTimes().localEnd).toBe('20270823T133000');
  });
});

describe('content', () => {
  it('only one event exists — no other ceremonies mentioned in source', () => {
    const src = ['src', 'index.html'].flatMap((p) => walk(p)).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    expect(src).not.toMatch(/engagement|reception|mehndi|haldi|sangeet|betrothal|manasammatham/i);
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
