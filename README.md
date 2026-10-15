# Ayvon & Aksa — Wedding Invitation

A digital wedding invitation and website for **Ayvon Joseph Biji & Aksa Saji Kunnel**
— Monday, 23 August 2027 · 11:00 AM IST · St. Thomas Valiyapally, Ranni, Kerala, India.

| Page | Address |
| --- | --- |
| Wedding website | https://ayvonbiji.github.io/Ayvon-Aksa-wedding-2027/ |
| Guest photo upload | https://ayvonbiji.github.io/Ayvon-Aksa-wedding-2027/upload-memories/ |
| Owner approval page (private) | https://ayvonbiji.github.io/Ayvon-Aksa-wedding-2027/manage-memories/ |

Vite + React + TypeScript. Guest photo uploads use Supabase (free tier). No analytics,
no tracking, no secret keys in the website.

---

## Quick start

```bash
npm install          # once
npm run dev          # http://localhost:5173/Ayvon-Aksa-wedding-2027/
npm test             # unit + database-security tests
npm run build        # regenerates logos/QR codes/social image, type-checks, builds to /dist
npm run build:docs   # build + copy into docs/ (what GitHub Pages serves)
```

Node.js 22.6 or newer.

### Deploying

GitHub → **Settings → Pages** is set to **Deploy from a branch → `main` → `/docs`**. Keep it that way.

Push to `main`. The workflow in `.github/workflows/deploy.yml` runs the tests, rebuilds
the site into `docs/` and commits it; GitHub Pages then publishes `docs/` (about 1–2 minutes).
You can also run `npm run build:docs` yourself and commit `docs/`.

> **Why the site was blank before:** Pages was serving the un-built source
> (`index.html` → `/src/main.tsx`, which browsers cannot run), and then pointed at a
> `docs/` folder that didn't exist yet. The built site now lives in `docs/`.

---

## Where to change things

