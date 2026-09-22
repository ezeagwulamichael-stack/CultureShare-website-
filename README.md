# CultureShare — Landing Page

Pre-launch marketing site for CultureShare, built in plain HTML, CSS and JavaScript.
No build step, no dependencies.

## Preview locally

```bash
cd "CultureShare Website"
python3 -m http.server 5173
```

Open <http://localhost:5173>

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The full landing page |
| `css/style.css` | Styling, design tokens, responsive rules |
| `js/main.js` | Hero capsule collage, reveals, parallax, waitlist flow |
| `assets/fonts/` | Mileast, converted to WOFF2 for the web |
| `assets/img/hero-base.jpg` | Hero artwork, sphere blurred to ambient glow |
| `assets/img/app-*.webp` | Real CultureShare app screens, re-encoded for the web |
| `assets/img/hero-sphere.webp` | The sphere's structure alone, on transparency |
| `assets/favicon.svg` | Browser tab icon |
| `Fonts/mileast/` | The original OTF files as supplied |

## Type

- **Headings — Mileast**, a display serif supplied in `Fonts/mileast/`. Converted
  from OTF to WOFF2 (`assets/fonts/`) and loaded with `@font-face`; the regular
  weight is preloaded.
- **Body — Urbanist** (Google Fonts).
- Mileast is a single-weight face with no `∞` glyph, so the "Stories to Tell"
  stat falls back to Urbanist for that one character.

> **Licensing:** the supplied Mileast files are the demo release, which its
> `NOTE !!!!.txt` restricts to **personal use only**. A commercial licence must
> be bought from sronstudio.com before this site goes live.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| Green | `#173528` | Surfaces, headings, buttons |
| Deep green | `#0E2018` | Hero scrim, waitlist, modal |
| Gold | `#DEC279` | Accents, CTAs, active states |
| Warm off-white | `#FDFAF2` / `#F5F1E4` | Page and section backgrounds |

## Sections

Hero · Cultural Problem (arc + stats) · A Living Archive · Why CultureShare ·
Explore Beyond · Meet the Community · Manifesto · How It Works · App Preview ·
Join the Waitlist (closing CTA) · Footer

## Interactions

- **Hero:** the artwork is split into two layers — a base plate whose sphere has
  been blurred down to ambient glow, and the sphere's structure isolated on
  transparency above it, turning once every 78s. The glow and the light beam
  stay put while only the mesh rotates. Both layers are centred on the sphere,
  so the spin axis is simply the element centre. A neutral near-black scrim
  (soft plate under the type, vignette, top/bottom floor) keeps the artwork's
  own colour while the copy holds ~11:1 contrast. The
  headline carries inline pill-shaped image capsules that fade between three
  photos each on a rotating cycle, drift with the pointer, and wipe open on
  load. Words rise into place with a stagger; the block parallaxes and
  dissolves on scroll.
- **Cultural Problem:** seven photographs arc into a dome over a radial tick
  ring, swinging up and scaling in from the centre outwards. Hovering a card
  pops it off the arc — it lifts along the radius, straightens, grows and gains
  a white ring, while the rest of the arc fades back so it reads as the focus.
  Card angle and lean come from a single `--a` custom property per card; the arc
  radius, card size and top gap are section-level variables, and the tick ring
  is positioned to share the card circle's centre so it traces them exactly.
- **A Living Archive:** editorial split — a statement panel that ends on a bold
  closing line, an arrow tile and a media tile beneath it, and a full-bleed
  feature portrait with a live chip and vertical social marks.
- Animated stat counters
- **Explore:** the four-image strip expands the panel you hover or focus
- **Why CultureShare:** an oversized headline unrolls word by word, then five
  pillar cards each carry their own abstract illustration — nested horizons,
  overlapping fields, a closing seal, radiating arcs, two bodies in orbit. The
  row drifts at five different rates as it passes, so it breathes rather than
  moving as one slab; hovering a card lifts it and swells its illustration. The
  parallax composes through a `--py` custom property so it never fights the
  hover transform.
- **Meet the Community:** a two-column split — statement left, a collage of five
  floating cards right. Each card bobs on its own loop (6.4s–9.4s, out of phase)
  and drifts toward the pointer at its own depth. The float keyframes own
  `transform` while the parallax writes `translate`, so the two compose instead
  of overwriting each other; depths are cached and writes are rAF-throttled.
- Manifesto and step cards lift on hover
- **App Preview:** a dark section carrying the real CultureShare app screens in
  a tilted 3D stack, with a glass callout and a gold stat badge. The whole stack
  eases open on hover.
- **Closing CTA:** a curved carousel — a looping row of ten cultural panels,
  each leaned toward the frame centre so the strip reads as a convex arc. It
  drifts on its own, pauses on hover, and can be dragged and flicked with
  momentum. Panel positions are computed arithmetically rather than with
  `getBoundingClientRect`, so no layout is forced per frame, and the loop only
  runs while the section is on screen.
- Waitlist with inline validation, duplicate detection and a success modal
- Preloader, scroll progress, auto-hiding header, magnetic buttons, mobile menu
- Respects `prefers-reduced-motion`

## Before production

- Buy a commercial Mileast licence (see above).
- Photography is loaded from Pexels CDN URLs as placeholders. Swap for licensed
  or commissioned CultureShare imagery.
- The waitlist stores emails in `localStorage` only — connect the `wlForm`
  submit handler in `js/main.js` to your email service.
- `About Us` points at the Living Archive section and `Contact Us` at the
  footer; repoint both once those pages exist.
- The waitlist CTA and the final CTA are now one section. "Join the CultureShare
  waitlist." was dropped from the merge as redundant beside the form and its
  button — restore it if you want that line kept.
