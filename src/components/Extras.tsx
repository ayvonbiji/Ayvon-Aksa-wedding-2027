import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { wedding } from '../config/wedding';
import { asset, prefersReducedMotion, shareMessage, whatsappUrl } from '../lib/assets';
import { Art, art, parchment } from './Art';
import { Reveal } from './Reveal';
import { Logo } from './Logo';
import { Icon } from './Icon';

/* ── Bible verse ─────────────────────────────────────────────────────────── */
export function Verse() {
  const v = wedding.verse;
  return (
    <section className="section verse" aria-label="Scripture">
      <Reveal className="verse__inner">
        <Art {...art.sprigL} className="verse__sprig verse__sprig--l" />
        <figure>
          <blockquote className="verse__text">
            <p>{v.text}</p>
          </blockquote>
          <figcaption className="label verse__ref">
            {v.reference} <span className="verse__tr">({v.translation})</span>
          </figcaption>
        </figure>
        <Art {...art.sprigR} className="verse__sprig verse__sprig--r" />
      </Reveal>
    </section>
  );
}

/* ── Dear Guest, sharing & QR ────────────────────────────────────────────── */
export function GuestAndShare() {
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const nativeShare = async () => {
    try {
      await navigator.share({ title: wedding.meta.title, text: shareMessage().replace(wedding.siteUrl, '').trim(), url: wedding.siteUrl });
    } catch {
      /* dismissed by the guest — nothing to do */
    }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage());
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareMessage();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="share" className="section share" aria-labelledby="guest-title">
      <Reveal className="scroll-note">
        <Art {...parchment} className="scroll-note__paper" />
        <div className="scroll-note__body">
          <h2 id="guest-title" className="scroll-note__title script">{wedding.guestNote.title}</h2>
          <p className="scroll-note__text">{wedding.guestNote.text}</p>
          <p className="scroll-note__sign">
            — {wedding.groom.first}
            <span className="script scroll-note__amp">&amp;</span>
            {wedding.bride.first}
          </p>
        </div>
      </Reveal>

      <Reveal className="share__panel">
        <h2 className="section__title section__title--sm">Share Our Wedding Invitation</h2>
        <Art {...art.divider} className="divider" />
        <div className="share__buttons">
          <a className="btn btn--solid" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>
            Share on WhatsApp
            <span className="sr-only"> (opens WhatsApp)</span>
          </a>
          {canShare && (
            <button type="button" className="btn btn--pill" onClick={nativeShare}>
              <Icon name="share" /> Share…
            </button>
          )}
          <button type="button" className="btn btn--pill" onClick={copy}>
            <Icon name={copied ? 'check' : 'link'} /> {copied ? 'Copied!' : 'Copy Invitation Link'}
          </button>
        </div>
        <p className="share__status" role="status" aria-live="polite">{copied ? 'Invitation message copied to your clipboard.' : ''}</p>
        <QrCard />
      </Reveal>
    </section>
  );
}

/* ── QR code (always generated from wedding.siteUrl) ─────────────────────── */
const QR_FG = '#3A2E2A';

