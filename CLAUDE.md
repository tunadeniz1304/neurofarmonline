# NeuroFarm Website

Marketing / investor site for NeuroFarm (neuromorphic edge AI for agriculture), served at https://neurofarm.nl.

## Git rules

- **Never add `Co-Authored-By: Claude ...` (or any Claude/AI co-author/attribution line) to commit messages or PR descriptions.** Commits are authored by the repo owner only.
- Work on feature branches (e.g. `design2`); `master` is production.

## Stack

- Astro 5 (static output), plain scoped CSS — no Tailwind, no UI framework.
- Components are `.astro` files; client behaviour is TypeScript modules in `src/scripts/`, imported from component `<script>` tags.
- Images go through `astro:assets` (`<Image>`), so they are resized and converted at build time.
- Deployed on Vercel from GitHub (push → auto deploy). Domain DNS is at GoDaddy.

## Commands

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + static build to dist/
npm run preview
```

## Structure

- `src/pages/index.astro` — single-page site; composes the sections in order.
- `src/layouts/BaseLayout.astro` — `<head>`, meta/OG tags, fonts, skip link.
- `src/data/site.ts` — **all copy-level facts** (specs, pipeline, stats, roadmap, team, contact). Change facts here, not in components.
- `src/components/` — `layout/` (header, footer, logo), `ui/` (small shared pieces), `sections/` (one file per page section), `figures/` (the closed-loop canvas figure).
- `src/scripts/` — `closed-loop/` (canvas animation), `nav-menu.ts`, `reveal.ts`, `contact-form.ts`.
- `src/styles/` — `tokens.css` (colours, fonts, spacing), `global.css` (base + shared classes such as `.btn`, `.eyebrow`, `.h2`, `.panel`).

## Investor criteria

1. **5-second hook** — above the fold: category, one-line promise, the live closed-loop figure, one primary CTA.
2. **Show, don't claim** — animated/interactive explanation over adjectives.
3. **Credibility density** — concrete, verifiable technical facts. Every illustrative/simulated visual is labelled as such.
4. **Narrative arc** — Problem → How it works → Rigour → Roadmap → Market → Team → Ask.
5. **Craft** — "field instrument" look: soil-black ground, phosphor-lime (`--accent`) for neural activity, amber for actuators; Instrument Serif / Hanken Grotesk / JetBrains Mono. No emoji icons, no stock photos.
6. **Performance & accessibility** — no heavy libraries, canvas pauses off-screen, `prefers-reduced-motion` honoured, WCAG AA contrast, visible focus, keyboard-operable controls, no horizontal scroll at 375px.
7. **Clear ask** — investor CTA in the sticky header, hero and contact section; async form with explicit success/error states.

## Design conventions

- Colours come from CSS custom properties in `src/styles/tokens.css` — don't hardcode hex values in components (the canvas reads them via `getComputedStyle`).
- Icons are inline SVG.
- Content must be factual: numbers, partners and traction claims must come from the NeuroFarm source material — never invent metrics, customers, partners, logos or quotes. There are no measured performance results yet.
- Contact form posts to Formspree (`https://formspree.io/f/mjgapvpo`) with fields `name`, `email`, `organisation`, `interest_type`, `message`.
