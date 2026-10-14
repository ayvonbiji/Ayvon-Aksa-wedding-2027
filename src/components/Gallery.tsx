import { useEffect, useRef, useState } from 'react';
import { gallery, type GalleryPhoto } from '../content/gallery';
import { asset } from '../lib/assets';
import { Art, art } from './Art';
import { Reveal } from './Reveal';
import { Lightbox } from './Lightbox';
import { Icon } from './Icon';

function Photo({ p, sizes, eager = false }: { p: GalleryPhoto; sizes?: string; eager?: boolean }) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return (
      <div className="placeholder" role="img" aria-label={p.alt}>
        <Art {...art.rose} className="placeholder__rose" />
      </div>
    );
  }
  const thumb = p.thumb ? asset(p.thumb) : asset(p.src);
  return (
    <img
      src={thumb}
      srcSet={p.thumb ? `${asset(p.thumb)} 800w, ${asset(p.src)} 1600w` : undefined}
      sizes={sizes}
      alt={p.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={{ objectPosition: p.position || '50% 50%' }}
      onError={() => setOk(false)}
    />
  );
}

/** Framed slideshow (as in the reference invitation) plus a photo grid, both opening the lightbox. */
export function Gallery() {
  const photos = gallery.photos;
  const [slide, setSlide] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const touch = useRef<number | null>(null);
  const count = photos.length;

  useEffect(() => {
    if (slide >= count) setSlide(0);
  }, [count, slide]);

  const go = (d: number) => setSlide((s) => (s + d + count) % count);

  return (
    <section id="gallery" className="section gallery" aria-labelledby="gallery-title">
      <Art {...art.cornerBR} className="corner corner--br corner--soft" />
      <Reveal className="section__head">
        <Art {...art.bow} className="section__bow" />
        <h2 id="gallery-title" className="section__title">{gallery.heading}</h2>
        <Art {...art.divider} className="divider" />
        {gallery.intro && <p className="section__lead section__lead--body">{gallery.intro}</p>}
      </Reveal>

      {count === 0 ? (
        <div className="gallery__grid">
          {Array.from({ length: gallery.placeholderCount }, (_, i) => (
            <div key={i} className={`gallery__cell gallery__cell--${i % 3 === 1 ? 'landscape' : 'portrait'}`}>
              <div className="placeholder" role="img" aria-label="Photo coming soon">
                <Art {...art.rose} className="placeholder__rose" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <Reveal className="slideshow">
            <div
              className="slideshow__frame"
              role="group"
              aria-roledescription="carousel"
              aria-label="Featured photos"
              onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touch.current === null) return;
                const dx = e.changedTouches[0].clientX - touch.current;
                touch.current = null;
                if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
              }}
            >
              <div className="slideshow__viewport">
                {photos.map((p, i) => (
                  <button
                    key={p.src}
                    type="button"
                    className={`slideshow__slide ${i === slide ? 'is-active' : ''}`}
                    aria-hidden={i !== slide}
                    tabIndex={i === slide ? 0 : -1}
                    onClick={() => setViewer(i)}
                    aria-label={`Open photo ${i + 1} of ${count} full screen: ${p.alt}`}
                  >
                    <Photo p={p} sizes="(min-width: 700px) 560px, 92vw" eager={i === 0} />
                  </button>
                ))}
              </div>
              {count > 1 && (
                <>
                  <button type="button" className="slideshow__arrow slideshow__arrow--prev" onClick={() => go(-1)} aria-label="Previous photo">
                    <Icon name="left" />
                  </button>
                  <button type="button" className="slideshow__arrow slideshow__arrow--next" onClick={() => go(1)} aria-label="Next photo">
                    <Icon name="right" />
                  </button>
                </>
              )}
            </div>
            <p className="slideshow__caption" aria-live="polite">
              {photos[slide]?.caption ? `“${photos[slide].caption}”` : ' '}
            </p>
            {count > 1 && (
              <div className="slideshow__dots" role="tablist" aria-label="Choose photo">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === slide}
                    aria-label={`Photo ${i + 1}`}
                    className={i === slide ? 'is-active' : ''}
                    onClick={() => setSlide(i)}
                  />
                ))}
              </div>
            )}
          </Reveal>

          <ul className="gallery__grid" aria-label="All photos">
            {photos.map((p, i) => (
              <Reveal as="li" key={p.src} delay={(i % 4) * 70} className={`gallery__cell gallery__cell--${p.orientation || 'portrait'}`}>
                <button type="button" onClick={() => setViewer(i)} aria-label={`Open full screen: ${p.alt}`}>
                  <Photo p={p} sizes="(min-width: 900px) 300px, 46vw" />
                </button>
              </Reveal>
            ))}
          </ul>
        </>
      )}

      {viewer !== null && (
        <Lightbox
          items={photos.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption }))}
          index={viewer}
          onIndex={setViewer}
          onClose={() => setViewer(null)}
          label="Our Moments photo viewer"
        />
      )}
    </section>
  );
}
