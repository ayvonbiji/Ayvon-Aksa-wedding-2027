import { wedding } from '../config/wedding';

/** Resolve a /public path (e.g. 'images/x.webp') against the deployed base path. Full URLs pass through. */
export const asset = (p: string) => (/^(https?:|data:|blob:)/.test(p) ? p : `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`);

export const shareMessage = () => wedding.share.message.replace('{url}', wedding.siteUrl);
export const whatsappUrl = () => `https://wa.me/?text=${encodeURIComponent(shareMessage())}`;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