| What | File |
| --- | --- |
| Names, wedding date & time, venue, map link, site URL, messages, music, upload limits | `src/config/wedding.ts` |
| Engagement (18 Aug 2027, 5:00 PM, St. John's, Chingavanam) | `src/config/wedding.ts` → `engagement` |
| Love story chapters | `src/content/story.ts` |
| Your personal photo gallery | `src/content/gallery.ts` |
| Colours, fonts, spacing (design tokens) | top of `src/styles/global.css` |
| Floral & ornament artwork | `src/art/ornaments.js` |
| Monogram & wordmark artwork | `scripts/logo-art.mjs` |
| Logos, favicons, social image, QR codes, QR card generator | `scripts/build-assets.mjs` |
| Guest-photo database & security rules | `supabase/migrations/001_wedding_memories.sql` |

### Event cards ("Our Special Days")

Two matching cards, **Engagement first, Wedding second** (on phones they stack in the same
order). Both come from one `EventCard` component in `src/components/WeddingDay.tsx`;
the data lives in `src/config/wedding.ts`:

* `engagement` — Wednesday, 18 August 2027, 5:00 PM IST, St. John's Knanaya Jacobite
  Church (Puthenpally), GG8F+GX8, SH 1, Chingavanam, Kerala 686531, India.
* `ceremony` — Monday, 23 August 2027, 11:00 AM IST, St. Thomas Valiyapally, Ranni.

Each has its own Get Directions, Apple/Outlook (.ics) and Google Calendar buttons;
change the length with `durationMinutes`. Clearing `engagement.venue` brings back
"Venue to be announced" and hides Directions. The countdown always targets the wedding.

### Love story

Each chapter in `src/content/story.ts` is one `{ … }` block (title, text, and optional
date, place, image, imageAlt, caption, note). Add, delete or move blocks to change the
timeline. `chapters: []` shows the "Our story is waiting to be told" placeholder.

### Your gallery photos (separate from guest memories)

1. Put originals in `photos/` (git-ignored, so originals are never published).
2. `npm run images` → optimised `.webp` files in `public/images/gallery/`
   (metadata/GPS removed). Sideways photo: `npm run images -- --rotate=name:90`.
3. Add an entry to `src/content/gallery.ts` (`src`, `thumb`, `alt`, `caption`,
   `orientation`, `position` to adjust cropping).

---

## Design

**Palette** (tokens in `src/styles/global.css`): ivory `#FBF6EE` & champagne `#F3E6D0`
paper · burgundy `#6B1E33` / wine `#8A2E45` / deep `#4A1222` · antique gold `#B08A4A`
(small gold text uses `#7A5A24` for readable contrast) · deep sage `#4F6046` botanicals ·
ink `#2F2224`. Burgundy bands frame the page (invitation cover, verse, footer).

**Type:** names and titles in **Corinthia** (its capital **A** is unmistakable);
Cinzel Roman capitals for dates and labels; Cormorant Garamond for text. All fonts are
self-hosted.

**Monogram:** two Roman capital **A**s — gold for Ayvon, burgundy for Aksa — interlaced
with a script ampersand, inside a gold ring with a laurel and rose.

**Opening invitation** (`src/components/InvitationCover.tsx`, `src/styles/cover.css`):
1. Welcome — burgundy velvet, rose arrangements, hanging gold pendant, falling petals,
   gold particles; "You are cordially invited", envelope, names and date fade in.
2. Open Invitation — the wax seal (`public/brand/wax-seal.svg`) lifts, the flap opens in
   3D, the letter rises and petals burst out.
3. The invitation card — names, invitation line, date, time and venue appear in sequence.
4. Continue to Our Wedding — the card lifts away into the website.
**Skip** (top right) or **Escape** goes straight to the website at any time; links with a
`#section` skip the cover. Reduced motion: no particles or 3D, instant fades.

**Animations** (all disabled or reduced for visitors who prefer reduced motion):
envelope opening · staggered name/date entrance with a soft blur-in · glowing gold
monogram · drifting gold sparkles, falling petals and swaying bouquets · section reveals
(rise, slide in from alternating sides on the story timeline, zoom on the gallery) ·
countdown digits roll in when they change · tile/card hover lift · gallery hover zoom ·
lightbox fade/zoom open, direction-aware slides, animated close · sliding gold
indicator under the active menu link · circular-reveal mobile menu with staggered
links · gold sheen sweep on buttons · footer ring that draws itself around the monogram.

### Logo assets (`public/brand/`)

| File | Use |
| --- | --- |
| `monogram.svg`, `monogram-transparent.png` | Primary A & A monogram (transparent) |
| `monogram-ivory.svg` / `.png` | Monogram on ivory |
| `monogram-mono.svg`, `monogram-mono-white.svg` | Single-colour versions |
| `wordmark.svg`, `wordmark-transparent.png`, `wordmark-mono.svg` | "Ayvon & Aksa" |
| `logo-header.svg` | Compact logo (header, wax seal) |
| `logo-invitation.svg`, `logo-invitation-transparent.png` | Monogram + wordmark + date for print |
| `/favicon.svg`, `/favicon-32.png`, `/apple-touch-icon.png`, `/icon-192.png`, `/icon-512.png` | Icons |

All are pure vector paths generated by `npm run assets`.

---

## Wedding invitation card (`#invitation`)

The "Our Wedding Invitation" section shows the invitation as a real web card
(`src/components/WeddingInvitation.tsx`, styles in `src/styles/invitation.css`),
with a full-screen view, a Print button (prints only the card on A4) and two downloads:

| File | What it is |
| --- | --- |
| `public/downloads/ayvon-aksa-wedding-invitation.pdf` | Page 1: 6 × 9 in card · Page 2: the card centred on A4 |
| `public/downloads/ayvon-aksa-wedding-invitation.jpg` | 1800 × 2700 px image for WhatsApp |

**To change the wording**, edit `src/config/wedding.ts`:
- names, parents and house names → `groom` / `bride` (`parents`, `house`, `relation`)
- dates, times, venues → `engagement` / `ceremony`
- verse, title, invitation sentence, closing line, photo → `invitation`

Then run `npm run build:docs` (or just push — the workflow rebuilds). The PDF and
image are regenerated from the same config by `scripts/invitation-card.mjs`
(part of `npm run assets`). The couple photo on the card is a background-removed
copy of `ayvon-aksa-01` in `public/images/invitation/`.

## QR codes & printable card (`public/qr/`)

| File | Opens |
| --- | --- |
| `ayvon-aksa-wedding-website-qr.png` / `.svg` — "Scan to Visit Our Wedding Website" | https://ayvonbiji.github.io/Ayvon-Aksa-wedding-2027/ |
| `ayvon-aksa-upload-memories-qr.png` / `.svg` — "Scan to Share Your Wedding Memories" | https://ayvonbiji.github.io/Ayvon-Aksa-wedding-2027/upload-memories/ |
| `ayvon-aksa-qr-card.pdf` | Page 1: 5 × 7 in card · Page 2: two cards on A4 landscape |
| `ayvon-aksa-qr-card.png` / `.svg` | Same card, 1500 × 2100 px (300 dpi) |
| `QR-DESTINATIONS.txt` | The exact URLs encoded |

The website QR has the monogram in the centre and the upload QR a camera icon, so
guests can tell them apart. Both use error-correction level H with a 4-module quiet
zone; the centre badge covers 4% of the code. Both were verified by decoding the files,
including at small print sizes. The site also shows both codes with PNG/SVG download
buttons, generated live from the configured URL.

**Printing:** open the PDF and print at **100% / actual size** (not "fit to page") on
matte card stock. Page 2 prints two cards per A4 sheet to cut out.

**If the address changes** (e.g. a custom domain): change `siteUrl` in
`src/config/wedding.ts` (keep the trailing `/`), run `npm run build:docs`, commit and
push. Reprint any QR codes — old printed codes keep pointing at the old address.

---

## Guest photo uploads — "Our Wedding Memories"

### How it works

1. A guest scans the upload QR → **/upload-memories/**: Upload Photos (library) or
   Take a Photo (camera), multiple photos, previews, remove before sending, optional name
   + "show my name" consent, optional caption per photo, progress bars, success/error
   messages, retry on failure.
2. In the browser each photo is checked by its real file signature (not the extension),
   decoded (rejects damaged files), resized to 2560 px and re-saved as JPEG — which also
   strips GPS/camera data. Duplicates are refused.
3. The database reserves a private storage slot (with type, size, rate-limit and
   duplicate checks), the photo uploads into the **private** `wedding-memories` bucket, and
   the record becomes **pending**.
4. You approve or reject on **/manage-memories/**. Only **approved** photos appear in
   "Our Wedding Memories" on the homepage (live, refreshes every minute, "Show more"
   paging, lightbox with swipe). Pending, rejected and removed photos stay hidden.
5. Guests can remove photos they shared from the same phone ("Photos you shared from this
   device → Remove"). You can delete anything permanently.

Your personal gallery ("Our Moments") and guest memories are completely separate.

### One-time setup (about 10 minutes)

1. Create a free project at **https://supabase.com** (any region; Mumbai is closest).
2. **SQL Editor → New query** → paste all of `supabase/migrations/001_wedding_memories.sql`
   → **Run**. This creates the table, private storage bucket, security rules, limits and
   functions. Safe to run again.
3. **Authentication → Users → Add user → Create new user**: your e-mail + a strong
   password, tick **Auto Confirm User**. (Add Aksa the same way if she should also
   approve photos.)
4. Make yourselves owners — SQL Editor:
   ```sql
   insert into public.memory_admins (email) values ('ayvonjosephbiji720@gmail.com');
   -- insert into public.memory_admins (email) values ('aksa@example.com');
   ```
   Use lower-case e-mails exactly as created in step 3.
5. **Project Settings → API**: copy the **Project URL** and the **anon / public** key.
6. Connect the website (writes both values into `src/config/wedding.ts`, refuses the
   secret key, and checks the database if it can reach it):
   ```bash
   npm run connect-memories -- https://YOUR-PROJECT.supabase.co YOUR_ANON_PUBLIC_KEY
   npm run build:docs
   git add -A && git commit -m "Connect photo uploads" && git push
   ```
   (Alternatively edit `memories.supabaseUrl` / `memories.supabaseAnonKey` by hand, or set
   repository variables `SUPABASE_URL` and `SUPABASE_ANON_KEY` for the build.)
7. Open **/manage-memories/** → **Check setup**: every line should show ✓. Then scan the
   upload QR on your phone, upload a test photo, approve it on /manage-memories/, and
   refresh the homepage — it appears under "Our Wedding Memories".

**Why the upload page says "Photo sharing opens soon":** that message appears only while
step 6 hasn't been done (no Supabase URL/key in the website). It disappears automatically
once the keys are added and the site is rebuilt. /manage-memories/ shows exactly which
step is missing.

> The **anon** key is designed to be public; all protection is in the database rules.
> **Never** put the `service_role` key in this project.

Until steps 1–6 are done, the upload page shows "Photo sharing opens soon" and the
homepage shows the invitation to share photos, so nothing looks broken.

### Approving and deleting photos

Open **/manage-memories/**, sign in with the e-mail/password from step 3. Tabs:
Pending · Approved · Rejected · Removed. Approve/Reject/Delete one photo or select
several. "Guest uploads open" turns uploading on/off (e.g. a few weeks after the wedding).
Accounts not listed in `memory_admins` see nothing.

### Where photos are stored

Supabase → **Storage → `wedding-memories`** (private) under `guests/YYYY-MM-DD/…jpg`;
records in **Table Editor → `memories`**. Download everything from Storage any time.

### Limits (change in Table Editor → `memory_settings`)

10 MB per stored photo · 40 uploads per visitor per hour · 200 per day · 4,000 total per
day · uploads open/closed. Browser-side limits (20 photos at a time, 30 MB per original,
2560 px) are in `wedding.memories` in `src/config/wedding.ts`.

---

## Testing

* `npm test` — 26 checks, including: 11:00 IST = 05:30 UTC on Monday 23 Aug 2027, the
  countdown never goes negative, a single `.ics` event 11:00–13:00 `Asia/Kolkata`, no stale
  ceremony time anywhere, no other event types, and **14 database-security tests** that run the
  SQL migration on a real (embedded) Postgres: guests cannot read/write tables, uploads
  only into reserved slots, type/size/duplicate/rate limits, only approved photos are
  public, names shown only with consent, only owners can approve/delete.
* Preview any moment by adding `?now=` (use `%2B` for `+`):
  `…/?now=2027-08-23T11:01:00%2B05:30` (after the ceremony) or
  `…/?now=2027-08-23T10:59:00%2B05:30` (one minute before).
* **Calendar:** "Apple / Outlook (.ics)" downloads the event (with a reminder the day
  before); "Google Calendar" opens a pre-filled event. Change the length with
  `ceremony.durationMinutes`.

---

## Notes & limitations

* **Venue map:** no verified coordinates were available, so "Get Directions" uses a Google
  Maps search for St. Thomas Valiyapally, Ranni. For a pin-exact link, open the church in
  Google Maps → Share → Copy link, and paste into `ceremony.mapsUrl`.
* **HEIC:** iPhones convert photos to JPEG when picked from Photos. If a browser cannot
  open a HEIC file, the guest sees how to fix it.
* **File checks on the server:** the database enforces type, size, path, rate limits and
  moderation; byte-level image validation happens in the browser. Anything that slips past
  is never public unless you approve it.
* **Music:** `public/audio/canon-in-d-music-box.mp3` is an original synthesised arrangement
  of Pachelbel's Canon in D (public-domain composition), made by `scripts/make-music.py`.
  It is off until a visitor presses play.
