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
Breathe (30s, starts straight from home's "Begin a moment") → "Before you go" (reflection and action on one calm screen, both optional) → Close.
- Breathing is a fixed gentle 4s inhale / 4s exhale with no hold. It guides, it doesn't force:
  people can pause, skip, exit, or simply rest without following the lines.
- Breath cues are announced politely to screen readers; there is no progress bar. Escape never discards typed words.
- One optional question: "What would make the rest of today feel more meaningful?"
- Six action invitations (Reconnect, Create, Step Outside, Let Go, Make Space,
  Follow Your Curiosity) plus "Choose my own action". Keep wording soft and concise.
- The close is calm: no counts, scores or "well done". If an action was chosen it is shown large with "The screen can wait." and "I'm heading off"; otherwise "Done". A subtle "View my journey" remains.
- Sound is an opt-in setting (`sound`, off by default): a very soft tone that follows the breath and stops on pause. Never autoplay.

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
- Home asks gentle follow-ups (up to three per visit, newest first, "Ask me later" to skip) about unrevisited intentions (`HomeExtras`), and shows "My journey" only once a Moment exists. Settings is a small footer link until reminders are real.
- No persistent menu. Home (`/`) is the hub; every screen has the "Still" wordmark (`SiteMark`) top-left
  as the one way back to the beginning (hidden during the breathing step). Moment keeps Exit.

## Visual design principles

- **Immersive and contemplative.** One quiet focal element (fine breathing lines); everything else recedes.
- **Pastel dawn, light only.** A soft sky of pink, white light and periwinkle (`SkyBackground`), deep violet ink
  (`#2a1a5e`) for text, and a pink-to-periwinkle gradient pill for the primary action. Reference: the
  "Serenity Session" phone screen. Use theme tokens in `globals.css`, not hard-coded colors.
- **Breathing lines, not a ball.** `BreathingLines`: a handful of fine gradient lines that gather into a swell
  on the inhale and flatten on the exhale, over a pool of light. No orb.
- **Time-of-day sky.** `useSky` tints the sky by local hour (dawn, day, dusk, night); always light enough for ink text.
- **Type.** Fraunces (serif display) for headings, the wordmark and reflections; DM Sans for UI text.
- **Space.** Generous whitespace, a narrow reading column, few elements per screen.
- **Motion.** One `--breath` value (0..1) drives the lines, the pool of light and the clouds so they stay in sync
  (own 4s/4s loop on home, journey and settings; driven by the guided breath on /moment).
  Always respect `prefers-reduced-motion` (the lines rest and only gently brighten).
- **Accessible.** WCAG AA contrast, visible focus, 44px touch targets, keyboard support.

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
- `src/lib/` `breath.ts` (timing), `sky.ts`, `sound.ts`, `preferences.ts` and `journey.ts` (localStorage stores), `actions.ts` (action copy)
- `src/styles/` global styles, theme and breathing-line tokens
- `public/assets/` static images, icons, fonts
- `docs/` product and design documentation

### Conventions
- Import from `src` with the `@/` alias.
- Server components by default; add `"use client"` only when needed (state, effects, browser APIs).
- Style with Tailwind utilities and theme tokens. Reuse `Button`, `RadioCard` and `BreathingLines`.
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
