import { useCallback, useEffect, useRef, useState } from 'react';
import { wedding } from '../config/wedding';
import { listApproved, memoriesConfigured, uploadPageUrl, type MemoryPhoto } from '../lib/memories';
import { Art, art } from './Art';
import { Reveal } from './Reveal';
import { Lightbox } from './Lightbox';
import { Icon } from './Icon';
import { QrCode } from './QrCode';

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

/** "Our Wedding Memories" — approved guest photos, live from the database. */
export function Memories() {
  const m = wedding.memories;
  const configured = memoriesConfigured();
  const [photos, setPhotos] = useState<MemoryPhoto[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>(configured ? 'loading' : 'idle');
  const [more, setMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewer, setViewer] = useState<number | null>(null);
  const section = useRef<HTMLElement>(null);
  const visible = useRef(false);

  const load = useCallback(async () => {
    if (!configured) return;
    try {
      const first = await listApproved();
      setPhotos((prev) => {
        // keep already-loaded older pages, refresh the newest page
        const ids = new Set(first.map((p) => p.id));
        const older = prev.filter((p) => !ids.has(p.id) && first.length && p.created_at < first[first.length - 1].created_at);
        return [...first, ...older];
      });
      setMore((cur) => cur || first.length === m.pageSize);
      setState('ready');
    } catch {
      setState((s) => (s === 'ready' ? 'ready' : 'error'));
    }
  }, [configured, m.pageSize]);

  useEffect(() => {
    if (!configured) return;
    load();
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    if (section.current) io.observe(section.current);
    const t = window.setInterval(() => {
      if (visible.current && document.visibilityState === 'visible') load();
    }, m.refreshSeconds * 1000);
    return () => {
      io.disconnect();
      clearInterval(t);
    };
  }, [configured, load, m.refreshSeconds]);

  const loadMore = async () => {
    if (!photos.length) return;
    setLoadingMore(true);
    try {
      const next = await listApproved(photos[photos.length - 1].created_at);
      setPhotos((p) => [...p, ...next.filter((n) => !p.some((x) => x.id === n.id))]);
      setMore(next.length === m.pageSize);
    } catch {
      /* keep what we have */
    } finally {
      setLoadingMore(false);
    }
  };

  const upload = uploadPageUrl();
  const caption = (p: MemoryPhoto) => [p.caption, p.guest_name ? `— ${p.guest_name}` : '', fmtDate(p.created_at)].filter(Boolean).join('  ·  ');

  return (
    <section id="memories" ref={section} className="section memories" aria-labelledby="memories-title">
      <Art {...art.cornerTL} className="corner corner--tl corner--soft" />
      <Reveal className="section__head">
        <Art {...art.bow} className="section__bow" />
        <h2 id="memories-title" className="section__title">{m.heading}</h2>
        <Art {...art.divider} className="divider" />
      </Reveal>

      {state === 'ready' && photos.length > 0 ? (
        <>
          <ul className="memories__grid" aria-label="Photos shared by our guests">
            {photos.map((p, i) => (
              <li key={p.id} className="memories__cell">
                <button type="button" onClick={() => setViewer(i)} aria-label={`Open photo${p.guest_name ? ` shared by ${p.guest_name}` : ''}${p.caption ? `: ${p.caption}` : ''}`}>
                  <img src={p.url} alt={p.caption || 'A wedding memory shared by a guest'} loading="lazy" decoding="async" />
                </button>
                {(p.guest_name || p.caption) && (
                  <p className="memories__meta">
                    {p.caption && <span>{p.caption}</span>}
                    {p.guest_name && <span className="memories__by">{p.guest_name}</span>}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <div className="memories__actions">
            {more && (
              <button type="button" className="btn btn--pill" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Show more memories'}
              </button>
            )}
            <button type="button" className="btn btn--ghost" onClick={load}>
              <Icon name="refresh" /> Refresh
            </button>
            <a className="btn btn--solid" href={upload}>
              <Icon name="camera" /> Share your photos
            </a>
          </div>
        </>
      ) : (
        <Reveal className="memories__empty">
          {state === 'loading' ? (
            <p className="memories__status" role="status">Gathering our memories…</p>
          ) : (
            <>
              <p className="memories__lead">{m.emptyMessage}</p>
              {state === 'error' && (
                <p className="memories__status" role="status">
                  We couldn’t load the photos just now.{' '}
                  <button type="button" className="linklike" onClick={load}>Try again</button>
                </p>
              )}
              <div className="memories__invite">
                <QrCode url={upload} label="Scan to Share Your Wedding Memories" variant="upload" size={150} />
                <a className="btn btn--solid" href={upload}>
                  <Icon name="camera" /> Share your photos
                </a>
              </div>
            </>
          )}
        </Reveal>
      )}

      {viewer !== null && (
        <Lightbox
          items={photos.map((p) => ({ src: p.url!, alt: p.caption || 'A wedding memory shared by a guest', caption: caption(p) }))}
          index={viewer}
          onIndex={setViewer}
          onClose={() => setViewer(null)}
          label="Our Wedding Memories photo viewer"
        />
      )}
    </section>
  );
}
