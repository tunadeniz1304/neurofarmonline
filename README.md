# neurofarm.nl

Investor-facing website for **NeuroFarm — the offline brain for agriculture**: closed-loop crop control powered by a single spiking neural network on neuromorphic edge hardware.

Built with [Astro](https://astro.build) as a fully static site — no UI framework, no CSS framework, a few kilobytes of TypeScript.

## Getting started

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # type-check + static build into dist/
npm run preview   # serve the production build locally
```

Requires Node 18.17+ (Node 20+ recommended).

## Project structure

```
public/
  favicon.svg
src/
  assets/team/            founder portraits (optimised to WebP at build time)
  components/
    layout/               SiteHeader, SiteFooter, Logo
    sections/             one component per page section, in page order
    figures/              ClosedLoopFigure (Fig. 1 canvas + controls)
    ui/                   SectionHeading
  data/site.ts            every fact, number and label shown on the site
  layouts/BaseLayout.astro  <head>, meta tags, fonts, skip link
  pages/index.astro       composes the sections
  scripts/
    closed-loop/          Fig. 1 animation: config, geometry, simulation, renderer, mount
    contact-form.ts       async Formspree submit with success/error states
    nav-menu.ts           mobile menu
    reveal.ts             scroll reveal
  styles/
    tokens.css            colours, fonts, spacing
    global.css            base styles and shared classes
```

## Editing content

- **Facts and copy lists** live in `src/data/site.ts`. Only publish verified facts — there are no measured performance results yet, and no metrics, partners, customers or quotes may be invented.
- **Section headings and prose** live in the matching component in `src/components/sections/`.
- **Colours** are CSS custom properties in `src/styles/tokens.css`; the canvas reads them at runtime.
- **Team photos**: drop a square image named after the `photo` slug in `site.ts` into `src/assets/team/`.

## Fig. 1 — the closed-loop animation

`src/scripts/closed-loop/` draws an *illustrative* animation of one control decision: input spikes on five sensor lanes, a forward pass through the `5 → 32 → 16 → 3` network every simulated five minutes, and three actuator levels. Scenario rates in `config.ts` are invented for explanation and are labelled as such on the page. The animation pauses off-screen, has a Pause/Play control, and starts paused when the visitor prefers reduced motion.

## Contact form

Posts to Formspree (`https://formspree.io/f/mjgapvpo`) with the fields `name`, `email`, `organisation`, `interest_type`, `message`. With JavaScript it submits in place and shows a status message; without JavaScript it falls back to a normal form post.

## Deployment

Static output in `dist/`. Vercel detects Astro automatically — push to GitHub and it deploys.
