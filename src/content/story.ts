/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  OUR LOVE STORY
 * ─────────────────────────────────────────────────────────────────────────────
 *  Written in Ayvon & Aksa's own words (from "From Kerala to Italy"),
 *  condensed into four short chapters.
 *
 *  • ADD a chapter     → copy one { … } block and paste it where it belongs.
 *  • EDIT a chapter    → change its text.
 *  • DELETE a chapter  → remove its { … } block.
 *  • REORDER           → move the blocks; the timeline follows array order.
 *
 *  Each chapter supports:
 *    title     (required)  heading of the chapter
 *    text      (required)  one or more paragraphs — use an array of strings
 *    date      (optional)  e.g. 'June 2024' — leave out if you prefer
 *    place     (optional)  e.g. 'Kochi' or 'Milan'
 *    image     (optional)  path under /public, e.g. 'images/story/coffee.webp'
 *    imageAlt  (optional)  describe the photo for screen readers
 *    caption   (optional)  small caption under the photo
 *    note      (optional)  a short personal line shown in script lettering
 *
 *  To return to the empty placeholder, set `chapters: []`.
 */

export interface StoryChapter {
  title: string;
  text: string[];
  date?: string;
  place?: string;
  image?: string;
  imageAlt?: string;
  caption?: string;
  note?: string;
}

export const story = {
  heading: 'Our Love Story',
  subheading: 'From Kerala to Italy',
  intro: 'A story we never planned, but God did.',

  /** Shown when `chapters` is empty. */
  placeholder: {
    line1: 'Every love story is beautiful, but ours is our favourite.',
    line2: 'Our story is waiting to be told.',
  },

  /** Illustrated version of the story, shown as a keepsake card ('' to hide). */
  illustration: {
    src: 'images/story/our-story-illustrated.webp',
    thumb: 'images/story/our-story-illustrated-thumb.webp',
    alt: 'An illustrated comic of Ayvon and Aksa’s story, from Kerala to Italy, in fourteen panels',
    label: 'Our story, illustrated',
  },

  closingQuote:
    'We were not looking for love — we simply agreed to meet. One meeting became our forever, and we can’t wait to spend a lifetime of love and laughter together.',

  chapters: [
    {
      title: 'Two Paths, One Proposal',
      place: 'Kerala & Italy',
      text: [
        'Ayvon was building his future in Kerala. Aksa was chasing her dreams in Italy. Neither of us was looking for marriage.',
        'Then our families shared a proposal, and we simply said, “Let’s just meet and see.”',
      ],
      note: 'Maybe someday… but not now.',
    },
    {
      title: 'The First Meeting',
      text: [
        'Our families met, and we saw each other for the first time — a little nervous, yet it felt so natural.',
        'The next day, a coffee for two became hours of conversation and laughter. Two days later, Aksa flew back to Italy.',
      ],
    },
    {
      title: 'Miles Apart, Hearts Together',
      text: [
        'Different countries, different time zones, one connection.',
        'Morning messages, video calls and talks until 2 AM — little by little, we fell in love without even realizing.',
      ],
    },
    {
      title: 'A Promise of Forever',
      date: '23 August 2027',
      text: [
        'Our families saw our happiness and, together, decided our future. No rush — just a promise of forever.',
        'From two strangers to soulmates, our forever begins on 23 August 2027.',
      ],
      note: 'To be continued…',
    },
  ] as StoryChapter[],
};