function QrCard() {
  const url = wedding.siteUrl;
  const svg = useMemo(() => {
    const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
    const n = qr.modules.size;
    const q = 4;
    let d = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.modules.get(x, y)) d += `M${x + q} ${y + q}h1v1h-1z`;
    return { d, size: n + q * 2, n };
  }, [url]);

  const downloadPng = async () => {
    const scale = 24;
    const px = svg.size * scale;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = px;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, px, px);
    ctx.fillStyle = QR_FG;
    ctx.fill(new Path2D(svg.d.replace(/(\d+)/g, (m) => String(+m * scale))));
    // centre badge
    const badge = svg.n * scale * 0.2;
    const c = px / 2;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.roundRect(c - badge / 2 - scale / 2, c - badge / 2 - scale / 2, badge + scale, badge + scale, badge * 0.2);
    ctx.fill();
    await new Promise<void>((res) => {
      const img = new Image();
      img.onload = () => (ctx.drawImage(img, c - badge / 2, c - badge / 2, badge, badge), res());
      img.onerror = () => res();
      img.src = asset('brand/monogram-mono.svg');
    });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'ayvon-aksa-wedding-qr.png';
    a.click();
  };

  const badge = svg.n * 0.2;
  const c = svg.size / 2;
  return (
    <div className="qr">
      <div className="qr__code">
        <svg viewBox={`0 0 ${svg.size} ${svg.size}`} role="img" aria-label={`QR code that opens ${url}`} shapeRendering="crispEdges">
          <rect width={svg.size} height={svg.size} fill="#fff" />
          <path d={svg.d} fill={QR_FG} />
          <rect x={c - badge / 2 - 0.5} y={c - badge / 2 - 0.5} width={badge + 1} height={badge + 1} rx={badge * 0.2} fill="#fff" />
          <image href={asset('brand/monogram-mono.svg')} x={c - badge / 2} y={c - badge / 2} width={badge} height={badge} />
        </svg>
      </div>
      <div className="qr__text">
        <p className="label">Scan to open our invitation</p>
        <p className="qr__url">{url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p>
        <div className="qr__actions">
          <button type="button" className="btn btn--ghost" onClick={downloadPng}>
            <Icon name="download" /> Download PNG
          </button>
          <a className="btn btn--ghost" href={asset('qr/wedding-qr.svg')} download="ayvon-aksa-wedding-qr.svg">
            <Icon name="download" /> Download SVG
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
export function Footer() {
  return (
    <footer className="footer">
      <Art {...art.cornerBL} className="corner corner--bl" />
      <Art {...art.cornerBR} className="corner corner--br" />
      <Reveal className="footer__inner">
        <Logo variant="monogram" className="footer__logo" />
        <p className="footer__signoff script">{wedding.footer.signOff}</p>
        <Art {...art.divider} className="divider" />
        <p className="label footer__date">{wedding.ceremony.shortDateLabel}</p>
        <p className="footer__tagline">{wedding.footer.tagline}</p>
      </Reveal>
    </footer>
  );
}

/* ── Music (off by default; never autoplays) ─────────────────────────────── */
export function MusicControl() {
  const m = wedding.music;
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => () => audio.current?.pause(), []);
  if (!m.enabled || !m.src) return null;

  const ensure = () => {
    if (!audio.current) {
      const a = new Audio(asset(m.src));
      a.loop = true;
      a.preload = 'none';
      a.volume = m.volume;
      a.addEventListener('error', () => (setError(true), setPlaying(false)));
      a.addEventListener('pause', () => setPlaying(false));
      a.addEventListener('play', () => setPlaying(true));
      audio.current = a;
    }
    return audio.current;
  };
  const toggle = async () => {
    const a = ensure();
    if (a.paused) {
      try {
        await a.play();
      } catch {
        setError(true);
      }
    } else a.pause();
  };
  const toggleMute = () => {
    const a = ensure();
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  return (
    <div className={`music ${playing ? 'music--playing' : ''}`}>
      <button type="button" className="fab" onClick={toggle} aria-pressed={playing} aria-label={playing ? `Pause music: ${m.title}` : `Play music: ${m.title}`} title={error ? 'Music unavailable' : m.title}>
        <Icon name={playing ? 'pause' : 'music'} />
      </button>
      {playing && (
        <button type="button" className="fab fab--small" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? 'Unmute music' : 'Mute music'}>
          <Icon name={muted ? 'mute' : 'volume'} />
        </button>
      )}
    </div>
  );
}

/* ── Back to top ─────────────────────────────────────────────────────────── */
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      type="button"
      className={`fab back-to-top ${show ? 'is-shown' : ''}`}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
    >
      <Icon name="up" />
    </button>
  );
}

/* ── Floating petals (decorative; off for reduced motion) ────────────────── */
export function Petals() {
  const { petals, petalCount } = wedding.effects;
  const items = useMemo(
    () =>
      Array.from({ length: petalCount }, (_, i) => ({
        left: (i * 97) % 100,
        delay: -((i * 3.7) % 18),
        dur: 16 + ((i * 5) % 10),
        size: 10 + ((i * 7) % 9),
        drift: (i % 2 ? 1 : -1) * (30 + ((i * 13) % 50)),
      })),
    [petalCount],
  );
  if (!petals) return null;
  return (
    <div className="petals" aria-hidden="true">
      {items.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 0.8, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, ['--drift' as string]: `${p.drift}px` }}
        />
      ))}
    </div>
  );
}
