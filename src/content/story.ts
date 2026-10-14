/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  OUR LOVE STORY
 * ─────────────────────────────────────────────────────────────────────────────
 *  Written in Ayvon & Aksa's own words (from "From Kerala to Italy").
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
    'We were not looking for love. We simply agreed to meet. One coffee date became countless conversations. One meeting became our forever.',

  chapters: [
    {
      title: 'Not Looking for Marriage',
      place: 'Kerala',
      text: ['Ayvon was focused on his future and career in Kerala. Marriage was not in his plans.'],
      note: 'Maybe someday… but not now.',
    },
    {
      title: 'A Proposal Arrives',
      text: ['One day, both families brought up a marriage proposal.', 'Just one line… “Let’s just meet and see.”'],
    },
    {
      title: 'Her Side',
      place: 'Italy',
      text: ['In Italy, Aksa was living her life, chasing her dreams. Marriage wasn’t on her mind either.'],
      note: 'Not now… I have so much to do.',
    },
    {
      title: 'The First Meeting',
      text: ['Our families met and we saw each other for the first time.', 'A little nervous… but the conversation felt so natural.'],
    },
    {
      title: 'The Coffee Date',
      text: [
        'The next day, her family couldn’t visit our home. So we met outside. Just the two of us.',
        'A coffee date that turned into hours of conversations and laughter.',
      ],
    },
    {
      title: 'The Goodbye',
      text: ['After two days, it was time for Aksa to return to Italy.', 'Goodbyes are never easy.'],
    },
    {
      title: 'Kerala & Italy',
      text: ['Different countries. Different time zones. One connection.'],
    },
    {
      title: 'Long Talks, Late Nights',
      text: ['Morning messages, video calls, late-night chats…', 'Some nights until 2 AM, sometimes even later.'],
    },
    {
      title: 'Growing Closer',
      text: ['Day by day, call by call, we became a part of each other’s lives.', 'Little by little, we fell in love without even realizing.'],
    },
    {
      title: 'Families Decide',
      text: ['Our families saw our happiness and the bond we shared.', 'Together, they decided our future.'],
    },
    {
      title: 'The Decision',
      text: ['The wedding would be planned for the future.', 'No rush… but a promise of forever.'],
    },
    {
      title: 'Countless Memories',
      text: ['Every call, every chat, every moment became a beautiful memory.'],
    },
    {
      title: 'The Journey',
      text: ['From a simple meeting to a beautiful connection.', 'From two strangers to soulmates.'],
    },
    {
      title: 'The Beginning of Forever',
      date: '23 August 2027',
      text: ['The wedding is fixed. The future is ours.', 'Here’s to love, laughter and a lifetime together.'],
      note: 'To be continued…',
    },
  ] as StoryChapter[],
};
