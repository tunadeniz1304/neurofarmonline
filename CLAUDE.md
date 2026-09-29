# NeuroFarm Website

Marketing / investor site for NeuroFarm (neuromorphic edge AI for agriculture), served at https://neurofarm.nl.

## Git rules

- **Never add `Co-Authored-By: Claude ...` (or any Claude/AI co-author/attribution line) to commit messages or PR descriptions.** Commits are authored by the repo owner only.
- Work on feature branches (e.g. `enhanceUI`); `master` is production.

## Stack

- Astro 4 (static output) + Tailwind CSS 3 (`@astrojs/tailwind`, `applyBaseStyles: false`; base styles live in `src/styles/global.css`).
- No UI framework — components are `.astro` files, client behaviour is plain TypeScript in `<script>` tags or `src/scripts/`.
- Deployed on Vercel from GitHub (push → auto deploy). Domain DNS is at GoDaddy.

## Commands

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview
```

## Structure

- `src/pages/index.astro` — single-page site; composes the section components in order.
- `src/components/*.astro` — one component per section (Hero, Problem, Solution, Technology, Market, Traction, Roadmap, Team, Contact) plus Navbar/Footer.
- `src/layouts/Layout.astro` — `<head>`, meta/OG tags, fonts.
- `src/styles/global.css` — design tokens, base styles, shared component classes.
- `src/scripts/` — scroll reveal, counters, canvas effects.

## Investor "wow" criteria

Every change to the site is judged against these. A section that fails one of them is not done.

1. **5-second hook** — above the fold an investor sees the category (neuromorphic edge AI for agriculture), the one-line promise and a live visual of the product idea (the `5 → 32 → 16 → 3` spiking network canvas). One primary CTA.
2. **Show, don't claim** — prefer interactive or animated proof (code morph, scenario demo, spike raster) over adjectives.
3. **Credibility density** — concrete, verifiable technical facts (architecture, params, MACs, pre-registration, test count, baselines) instead of vague superlatives. Any illustrative/simulated visual must be labelled as such.
4. **Narrative arc** — Problem → Technology → Proof (demo + science) → Market → Traction/Roadmap → Team → Ask. Every section ends pointing forward.
5. **Premium craft** — consistent dark "bioluminescent" palette, Geist / Geist Mono / Instrument Serif type system, 8px spacing rhythm, no template look, no emoji icons, no stock photos.
6. **Performance & accessibility** — no heavy libraries, canvas animations pause off-screen, `prefers-reduced-motion` honoured, WCAG AA contrast, visible focus, keyboard-operable controls, no horizontal scroll at 375px.
7. **Clear ask** — investor CTA in the nav, hero and a dedicated contact section with an async form and explicit success/error states.

## Design conventions

- Dark, premium deep-tech look. Colours come from the `nf` palette in `tailwind.config.mjs` — don't hardcode hex values in components.
- Icons are inline SVG (no emoji icons).
- Every animation must respect `prefers-reduced-motion`.
- Content must be factual: numbers, partners and traction claims must come from the NeuroFarm source material (github.com/tunadeniz1304/Neurofarm1) — never invent metrics, customers or quotes.
- Contact form posts to Formspree (`https://formspree.io/f/mjgapvpo`).
