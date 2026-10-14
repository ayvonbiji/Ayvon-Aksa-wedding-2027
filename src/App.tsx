import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SvgDefs } from './components/Art';
import { InvitationCover } from './components/InvitationCover';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WeddingDay } from './components/WeddingDay';
import { LoveStory } from './components/LoveStory';
import { Gallery } from './components/Gallery';
import { Memories } from './components/Memories';
import { Verse, GuestAndShare, Footer, MusicControl, BackToTop, Petals } from './components/Extras';
import { useNow } from './lib/hooks';
import { prefersReducedMotion } from './lib/assets';

export default function App() {
  // Skip the cover when arriving via an in-page link such as …/#gallery
  const [opened, setOpened] = useState(() => typeof window !== 'undefined' && window.location.hash.length > 1);
  const nowMs = useNow();
  const site = useRef<HTMLDivElement>(null);

  // Keep the page behind the cover out of the tab order until it is opened
  useLayoutEffect(() => {
    if (site.current) site.current.toggleAttribute('inert', !opened);
  }, [opened]);

  useEffect(() => {
    if (opened && window.location.hash.length > 1) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    }
  }, [opened]);

  return (
    <>
      <SvgDefs />
      {!opened && (
        <InvitationCover
          onOpened={() => {
            setOpened(true);
            // move keyboard / screen-reader focus to the invitation itself
            window.setTimeout(() => document.getElementById('hero-names')?.focus({ preventScroll: true }), 30);
          }}
        />
      )}
      <a className="skip-link" href="#wedding-day">Skip to wedding details</a>
      <div ref={site} className={`site ${opened ? 'site--open' : ''}`}>
        <Header />
        <main id="main">
          <Hero nowMs={nowMs} />
          <WeddingDay />
          <Verse />
          <LoveStory />
          <Gallery />
          <Memories />
          <GuestAndShare />
        </main>
        <Footer />
        <MusicControl />
        <BackToTop />
        {opened && !prefersReducedMotion() && <Petals />}
      </div>
    </>
  );
}
