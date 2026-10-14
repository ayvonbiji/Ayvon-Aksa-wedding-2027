import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { asset } from '../lib/assets';
import { useScrollLock } from '../lib/hooks';
import { Icon } from './Icon';

export interface LightboxItem {
  src: string;
  alt: string;
  caption?: string;
}

interface Props {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
  label?: string;
}

/**
 * Full-screen photo viewer: previous/next buttons, ← → keys, Escape to close,
 * swipe on touch screens, focus kept inside while open and restored on close.
 */
export function Lightbox({ items, index, onClose, onIndex, label = 'Photo viewer' }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  useScrollLock(true);

  const count = items.length;
  const prev = useCallback(() => onIndex((index - 1 + count) % count), [index, count, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % count), [index, count, onIndex]);

  useEffect(() => {
    opener.current = document.activeElement;
    closeBtn.current?.focus();
    return () => (opener.current as HTMLElement | null)?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Tab' && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>('button');
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) (e.preventDefault(), last.focus());
        else if (!e.shiftKey && document.activeElement === last) (e.preventDefault(), first.focus());
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  // Preload neighbours for smooth navigation
  useEffect(() => {
    if (count < 2) return;
    [index + 1, index - 1].forEach((i) => {
      const it = items[(i + count) % count];
      const img = new Image();
      img.src = asset(it.src);
    });
  }, [index, items, count]);

  const item = items[index];
  if (!item) return null;

  return createPortal(
    <div
      ref={dialog}
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        touch.current = null;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) (dx < 0 ? next : prev)();
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) onClose();
      }}
    >
      <button ref={closeBtn} type="button" className="lightbox__close" onClick={onClose} aria-label="Close photo viewer">
        <Icon name="close" />
      </button>
      {count > 1 && (
        <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={prev} aria-label="Previous photo">
          <Icon name="left" />
        </button>
      )}
      <figure className="lightbox__figure" key={index}>
        {failed[index] ? (
          <div className="placeholder placeholder--dark" role="img" aria-label={item.alt}>
            <span>This photo could not be loaded</span>
          </div>
        ) : (
          <img src={asset(item.src)} alt={item.alt} decoding="async" onError={() => setFailed((f) => ({ ...f, [index]: true }))} />
        )}
        <figcaption>
          {item.caption && <span className="lightbox__caption">{item.caption}</span>}
          {count > 1 && (
            <span className="lightbox__count" aria-live="polite">
              {index + 1} / {count}
            </span>
          )}
        </figcaption>
      </figure>
      {count > 1 && (
        <button type="button" className="lightbox__nav lightbox__nav--next" onClick={next} aria-label="Next photo">
          <Icon name="right" />
        </button>
      )}
    </div>,
    document.body,
  );
}
