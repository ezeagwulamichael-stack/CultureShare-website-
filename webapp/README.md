# CultureShare — Web App

The responsive web version of the CultureShare mobile app, built from the mobile
Figma designs (file `JH3ovcD0Y0h9DGtsZBmBIE`, page "Mobile App Designs") and the
web design specification. Separate from the static landing page in the repo root.

## Run it

```bash
cd webapp
npm install        # also runs scripts/fix-iconsax.mjs (see below)
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Stack

React 19 + TypeScript (Vite) · React Router · Zustand (state, persisted to
`localStorage` under `cs-web`) · Motion (animation) · Iconsax icons (the Vuesax
set used in the Figma file) · plain CSS with design tokens. Pages are lazy-loaded.

## Design system

- Brand: Dark Green `#1B4332`, Gold `#C9A84C` (from the brand rationale).
- Dark theme by default, matching the mobile app (emerald → near-black, cream
  text, gold accents). Light theme (cream, deep-green ink) via the sun/moon toggle
  or Settings → Appearance.
- Type: Bricolage Grotesque (headings), Urbanist (UI), both as in Figma.
- Tokens: `src/styles/tokens.css`. Layout breakpoints: 1440+ (sidebar + rail),
  1200–1439 (sidebar), 768–1199 (icon sidebar), <768 (mobile tab bar, matching the app).
- Images: real assets exported from the Figma file, in `public/img/` as WebP.

## Everything is clickable — against a local store

There is no backend yet. Every action (sign up, OTP, Raid, like, save to Museum,
comment, share to DM, create Scroll/Post/Status, Historian validation, community
admin, verification, plan change, Cowries) writes to `src/store/useApp.ts`, and
the actions are named so each one maps onto a future API call.

Prototype controls (clearly labelled) let you simulate things a backend would do:
advancing Scroll review, approving/rejecting verification, previewing the
Historian role (Settings → Account), and resetting demo data.

- Any 6-digit code verifies; `000000` shows the incorrect-code state.
- Any email with a 6+ character password logs in.

## Unresolved product decisions

Where the specification doesn't define a rule, the UI shows a "Needs product
decision" note instead of inventing one (plan media limits, Historian assignment
and permissions, Dark Zone moderation, community size limit, Scroll ownership after
sale, status repeat limits, location privacy, verification "race" values, and so on).
Search the code for `<Decision>` to list them.

Later-stage features (Wallet/Cowries, Buy/Sell Scroll, Hall of Fame, Family Profile
& Root Tree, Go Live, Share Location) live under "Coming later" in the sidebar and
are marked as previews.

## Notes

- `scripts/fix-iconsax.mjs` runs on postinstall: `iconsax-react` sets default
  colours via `defaultProps`, which React 19 ignores, so icons render invisible
  without it.
- Deploy as its own Vercel project with root directory `webapp/` (`vercel.json`
  includes the SPA rewrite). The root `.vercelignore` keeps it out of the landing
  page deploy.
