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

### The Moment flow (all on `/`, no page changes)
Welcome → Step 1 Arrive (mood) → Step 2 Breathe (30s) → Step 3 Keep ("Before you go", both parts optional) → Close. `MomentFlow` holds every step in place; `/moment` just opens at Arrive. The "Still" wordmark or Exit restarts at the welcome.
- Arrive: optional mood (`MoodPicker`). Tapping one recolours the shape and plays a ~4s preview of its tone, with a visible `SoundBadge` ("Playing 528 Hz") and a clear "Turn sound on/off" button. Audio only ever starts from a tap.
- Breathing is a fixed gentle 4s inhale / 4s exhale with no hold. The shape (`BreathVisual immersive`) swells to fill the screen on the inhale and contracts on the exhale. People can pause, skip, exit, or simply rest.
- Breath cues are announced politely to screen readers; there is no progress bar. Escape never discards typed words.
- One optional question: "What would make the rest of today feel more meaningful?"
- Six action invitations plus "My own". Keep wording soft and concise.
- The close is calm: no counts, scores or "well done". If an action was chosen it is shown large with "The screen can wait." and "I'm heading off"; otherwise "Done". A subtle "View my journey" remains.
- Sound is on by default (`sound`) but only starts after a tap: a soft tone at the mood's frequency (432 Hz default) that follows the breath. Easy to mute everywhere.

### My Journey (`/journey`)
- A calm, scannable bento of cards: "A line from before" (`LineFromBefore`, a random past reflection, "Show another"), stat pills (`JourneySummary`: pauses taken, intentions chosen, looked back on, acted upon: plain counts, no targets), and the landscape.
- Filter pills (All / Reflections / Intentions, `aria-pressed`), then month-grouped compact cards (`MomentEntry`) with a per-moment glyph (`MomentGlyph`). Cards expand (also via `#moment-<id>`) to show the reflection, intention and follow-up.
- An "Options" menu per entry: edit/remove reflection, edit/remove intention, remove moment, save reflection as an image (`shareImage.ts`, local canvas, opt-in).
- Follow-up is neutral and optional: "I did it", "Not yet", "My priorities changed". None is framed as better.
- Never invent data: a Moment shows only what the person actually gave. No placeholders.
- `JourneyLandscape`: each Moment is one light on a misty ridge, oldest to newest, evenly spaced so gaps are never shown. A ring marks a kept reflection; a small star marks an intention.
- Everything is editable and deletable (per reflection, per intention, per Moment, or all data).

### Navigation
- Home asks gentle follow-ups (up to three per visit, newest first, "Ask me later" to skip) about unrevisited intentions (`HomeExtras`), and shows "My journey" only once a Moment exists. The bottom `TabBar` is the main navigation; home also shows a "How Still works" guide. Situation chips (`situations.ts`) link to `/moment?for=<id>` and add a gentle line to the moment.
- The `TabBar` is persistent (hidden during the moment). Every screen also has the "Still" wordmark (`SiteMark`) top-left
  as the one way back to the beginning (hidden during the breathing step). Moment keeps Exit.

## Visual design principles

- **Immersive and contemplative.** One quiet focal element (the breath visual); everything else recedes.
- **Deep blue sky, light ink.** A Calm-style gradient from bright blue to indigo (`SkyBackground`, tinted by local
  hour), near-white text, frosted `bg-white/10-15` cards, and a pink-to-periwinkle gradient pill for the primary action.
  Use theme tokens in `globals.css`, not hard-coded colors.
- **Breath visual, random each load.** `BreathVisual` picks nested octagon *geometry* or an orbit *bloom* at random on
  every page load (`useVisual`), tinted by the arrival mood's hue. No orb, no lines.
- **Mood at arrival.** `MoodPicker` on home (optional, kept for the tab session in `sessionStorage`, `useMood`).
  Each of nine moods (`moods.ts`) sets the visual's colour and the tone's frequency (396, 417, 432, 528, 639, 741,
  852, 963, 111 Hz). Copy says "traditionally linked", never a health claim.
- **Guidance.** A labelled `TabBar` (Home, Pause, Journey, Settings) on every screen except /moment; home explains
  Arrive, Breathe, Keep; each moment step says what comes next ("First, breathe", "Next, keep what you like").
- **Type.** Fraunces (serif display) for headings, the wordmark and reflections; DM Sans for UI text.
- **Space.** Generous whitespace, a narrow reading column, few elements per screen.
- **Motion.** One `--breath` value (0..1) drives the visual, glow and clouds (own 8s loop on home, journey and
  settings; driven by the guided breath on /moment). Always respect `prefers-reduced-motion` (the visual rests).
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
- `src/app/` routes: `/` welcome, `/moment`, `/journey`, `/settings`, `/support`; `manifest.ts` and `icon.svg` make it installable (no service worker)
- `src/components/` shared UI; `moment/` and `settings/` hold feature components; `ui/` holds Button and RadioCard
- `src/lib/` `breath.ts` (timing), `sky.ts`, `sound.ts`, `preferences.ts` and `journey.ts` (localStorage stores), `actions.ts` (action copy), `situations.ts`, `shareImage.ts`
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
  once under `still:journey:backup` (removed by "Delete all my journey data"). No accounts, no backend.
- **Do not** add real system notifications, push subscriptions, service workers, background
  reminders or scheduling, and **never** request notification permission, until explicitly planned.
- Settings holds sound, haptics (`navigator.vibrate`, off by default), data and a note that Still sends no reminders. There are no reminder controls until reminders are really planned.

### Secrets and git
- Never commit secrets. Use `.env.local`; keep `.env.example` current with variable names only.
- `node_modules`, `.next`, and build output are git-ignored.
- Small, focused commits with clear messages.
