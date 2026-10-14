import { StrictMode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/fonts';
import '../styles/global.css';
import '../styles/memories.css';
import { wedding } from '../config/wedding';
import { SvgDefs, Art, art } from '../components/Art';
import { Logo } from '../components/Logo';
import { Icon } from '../components/Icon';
import { memoriesConfigured, removeMyMemory, rpc, uploadMemory, MemoryError, type PreparedPhoto, type UploadReceipt } from '../lib/memories';
import { preparePhoto, PrepError } from '../lib/imagePrep';

type ItemState = 'preparing' | 'ready' | 'uploading' | 'done' | 'error';

interface Item {
  key: string;
  file: File;
  preview: string;
  state: ItemState;
  progress: number;
  error?: string;
  caption: string;
  prepared?: PreparedPhoto;
}

interface SavedUpload extends UploadReceipt {
  thumb?: string;
  removed?: boolean;
}

const STORE = 'aa-memories-uploads';
const readSaved = (): SavedUpload[] => {
  try {
    return JSON.parse(localStorage.getItem(STORE) || '[]');
  } catch {
    return [];
  }
};
const writeSaved = (list: SavedUpload[]) => {
  try {
    localStorage.setItem(STORE, JSON.stringify(list.slice(-100)));
  } catch {
    /* storage unavailable (private mode) — uploads still work */
  }
};

/** Small thumbnail data URL to remember this device's uploads. */
async function tinyThumb(blob: Blob): Promise<string | undefined> {
  try {
    const bmp = await createImageBitmap(blob);
    const s = 96 / Math.max(bmp.width, bmp.height);
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * s);
    c.height = Math.round(bmp.height * s);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.6);
  } catch {
    return undefined;
  }
}

const home = import.meta.env.BASE_URL;
const m = wedding.memories;

