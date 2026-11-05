# Still

Still is a sensory experience for intentional living, not a wellness productivity app.

## Product vision

**Still Moments** are brief, permission-based invitations to pause, reconnect with
yourself, and take one meaningful action away from the screen.

- The goal is to help people pause, reconnect, and act in the real world, then leave the app.
- It should feel like an immersive, contemplative experience, not a tool to optimize yourself.
- Everything is an invitation. Nothing is required, and every step can be skipped.
- Privacy first: reflections and intentions are saved only on the user's device (localStorage),
  can be saved or skipped, and are easy to edit and delete. Nothing is sent anywhere.

### Never build
- Scores, streaks, badges, achievement indicators, or progress-to-goal mechanics.
- Dashboards, charts, percentages, or progress bars that turn reflection into metrics.
- Guilt-driven copy, urgency, or dark patterns.

### The Moment flow (`/moment`)
Arrive → Breathe (30s) → Reflect (optional) → Act (optional) → Close.
- Breathing is a fixed gentle 4s inhale / 4s exhale with no hold. It guides, it doesn't force:
  people can pause, skip, exit, or simply rest without following the orb.
- One optional question: "What would make the rest of today feel more meaningful?"
- Six action invitations (Reconnect, Create, Step Outside, Let Go, Make Space,
  Follow Your Curiosity) plus "Choose my own action". Keep wording soft and concise.
- The close is calm: no counts, scores or "well done". It offers "Done" and a subtle "View my journey".

### My Journey (`/journey`)
- A chronological, editorial history of completed Moments with saved reflections and intentions.
- Counts are plain sentences, never tiles or bars: Moments taken; intentions chosen; intentions
  revisited (any follow-up recorded); intentions acted upon (only "I did it").
- Follow-up is neutral and optional: "I did it", "Not yet", "My priorities changed". None is framed as better.
- Never invent data: a Moment shows only what the person actually gave. No placeholders.
- A landscape visualization (`JourneyLandscape`): each Moment is one light on a misty ridge, oldest to newest.
  A ring marks a kept reflection; a small star marks an intention. Lights are evenly spaced, so gaps between
  visits are never shown. It never counts, scores, or measures progress.
- Everything is editable and deletable (per reflection, per intention, per Moment, or all data).

### Navigation
- No persistent menu. Home (`/`) is the hub; every screen has the "Still" wordmark (`SiteMark`) top-left
  as the one way back to the beginning (hidden during the breathing step). Moment keeps Exit.

## Visual design principles

- **Immersive and contemplative.** One luminous, organic orb at the center; everything else recedes.
- **Purple branding.** Deep indigo night (dark) and soft lavender (light), with violet `#7e75ff` / `#ac84ff`,
  blush `#fedeea`, and ink `#231332`. Misty layered hills, a lavender gradient pill for the primary action.
  Use theme tokens in `globals.css`, not hard-coded colors.
- **Type.** Cormorant Garamond (serif) for headings, reflections and the wordmark; DM Sans for UI text.
- **Space.** Generous whitespace, a narrow reading column, few elements per screen.
- **Soft type.** Light to regular weights, comfortable line height.
- **Supportive atmosphere.** Rings, glow, and background wash follow the breath and stay subtle.
- **Motion.** One `--breath` value (0..1) drives the orb and atmosphere so they stay in sync.
  Always respect `prefers-reduced-motion` (the orb rests and only gently brightens).
- **Accessible.** WCAG AA contrast, visible focus, 44px touch targets, keyboard support, light and dark themes.

## Development guidelines

### Stack
Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict), Tailwind CSS v4. Package manager: npm.
`AGENTS.md` notes this Next.js version has breaking changes: read the matching guide in
`node_modules/next/dist/docs/` before writing Next.js code.

### Commands
- `npm run dev` — dev server (http://localhost:3000)
- `npm run build` — production build (must pass before pushing)
- `npm run lint` — ESLint (must pass before pushing)

### Structure
- `src/app/` routes: `/` welcome, `/moment`, `/journey`, `/settings`
- `src/components/` shared UI; `moment/` and `settings/` hold feature components; `ui/` holds Button and RadioCard
- `src/lib/` `breath.ts` (timing), `preferences.ts` and `journey.ts` (localStorage stores), `actions.ts` (action copy)
- `src/styles/` global styles, theme and orb tokens
- `public/assets/` static images, icons, fonts
- `docs/` product and design documentation

### Conventions
- Import from `src` with the `@/` alias.
- Server components by default; add `"use client"` only when needed (state, effects, browser APIs).
- Style with Tailwind utilities and theme tokens. Reuse `Button`, `RadioCard` and `BreathingOrb`.
- Use native, semantic controls and label every interactive element.
- Keep components small, typed, and PascalCase.

### Prototype scope (important)
- Data persists in `localStorage` only: `still:preferences` and `still:journey` (versioned: `{ version, moments }`).
  Reads validate and never overwrite; an original that needed migrating or had skipped records is kept
  once under `still:journey:backup` (removed by "Delete all my journey data"). No accounts, no backend.
- **Do not** add real system notifications, push subscriptions, service workers, background
  reminders or scheduling, and **never** request notification permission, until explicitly planned.
- "Preview reminder" is an in-app card only.

### Secrets and git
- Never commit secrets. Use `.env.local`; keep `.env.example` current with variable names only.
- `node_modules`, `.next`, and build output are git-ignored.
- Small, focused commits with clear messages.
