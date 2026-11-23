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
- Percentages, progress bars, goals, or charts that turn reflection into metrics. Calm cards and plain count pills are fine; never show gaps between visits.
- Guilt-driven copy, urgency, or dark patterns.

### Today and health setup
- On a first visit, welcome offers one guided breath or a direct route to Today. After the pause, people can save a first health entry or skip to the dashboard. The welcome is also available at `/welcome`.
- Today (`/`) offers the guided pause, a link to Journey, and four health spaces: Movement, Food & drink, Sleep, and Care & monitoring.
- Each space has a local log with editable entries. Care includes upcoming visits, visit notes, and readings. Today shows recent entries and the next visit.
- Optional setup (`/setup`) lets people order the health spaces, note ongoing conditions and monitoring priorities, and import selected categories from Apple Health exports or compatible CSV files. The monitoring note appears in Care.

### Mindfulness and the Moment (`/moment`)
Mindfulness keeps the orb close to the nine feeling choices. They appear side by side on wider screens. "Begin a moment" opens the guided pause.
- Feelings (`moods.ts`) give the orb an outline, a tint, and a musical root note. The choice lasts for the tab session (`sessionStorage`).
- Begin opens `Session`, a full-screen layer on the same page (no navigation): Breathe (30s) → Keep ("Before you go", both parts optional) → Close. Exit or Escape returns to the screen that opened the session.
- Breathing is a fixed gentle 4s inhale / 4s exhale with no hold. The orb (`BreathVisual size="immersive"`) gently swells on the inhale and contracts on the exhale, above the breath cue. People can pause, skip, exit, or simply rest.
- Breath cues are announced politely to screen readers; there is no progress bar. Escape never discards typed words.
- One optional question: "What would make the rest of today feel more meaningful?" Six action invitations plus "My own".
- The close is calm: no counts, scores or "well done". A chosen action is shown large with "The screen can wait."; "I'm heading off" or "Done"; a subtle "View my journey".
- The first breath starts silent. Optional soft music uses the feeling’s frequency as a note. Ocean waves and silence are available in the session and Settings.
- Follow-up (`FollowUpCard`) in Mindfulness: up to three unrevisited intentions per visit, newest first, "Ask me later".

### Listen (`/listen`)
- Three curated Spotify picks cover guided meditation, soft piano, and nature sounds. Mindfulness links to meditation and Sleep links to nature sounds. The player loads when selected.

### My Journey (`/journey`)
- A timeline groups saved moments by month and puts reflections and intentions first. "A line from before" brings back a past reflection when available.
- Filter pills (All / Reflections / Intentions, `aria-pressed`), then month-grouped compact cards (`MomentEntry`) each drawn as the shape and colour of the feeling it began with (`MomentShape`; `Moment.mood` is optional). Cards expand (also via `#moment-<id>`) to show the reflection, intention and follow-up.
- An "Options" menu per entry: edit/remove reflection, edit/remove intention, remove moment, save reflection as an image (`shareImage.ts`, local canvas, opt-in).
- Follow-up is neutral and optional: "I did it", "Not yet", "My priorities changed". None is framed as better.
- Never invent data: a Moment shows only what the person actually gave. No placeholders.
- Everything is editable and deletable (per reflection, per intention, per Moment, or all data).

### Navigation
- Today is the hub. The top-right `MenuButton` links to Today, Mindfulness, Listen, Journey, Settings, and Support.
- The menu button is persistent and hidden during a Session, which keeps Exit.

## Visual design principles

- **Night, with a breathing orb.** Near-black `#070a1f` with a quiet aura in the chosen feeling’s colour (`Backdrop`), near-white text, frosted cards, and a white primary pill.
- **Orb and tone.** `BreathVisual` has an asymmetric rim of blue and lilac around a dark centre. The mood changes the breathing orb’s silhouette and tint. The glassy core, translucent rim, picker, and Journey share the same contour. A broad radial light fades from the orb into the page.
- **Navigation.** A single top-right `MenuButton` opens a labelled menu panel. Escape closes it.
- **Type.** Fraunces (serif display) for headings and reflections; DM Sans for UI text.
- **Space.** Generous whitespace, a narrow column, few elements per screen.
- **Motion.** One `--breath` value (0..1) drives the orb, glow, and backdrop. The guided session drives the orb in time with the cue. The orb rests when reduced motion is enabled.
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
- `src/app/` routes: `/` Today, `/welcome`, `/moment` Mindfulness, `/listen`, `/health/[area]`, `/setup`, `/journey`, `/settings`, `/support`; `manifest.ts` and `icon.svg` make it installable (no service worker)
- `src/components/` shared UI; `moment/` and `settings/` hold feature components; `ui/` holds Button and RadioCard
- `src/lib/` `breath.ts` (timing), `sky.ts` (time-of-day greeting), `moods.ts`, `arrival.ts` (selected feeling), `sound.ts`, `preferences.ts` and `journey.ts` (localStorage stores), `actions.ts` (action copy), `shareImage.ts`
- `src/styles/` global styles, theme and breathing-line tokens
- `public/assets/` static images, icons, fonts
- `docs/` product and design documentation

### Conventions
- Import from `src` with the `@/` alias.
- Server components by default; add `"use client"` only when needed (state, effects, browser APIs).
- Style with Tailwind utilities and theme tokens. Reuse `Button`, `RadioCard` and `BreathVisual`.
- Use native, semantic controls and label every interactive element.
- Keep components small, typed, and PascalCase.

### Prototype scope (important)
- Data persists in `localStorage` only: `still:preferences` and `still:journey` (versioned: `{ version, moments }`).
  Reads validate and never overwrite; an original that needed migrating or had skipped records is kept
  once under `still:journey:backup` (removed by "Delete all my journey data"). Health setup and entries use the versioned `still:health` key and can be cleared in Settings. Imports are processed in the browser. No accounts, no backend.
- **Do not** add real system notifications, push subscriptions, service workers, background
  reminders or scheduling, and **never** request notification permission, until explicitly planned.
- Settings holds sound, haptics (`navigator.vibrate`, off by default), data and a note that Still sends no reminders. There are no reminder controls until reminders are really planned.

### Secrets and git
- Never commit secrets. Use `.env.local`; keep `.env.example` current with variable names only.
- `node_modules`, `.next`, and build output are git-ignored.
- Small, focused commits with clear messages.
