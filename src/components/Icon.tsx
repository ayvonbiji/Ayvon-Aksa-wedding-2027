const paths = {
  calendar: 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm3 8h2m3 0h2m-7 4h2m3 0h2',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4.5l3 2',
  church: 'M12 2v4M10 4h4M12 6l-5 5v10h10V11l-5-5Zm-2 15v-4a2 2 0 1 1 4 0v4M3 21h18M7 14H4v7M17 14h3v7',
  pin: 'M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  download: 'M12 4v11m0 0-4-4m4 4 4-4M5 19h14',
  upload: 'M12 16V5m0 0-4 4m4-4 4 4M5 19h14',
  camera: 'M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm8 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  refresh: 'M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z',
  share: 'M16 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.4-10.5 2.8-1.6m-2.8 4.6 2.8 1.6',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  check: 'm5 12 4.5 4.5L19 7',
  close: 'M6 6l12 12M18 6 6 18',
  left: 'M15 5l-7 7 7 7',
  right: 'M9 5l7 7-7 7',
  up: 'M5 15l7-7 7 7',
  music: 'M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm10-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 4.5v15l12-7.5-12-7.5Z',
  volume: 'M4 9v6h4l5 4V5L8 9H4Zm12.5-.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12',
  mute: 'M4 9v6h4l5 4V5L8 9H4Zm12 1 5 5m0-5-5 5',
  heart: 'M12 20s-7-4.4-9-9.2C1.6 7.2 4 4 7.3 4c2 0 3.6 1.1 4.7 2.7C13.1 5.1 14.7 4 16.7 4 20 4 22.4 7.2 21 10.8 19 15.6 12 20 12 20Z',
  qr: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h2v2h-2v-2Zm4 0h2v2h-2zm-4 4h2v2h-2zm4 0h2v2h-2zM16 16h2v2h-2z',
};

export type IconName = keyof typeof paths;

/** Fine-line icon (decorative; pair with visible text or an aria-label). */
export function Icon({ name, className = 'icon' }: { name: IconName; className?: string }) {
  const filled = name === 'play' || name === 'heart';
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}
