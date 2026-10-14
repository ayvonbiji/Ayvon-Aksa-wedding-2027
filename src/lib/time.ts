import { wedding } from '../config/wedding';

/**
 * The ceremony instant as a UTC timestamp. The ISO string carries the
 * +05:30 India Standard Time offset, so this is the same moment for every
 * visitor regardless of their own timezone or daylight-saving rules
 * (India does not observe daylight saving).
 */
export const CEREMONY_MS = Date.parse(wedding.ceremony.startISO);

export interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

/** Time left until `target`, never negative. */
export function remaining(nowMs: number, targetMs: number = CEREMONY_MS): Remaining {
  const diff = Math.max(0, targetMs - nowMs);
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: diff === 0,
  };
}

/**
 * Current time, with an optional preview override for testing:
 *   ?now=2027-08-23T11:31:00+05:30   (shows the post-wedding view)
 * Encode "+" as %2B if your browser drops it.
 */
let offset: number | null = null;
export function now(): number {
  if (offset === null) {
    offset = 0;
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('now');
      if (p) {
        const t = Date.parse(p.replace(' ', '+'));
        if (!Number.isNaN(t)) offset = t - Date.now();
      }
    }
  }
  return Date.now() + offset;
}
