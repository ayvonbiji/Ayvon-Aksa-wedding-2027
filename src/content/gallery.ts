/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  OUR MOMENTS — photo gallery
 * ─────────────────────────────────────────────────────────────────────────────
 *  Add a photo:
 *    1. Put the original in /photos and run  `npm run images`
 *       (or place any .jpg/.webp directly in public/images/gallery/,
 *        or use a full https:// image URL).
 *    2. Add an entry below. Order here = order on the page.
 *
 *  Fields:
 *    src          (required) path under /public, or a full https:// URL
 *    thumb        (optional) smaller version for the grid (falls back to src)
 *    alt          (required) describe the photo — read aloud by screen readers
 *    caption      (optional) short line shown in the lightbox / slideshow
 *    orientation  (optional) 'portrait' | 'landscape' | 'square' — sets the grid shape
 *    position     (optional) CSS object-position to adjust cropping, e.g. '50% 20%'
 *                 (first value = horizontal, second = vertical; lower % = show more top/left)
 *
 *  Missing or broken images show an ornamental placeholder instead of an error.
 */

export interface GalleryPhoto {
  src: string;
  thumb?: string;
  alt: string;
  caption?: string;
  orientation?: 'portrait' | 'landscape' | 'square';
  position?: string;
}

export const gallery = {
  heading: 'Our Moments',
  intro: 'A few of our favourite moments, from one side of the world to the other.',
  /** How many empty placeholder tiles to show if `photos` is empty. */
  placeholderCount: 6,

  photos: [
    {
      src: 'images/gallery/ayvon-aksa-01.webp',
      thumb: 'images/gallery/ayvon-aksa-01-thumb.webp',
      alt: 'Aksa in a red embroidered outfit and Ayvon in a maroon shirt, standing together and smiling',
      caption: 'Happiest when we are together.',
      orientation: 'portrait',
      position: '50% 30%',
    },
    {
      src: 'images/gallery/ayvon-aksa-03.webp',
      thumb: 'images/gallery/ayvon-aksa-03-thumb.webp',
      alt: 'A cheerful selfie of Aksa and Ayvon in a pine forest, Ayvon giving a thumbs-up',
      caption: 'Lost in the pines, found in each other.',
      orientation: 'landscape',
      position: '45% 40%',
    },
    {
      src: 'images/gallery/ayvon-aksa-04.webp',
      thumb: 'images/gallery/ayvon-aksa-04-thumb.webp',
      alt: 'Aksa in a black leaf-print kurta and Ayvon in a sage shirt standing in front of a pink wall',
      caption: 'Side by side, always.',
      orientation: 'portrait',
      position: '50% 35%',
    },
    {
      src: 'images/gallery/ayvon-aksa-02.webp',
      thumb: 'images/gallery/ayvon-aksa-02-thumb.webp',
      alt: 'Ayvon and Aksa dressed in black, taking a selfie in a garden with rope swings',
      caption: 'Sunshine, swings and us.',
      orientation: 'landscape',
      position: '60% 45%',
    },
  ] as GalleryPhoto[],
};
