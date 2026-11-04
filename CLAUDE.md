# Still

Still is a mindfulness and reflection app.

> Draft: the vision and design sections below are a starting point written
> without detailed input. Items marked (assumed) are guesses. Edit freely.

## Product vision

- Still gives people a calm, private place to pause, notice how they feel, and reflect.
- It should feel like exhaling, not like another feed or task list.
- Core ideas (assumed): short guided pauses, simple journaling prompts, and a gentle
  history to look back on. No streak pressure, no gamification, no ads.
- Privacy first: reflections belong to the user.

## Visual design principles

- **Calm over clever.** Quiet, warm neutrals; one soft accent at most (assumed).
- **Space.** Generous whitespace and a narrow reading column. Fewer elements per screen.
- **Soft type.** Light to regular weights, comfortable line height, no shouting.
- **Gentle motion.** Slow, subtle transitions. Always respect `prefers-reduced-motion`.
- **Accessible.** WCAG AA contrast, visible focus states, keyboard support, light and dark themes.
- **Honest UI.** No dark patterns, guilt-driven copy, or intrusive notifications.

## Development guidelines

### Stack
Next.js (App Router), React, TypeScript (strict), Tailwind CSS. Package manager: npm.

### Commands
- `npm run dev` — dev server
- `npm run build` — production build (must pass before pushing)
- `npm run lint` — ESLint (must pass before pushing)

### Structure
- `src/app/` routes and layouts
- `src/components/` shared UI components
- `src/lib/` utilities and helpers
- `src/styles/` global styles (Tailwind theme tokens live in `globals.css`)
- `public/assets/` static images, icons, fonts
- `docs/` product and design documentation

### Conventions
- Import from `src` with the `@/` alias.
- Server components by default; add `"use client"` only when needed.
- Style with Tailwind utilities and theme tokens; avoid custom CSS and hard-coded colors.
- Keep components small, typed, and named in PascalCase; files in `src/components` match the component name.
- Prefer semantic HTML and label every interactive control.

### Secrets and git
- Never commit secrets. Use `.env.local`; keep `.env.example` current with variable names only.
- `node_modules`, `.next`, and build output are git-ignored.
- Small, focused commits with clear messages.
