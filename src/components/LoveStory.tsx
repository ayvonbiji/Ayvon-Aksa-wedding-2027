import { useState } from 'react';
import { story } from '../content/story';
import { wedding } from '../config/wedding';
import { asset } from '../lib/assets';
import { Art, art } from './Art';
import { Reveal } from './Reveal';
import { Lightbox } from './Lightbox';

/** Editable love-story timeline — content lives in src/content/story.ts. */
export function LoveStory() {
  const [viewer, setViewer] = useState<number | null>(null);
  const chapters = story.chapters;
  const ill = story.illustration;

  // Everything that can open in the lightbox: the illustrated story + chapter photos
  const media = [
    ...(ill.src ? [{ src: ill.src, alt: ill.alt, caption: ill.label }] : []),
    ...chapters.filter((c) => c.image).map((c) => ({ src: c.image!, alt: c.imageAlt || c.title, caption: c.caption })),
  ];
  const openMedia = (src: string) => setViewer(media.findIndex((m) => m.src === src));

  return (
    <section id="love-story" className="section story" aria-labelledby="story-title">
      <Art {...art.cornerTL} className="corner corner--tl corner--soft" />
      <Reveal className="section__head">
        <Art {...art.bow} className="section__bow" />
        <h2 id="story-title" className="section__title">{story.heading}</h2>
        {chapters.length > 0 && <p className="section__lead">{story.subheading}</p>}
        <Art {...art.divider} className="divider" />
        {chapters.length > 0 && <p className="story__intro">{story.intro}</p>}
      </Reveal>

      {chapters.length === 0 ? (
        <Reveal className="story__placeholder">
          <p className="story__placeholder-1">{story.placeholder.line1}</p>
          <p className="story__placeholder-2">{story.placeholder.line2}</p>
          <Art {...art.bouquet} className="story__placeholder-art" />
        </Reveal>
      ) : (
        <>
          {ill.src && (
            <Reveal className="story__illustration">
              <button type="button" className="story__ill-btn" onClick={() => openMedia(ill.src)}>
                <img src={asset(ill.thumb || ill.src)} alt="" loading="lazy" decoding="async" width={533} height={800} />
                <span className="story__ill-label">
                  <span className="script">{ill.label}</span>
                  <span className="label">Tap to view</span>
                </span>
                <span className="sr-only">View {ill.alt}</span>
              </button>
            </Reveal>
          )}

          <ol className="timeline">
            {chapters.map((ch, i) => (
              <Reveal as="li" key={`${i}-${ch.title}`} variant={i % 2 ? 'right' : 'left'} className={`timeline__item ${i % 2 ? 'timeline__item--right' : 'timeline__item--left'}`}>
                <span className="timeline__dot" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <article className="timeline__card">
                  <Art {...art.roseDeep} className="timeline__rose" />
                  {(ch.date || ch.place) && (
                    <p className="label timeline__meta">{[ch.date, ch.place].filter(Boolean).join(' · ')}</p>
                  )}
                  <h3 className="timeline__title">{ch.title}</h3>
                  {ch.text.map((t, j) => (
                    <p key={j} className="timeline__text">{t}</p>
                  ))}
                  {ch.note && <p className="timeline__note script">{ch.note}</p>}
                  {ch.image && (
                    <figure className="timeline__figure">
                      <button type="button" onClick={() => openMedia(ch.image!)} aria-label={`Enlarge photo: ${ch.imageAlt || ch.title}`}>
                        <img src={asset(ch.image)} alt={ch.imageAlt || ''} loading="lazy" decoding="async" />
                      </button>
                      {ch.caption && <figcaption>{ch.caption}</figcaption>}
                    </figure>
                  )}
                </article>
              </Reveal>
            ))}
          </ol>

          {story.closingQuote && (
            <Reveal className="story__quote" variant="zoom">
              <Art {...art.cardCorner} className="story__quote-flower story__quote-flower--tl" />
              <Art {...art.cardCorner} className="story__quote-flower story__quote-flower--br" />
              <Art {...art.heartDivider} className="story__quote-orn" />
              <blockquote>
                <p>{story.closingQuote}</p>
              </blockquote>
              <p className="story__quote-sign">
                {wedding.groom.first} <span>&amp;</span> {wedding.bride.first}
              </p>
            </Reveal>
          )}
        </>
      )}

      {viewer !== null && viewer >= 0 && (
        <Lightbox items={media} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} label="Our story" />
      )}
    </section>
  );
}