function UploadPage() {
  const configured = memoriesConfigured();
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [showName, setShowName] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'error' | 'info'; text: string } | null>(null);
  const [finished, setFinished] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);
  const [open, setOpen] = useState<boolean | null>(null);
  const [saved, setSaved] = useState<SavedUpload[]>(() => readSaved());
  const input = useRef<HTMLInputElement>(null);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    if (!configured) return;
    rpc<boolean>('memory_uploads_open').then(setOpen).catch(() => setOpen(true));
  }, [configured]);

  // free preview URLs
  useEffect(() => () => items.forEach((i) => URL.revokeObjectURL(i.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (key: string, patch: Partial<Item>) => setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      setNotice(null);
      setFinished(null);
      const incoming = [...files];
      const room = m.maxFilesPerBatch - items.filter((i) => i.state !== 'done').length;
      if (incoming.length > room) {
        setNotice({ kind: 'info', text: `You can share up to ${m.maxFilesPerBatch} photos at a time — the first ${Math.max(room, 0)} were added.` });
      }
      const fresh: Item[] = [];
      for (const file of incoming.slice(0, Math.max(room, 0))) {
        const sig = `${file.name}|${file.size}|${file.lastModified}`;
        if (seen.current.has(sig)) continue;
        seen.current.add(sig);
        fresh.push({ key: crypto.randomUUID(), file, preview: URL.createObjectURL(file), state: 'preparing', progress: 0, caption: '' });
      }
      setItems((list) => [...list, ...fresh]);
      fresh.forEach(async (it) => {
        try {
          const prepared = await preparePhoto(it.file);
          const dupe = readSaved().some((s) => (s as SavedUpload & { hash?: string }).hash === prepared.hash && !s.removed);
          update(it.key, dupe ? { state: 'error', error: 'You have already shared this photo.' } : { state: 'ready', prepared });
        } catch (e) {
          update(it.key, { state: 'error', error: e instanceof PrepError ? e.message : 'This photo could not be opened.' });
        }
      });
    },
    [items],
  );

  const removeItem = (key: string) =>
    setItems((list) => {
      const it = list.find((i) => i.key === key);
      if (it) {
        URL.revokeObjectURL(it.preview);
        seen.current.delete(`${it.file.name}|${it.file.size}|${it.file.lastModified}`);
      }
      return list.filter((i) => i.key !== key);
    });

  const ready = items.filter((i) => i.state === 'ready');
  const preparing = items.some((i) => i.state === 'preparing');
  const total = useMemo(() => {
    const active = items.filter((i) => i.state === 'uploading' || i.state === 'done' || i.state === 'ready');
    if (!active.length) return 0;
    return active.reduce((s, i) => s + (i.state === 'done' ? 1 : i.state === 'uploading' ? i.progress : 0), 0) / active.length;
  }, [items]);

  const submit = async () => {
    if (busy || !ready.length) return;
    setBusy(true);
    setNotice(null);
    let ok = 0;
    let failed = 0;
    for (const it of ready) {
      update(it.key, { state: 'uploading', progress: 0, error: undefined });
      try {
        const receipt = await uploadMemory(it.prepared!, { guestName: name.trim(), caption: it.caption.trim(), showName }, (p) => update(it.key, { progress: p }));
        ok++;
        update(it.key, { state: 'done', progress: 1 });
        const entry = { ...receipt, thumb: await tinyThumb(it.prepared!.blob), hash: it.prepared!.hash };
        const next = [...readSaved(), entry];
        writeSaved(next);
        setSaved(next);
      } catch (e) {
        failed++;
        const msg = e instanceof MemoryError ? e.message : 'Upload failed. Please try again.';
        update(it.key, { state: 'error', error: msg });
        if (e instanceof MemoryError && (e.code === 'rate_limited' || e.code === 'uploads_closed')) break;
      }
    }
    setBusy(false);
    if (ok) setFinished(ok);
    if (failed) setNotice({ kind: 'error', text: `${failed} photo${failed > 1 ? 's' : ''} could not be uploaded — see the message on ${failed > 1 ? 'each' : 'the'} photo.` });
  };

  const clearDone = () =>
    setItems((list) => {
      list.filter((i) => i.state === 'done').forEach((i) => {
        URL.revokeObjectURL(i.preview);
        seen.current.delete(`${i.file.name}|${i.file.size}|${i.file.lastModified}`);
      });
      return list.filter((i) => i.state !== 'done');
    });

  const removeSaved = async (s: SavedUpload) => {
    if (!confirm('Remove this photo from Our Wedding Memories?')) return;
    try {
      await removeMyMemory(s.id, s.token);
      const next = readSaved().map((x) => (x.id === s.id ? { ...x, removed: true } : x));
      writeSaved(next);
      setSaved(next);
    } catch (e) {
      alert(e instanceof MemoryError ? e.message : 'Could not remove the photo. Please try again.');
    }
  };

  const disabled = !configured || open === false;

  return (
    <div className="mem-page">
      <SvgDefs />
      <Art {...art.cornerTL} className="corner corner--tl" />
      <Art {...art.cornerTR} className="corner corner--tr" />
      <header className="mem-top">
        <a href={home} className="mem-top__back">
          <Icon name="left" /> Our wedding website
        </a>
        <a href={home} aria-label="Ayvon & Aksa wedding website">
          <Logo variant="compact" className="mem-top__logo" decorative />
        </a>
      </header>

      <main className="mem-main">
        <section className="mem-hero">
          <Logo variant="monogram" className="mem-hero__logo" decorative />
          <h1 className="mem-hero__title script">{m.uploadTitle}</h1>
          <p className="mem-hero__sub">{m.uploadSubtitle}</p>
          <Art {...art.divider} className="divider" />
          <h2 className="mem-hero__heading">{m.uploadHeading}</h2>
          <p className="mem-hero__msg">{m.uploadMessage}</p>
        </section>

        <section className="upload-card" aria-labelledby="upload-title">
          <Art {...art.bouquet} className="upload-card__flowers" />
          <h2 id="upload-title" className="sr-only">Upload photos</h2>

          {disabled ? (
            <div className="upload-closed" role="status">
              <Icon name="heart" className="upload-closed__icon" />
              <p className="upload-closed__title">{!configured ? 'Photo sharing opens soon' : 'Photo sharing is closed for now'}</p>
              <p>
                {!configured
                  ? 'We are getting our memories album ready. Please come back closer to the wedding day.'
                  : 'Thank you for all the beautiful memories you have shared!'}
              </p>
            </div>
          ) : (
            <>
              <ol className="upload-steps">
                <li><span>1</span><p>Choose your photos — up to {m.maxFilesPerBatch} at a time.</p></li>
                <li><span>2</span><p>Add your name or a caption if you like (optional).</p></li>
                <li><span>3</span><p>Tap <strong>Share</strong>. We’ll add them after a quick look.</p></li>
              </ol>

              <div
                className={`dropzone ${drag ? 'dropzone--over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
                }}
              >
                <input
                  ref={input}
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files?.length) addFiles(e.target.files);
                    e.target.value = '';
                  }}
                  disabled={busy}
                />
                <input
                  id="camera-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files?.length) addFiles(e.target.files);
                    e.target.value = '';
                  }}
                  disabled={busy}
                />
                <div className="dropzone__buttons">
                  <label htmlFor="photo-input" className="btn btn--solid dropzone__btn">
                    <Icon name="upload" /> Upload Photos
                  </label>
                  <label htmlFor="camera-input" className="btn btn--pill dropzone__btn dropzone__btn--camera">
                    <Icon name="camera" /> Take a Photo
                  </label>
                </div>
                <p className="dropzone__hint">
                  <span className="only-desktop">or drag &amp; drop photos here · </span>JPEG, PNG, WebP or iPhone photos · up to {m.maxInputMB} MB each,{' '}
                  {m.maxFilesPerBatch} at a time
                </p>
              </div>

              {items.length > 0 && (
                <ul className="previews" aria-label="Selected photos">
                  {items.map((it) => (
                    <li key={it.key} className={`preview preview--${it.state}`}>
                      <div className="preview__img">
                        <img src={it.preview} alt={`Selected photo ${it.file.name}`} onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')} />
                        {it.state === 'uploading' && (
                          <div className="preview__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(it.progress * 100)} aria-label={`Uploading ${it.file.name}`}>
                            <span style={{ width: `${Math.round(it.progress * 100)}%` }} />
                          </div>
                        )}
                        {it.state === 'done' && <span className="preview__badge" aria-label="Uploaded"><Icon name="check" /></span>}
                        {it.state === 'preparing' && <span className="preview__badge preview__badge--wait" aria-label="Preparing">…</span>}
                        {it.state !== 'uploading' && it.state !== 'done' && (
                          <button type="button" className="preview__remove" onClick={() => removeItem(it.key)} aria-label={`Remove ${it.file.name}`} disabled={busy}>
                            <Icon name="close" />
                          </button>
                        )}
                      </div>
                      {it.state === 'error' ? (
                        <p className="preview__error" role="alert">
                          {it.error}
                          {it.prepared && !busy && !/already shared/.test(it.error || '') && (
                            <button type="button" className="linklike preview__retry" onClick={() => update(it.key, { state: 'ready', error: undefined })}>
                              Try again
                            </button>
                          )}
                        </p>
                      ) : it.state === 'done' ? (
                        <p className="preview__ok">Shared — thank you!</p>
                      ) : (
                        <input
                          className="preview__caption"
                          type="text"
                          maxLength={200}
                          placeholder="Caption (optional)"
                          aria-label={`Caption for ${it.file.name}`}
                          value={it.caption}
                          disabled={busy}
                          onChange={(e) => update(it.key, { caption: e.target.value })}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {items.some((i) => i.state !== 'done') && (
                <div className="upload-form">
                  <label className="field">
                    <span className="label">Your name (optional)</span>
                    <input type="text" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" disabled={busy} />
                  </label>
                  <label className="check">
                    <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} disabled={busy || !name.trim()} />
                    <span>Show my name with my photos on the website</span>
                  </label>
                </div>
              )}

              {(busy || total > 0) && items.some((i) => i.state === 'uploading' || i.state === 'done') && (
                <div className="total-progress" aria-live="polite">
                  <div className="total-progress__bar"><span style={{ width: `${Math.round(total * 100)}%` }} /></div>
                  <p>{busy ? `Uploading… ${Math.round(total * 100)}%` : 'Upload complete'}</p>
                </div>
              )}

              {notice && (
                <p className={`upload-notice upload-notice--${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>
                  {notice.text}
                </p>
              )}

              {finished !== null && !busy && (
                <div className="upload-success" role="status">
                  <Art {...art.bow} className="upload-success__bow" />
                  <p className="upload-success__title script">Thank you!</p>
                  <p>
                    {finished === 1 ? 'Your photo has' : `Your ${finished} photos have`} been shared with Ayvon &amp; Aksa. They will appear in
                    Our Wedding Memories after a quick review.
                  </p>
                  <div className="upload-success__actions">
                    <button type="button" className="btn btn--pill" onClick={() => (clearDone(), setFinished(null), input.current?.click())}>
                      Share more photos
                    </button>
                    <a className="btn btn--ghost" href={`${home}#memories`}>See Our Wedding Memories</a>
                  </div>
                </div>
              )}

              {ready.length > 0 && (
                <button type="button" className="btn btn--solid upload-submit" onClick={submit} disabled={busy || preparing}>
                  {busy ? 'Uploading…' : preparing ? 'Preparing photos…' : `Share ${ready.length} photo${ready.length > 1 ? 's' : ''}`}
                </button>
              )}
            </>
          )}
        </section>

        {saved.some((s) => !s.removed) && configured && (
          <section className="my-uploads" aria-labelledby="mine-title">
            <h2 id="mine-title" className="label">Photos you shared from this device</h2>
            <ul>
              {saved.filter((s) => !s.removed).reverse().map((s) => (
                <li key={s.id}>
                  {s.thumb ? <img src={s.thumb} alt="" /> : <span className="my-uploads__ph" />}
                  <span>{new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  <button type="button" className="btn btn--ghost" onClick={() => removeSaved(s)}>Remove</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="privacy-note">{m.privacyNotice}</p>

        <footer className="mem-footer">
          <a className="btn btn--pill" href={home}>
            <Icon name="heart" /> Visit our wedding website
          </a>
          <p className="label">{wedding.ceremony.shortDateLabel} · {wedding.ceremony.venue}, {wedding.ceremony.town}</p>
        </footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UploadPage />
  </StrictMode>,
);
