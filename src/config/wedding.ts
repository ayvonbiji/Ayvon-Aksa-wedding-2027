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
  groom: {
    first: 'Ayvon',
    full: 'Ayvon Joseph Biji',
    relation: 'Son of',
    parents: 'Biji Joseph & Asha Kuriakose',
    house: 'Kadackal',
  },
  bride: {
    first: 'Aksa',
    full: 'Aksa Saji Kunnel',
    relation: 'Daughter of',
    parents: 'Sajimon Kurian Kunnel & Anjumole Mathew',
    house: 'Kunnel',
  },

  /* ── The ceremony (the ONLY event on the site) ──────────────────────────── */
  ceremony: {
    /** Exact start with the India Standard Time offset. Do not drop "+05:30". */
    startISO: '2027-08-23T11:00:00+05:30',
    /** IANA timezone used for the calendar file and Google Calendar. */
    timeZone: 'Asia/Kolkata',
    /** Ceremony length in minutes (used for calendar end time). */
    durationMinutes: 120,
    dateLabel: 'Monday, 23 August 2027',
    shortDateLabel: '23 August 2027',
    numericDateLabel: '23 · 08 · 2027',
    timeLabel: '11:00 AM IST',
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

  /* ── Engagement (secondary event) ───────────────────────────────────────── */
  engagement: {
    show: true,
    title: 'Engagement',
    startISO: '2027-08-18T17:00:00+05:30',
    timeZone: 'Asia/Kolkata',
    durationMinutes: 120,
    dateLabel: 'Wednesday, 18 August 2027',
    shortDateLabel: '18 August 2027',
    timeLabel: '5:00 PM IST',
    /** Confirmed venue. Leave venue/place empty to show `venuePlaceholder` and hide Directions. */
    venue: "St. John's Knanaya Jacobite Church (Puthenpally)",
    place: 'GG8F+GX8, SH 1, Chingavanam, Kerala 686531, India',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=St.+John%27s+Knanaya+Jacobite+Church+Puthenpally+Chingavanam+Kerala',
    venuePlaceholder: 'Venue to be announced',
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
    themeColor: '#6B1E33',
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

  /* ── Wedding invitation card ("Our Wedding Invitation" section) ─────────── */
  /**
   * Text printed on the invitation card. Names, parents, house names, dates,
   * times and venues come from groom/bride/engagement/ceremony above.
   * After editing, run `npm run build` (or `npm run build:docs`) so the
   * downloadable PDF and image are regenerated too.
   */
  invitation: {
    heading: 'Our Wedding Invitation',
    lead: 'With joyful hearts, we invite you to bless our union.',
    /**
     * Job 23:14, first half, Good News Translation (GNT) — wording checked
     * against the GNT text. Short quotations are permitted with attribution.
     */
    verse: { text: 'He will fulfill what he has planned for me.', reference: 'Job 23:14', translation: 'GNT' },
    title: 'We’re getting married',
    invite: 'Together with our families, we joyfully invite you to celebrate the beginning of our new journey together.',
    closing: 'Your presence will make our celebration more special',
    /** Background-removed couple photo (relative to /public). */
    photo: 'images/invitation/couple-cutout.webp',
    photoSmall: 'images/invitation/couple-cutout-small.webp',
    photoAlt: 'Aksa in a red embroidered outfit and Ayvon in a maroon shirt, smiling together',
    /** Generated by `npm run assets` (part of every build). */
    pdf: 'downloads/ayvon-aksa-wedding-invitation.pdf',
    image: 'downloads/ayvon-aksa-wedding-invitation.jpg',
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

  /* ── Guest photo uploads — "Our Wedding Memories" ───────────────────────── */
  memories: {
    /**
     * Supabase project (see README → "Guest photo uploads").
     * The anon/public key is DESIGNED to be public — security comes from the
     * database rules in supabase/migrations. NEVER put the service_role key here.
     * Leave empty to show a friendly "opening soon" message instead.
     * (Environment variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY override these.)
     */
    supabaseUrl: '',
    supabaseAnonKey: '',
    bucket: 'wedding-memories',
    /** Path of the upload page, relative to siteUrl. */
    uploadPath: 'upload-memories/',
    /** Path of the private owner page, relative to siteUrl. */
    managePath: 'manage-memories/',

    heading: 'Our Wedding Memories',
    emptyMessage:
      'Help us collect the moments that make our wedding unforgettable. Scan our QR code and share your photographs with us.',
    uploadTitle: 'Our Wedding Memories',
    uploadSubtitle: 'Share your favourite moments from our wedding with Ayvon & Aksa.',
    uploadHeading: 'Capture the Love, Share the Memories',
    uploadMessage:
      'Every photograph tells a story. Share your favourite moments from our wedding and help us keep these memories forever.',
    privacyNotice:
      'Photos you share are reviewed by Ayvon & Aksa before they appear in "Our Wedding Memories" on this website, where anyone with the link can see them. Your name and caption are shown only if you tick the box to show them. Location and camera data are removed from your photos before upload. To have a photo removed, use "Remove" on this device, or contact Ayvon & Aksa.',

    /** Client-side limits (the database enforces its own limits too). */
    maxFilesPerBatch: 20,
    maxInputMB: 30,
    /** Photos are resized to this many pixels on the long edge and re-saved as JPEG. */
    maxDimension: 2560,
    jpegQuality: 0.86,
    /** Must not exceed max_bytes in the database (10 MB by default). */
    maxStoredMB: 10,
    /** Public gallery: photos per page and auto-refresh interval. */
    pageSize: 24,
    refreshSeconds: 60,
  },

  /* ── Effects ────────────────────────────────────────────────────────────── */
  effects: {
    /** Gentle falling petals (automatically off for reduced-motion users). */
    petals: true,
    petalCount: 10,
  },
} as const;

export type Wedding = typeof wedding;
