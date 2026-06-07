# Components — scoped rules

## Card pattern
- All cards use the 4px left border pattern — never full border, never inline styles
- The 4px bar is always `border-l-4` with the type-specific Tailwind accent token
- No `border` (full border) on exercise cards

## Colors
- Exercise type colors via Tailwind tokens only: `bg-lower-body`, `bg-upper-body`, `bg-abs-core`, `bg-peak-8` (and their `-fill` / `-ink` variants)
- No hardcoded hex values anywhere in JSX — always use palette tokens from `tailwind.config.js`
- Backgrounds: `bg-page`, `bg-cream`, `bg-beige`; borders: `border-taupe`, `border-taupe-dark`
- Text: `text-ink`, `text-ink-muted`

## Typography
- Sentence case everywhere — never Title Case on labels, buttons, or headings
- Font weight never above 500 (`font-medium`) — no `font-semibold`, `font-bold`, or `font-extrabold`
- Use type-scale tokens: `text-h1-warm`, `text-h2-warm`, `text-h3-warm`, `text-sm-warm`, `text-xs-warm`, `text-tiny`, `text-micro`

## Layout
- No inline styles (`style={{...}}`) — Tailwind utility classes only
- No CSS modules — use globals.css + tailwind.config.js tokens
- `rounded-card` (10px) for cards, `rounded-input` (6px) for inputs

## Exports
- Named exports only — no default exports
