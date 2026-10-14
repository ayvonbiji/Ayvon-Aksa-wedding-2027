/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  WEDDING CONFIGURATION — the single source of truth for the website.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Edit the values below; every section, the calendar file, the share message,
 *  the QR code and the social-sharing tags read from here.
 *
 *  This file must stay dependency-free (no imports): the build scripts in
 *  /scripts read it directly with Node.
 */

export const wedding = {
  /* ── The couple ─────────────────────────────────────────────────────────── */
  groom: { first: 'Ayvon', full: 'Ayvon Joseph Biji' },
  bride: { first: 'Aksa', full: 'Aksa Saji Kunnel' },

  /* ── The ceremony (the ONLY event on the site) ──────────────────────────── */
  ceremony: {
    /** Exact start with the India Standard Time offset. Do not drop "+05:30". */
    startISO: '2027-08-23T11:30:00+05:30',
    /** IANA timezone used for the calendar file and Google Calendar. */
    timeZone: 'Asia/Kolkata',
    /** Ceremony length in minutes (used for calendar end time). */
    durationMinutes: 120,
    dateLabel: 'Monday, 23 August 2027',
    shortDateLabel: '23 August 2027',
    numericDateLabel: '23 · 08 · 2027',
    timeLabel: '11:30 AM IST',
    venue: 'St. Thomas Valiyapally',
    town: 'Ranni',
    region: 'Kerala',
    country: 'India',
    /**
     * Google Maps link. The church is listed by the Ranni-Angadi Grama
     * Panchayat but no verified coordinates were available, so this uses a
     * place search. Replace with a "Share → Copy link" URL from Google Maps
     * once you have pinned the exact church entrance.
     */
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=St.+Thomas+Valiyapally%2C+Ranni%2C+Kerala%2C+India',
  },

  /* ── Public website address ─────────────────────────────────────────────── */
  /**
   * The live URL of the site — used for sharing, the QR code, canonical and
   * Open Graph tags. Must end with "/".
   * Default = this repository's GitHub Pages address. If you move to a custom
   * domain, change it here, then run `npm run assets` to regenerate the QR code.
   */
  siteUrl: 'https://ayvonbiji.github.io/Ayvon-Aksa-wedding-2027/',

  /* ── Metadata & sharing ─────────────────────────────────────────────────── */
  meta: {
    title: 'Ayvon & Aksa | Our Wedding Invitation',
    description:
      'Join Ayvon Joseph Biji and Aksa Saji Kunnel as they begin their new chapter together on 23 August 2027.',
    /** Social preview image, relative to /public. 1200×630 px. */
    ogImage: 'og-image.png',
    themeColor: '#F6EDE2',
  },
  share: {
    /** "{url}" is replaced with siteUrl. */
    message:
      "You're invited to celebrate the wedding of Ayvon Joseph Biji and Aksa Saji Kunnel on 23 August 2027. Visit our wedding invitation: {url}",
  },

  /* ── Invitation cover & hero ────────────────────────────────────────────── */
  cover: {
    kicker: 'Wedding Celebration',
    button: 'Open Invitation',
  },
  hero: {
    eyebrow: 'Together with our families',
    invite: 'Together with our families, we invite you to celebrate our wedding.',
    /** Couple photo (relative to /public). Set to '' to show the placeholder. */
    photo: 'images/gallery/ayvon-aksa-01.webp',
    photoAlt: 'Ayvon and Aksa smiling together',
    /** CSS object-position for cropping the hero photo. */
    photoPosition: '50% 30%',
    button: 'Explore Our Wedding',
  },

  /* ── Countdown & after the wedding ──────────────────────────────────────── */
  countdown: {
    heading: 'Counting down to forever',
    /** Shown in place of the countdown once the ceremony time has passed. */
    afterMessage: 'Today, our forever began.',
    afterSubtext: 'Thank you for being part of our story.',
    /** Optional wedding-day photo to show after the ceremony ('' = placeholder). */
    afterPhoto: '',
    afterPhotoAlt: 'Ayvon and Aksa on their wedding day',
  },

  /* ── Dear Guest note & footer ───────────────────────────────────────────── */
  guestNote: {
    title: 'Dear Guest',
    text: 'Your presence and your prayers would mean the world to us as we begin this new chapter together.',
  },
  footer: {
    signOff: 'With love, Ayvon & Aksa',
    tagline: 'Forever begins here.',
  },

  /* ── Bible verse (King James Version — public domain) ───────────────────── */
  verse: {
    text: 'What therefore God hath joined together, let not man put asunder.',
    reference: 'Mark 10:9',
    translation: 'KJV',
  },

  /* ── Background music ───────────────────────────────────────────────────── */
  music: {
    enabled: true,
    /**
     * Path relative to /public. The bundled track is an original synthesised
     * music-box arrangement of Pachelbel's Canon in D (composition in the
     * public domain; the recording was generated for this site), so it is free
     * to use. Replace with any track you hold a licence for.
     */
    src: 'audio/canon-in-d-music-box.mp3',
    title: 'Canon in D — music box',
    volume: 0.45,
  },

  /* ── Effects ────────────────────────────────────────────────────────────── */
  effects: {
    /** Gentle falling petals (automatically off for reduced-motion users). */
    petals: true,
    petalCount: 10,
  },
} as const;

export type Wedding = typeof wedding;
