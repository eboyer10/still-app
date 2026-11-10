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

### Today and the Moment (`/`)
Today is the whole home: greeting, a living `BreathVisual`, a three-line "how a moment goes", a 3×3 grid of nine feelings, and a floating "Begin a moment" button always in reach at the bottom. `/moment` just redirects here.
- Feelings (`moods.ts`) each have their own shape (geometry with n sides, or a bloom with n petals), colour (hue) and tone (396, 417, 432, 528, 639, 741, 852, 963, 111 Hz). Tapping one morphs the shape and backdrop colour and plays a ~4s tone preview with a `SoundBadge`. Copy says "traditionally linked", never a health claim. The choice lasts for the tab session (`sessionStorage`). Until one is chosen, the shape is random per page load.
- Begin opens `Session`, a full-screen layer on the same page (no navigation): Breathe (30s) → Keep ("Before you go", both parts optional) → Close. Exit/Escape return to Today.
- Breathing is a fixed gentle 4s inhale / 4s exhale with no hold. The shape (`BreathVisual size="immersive"`) swells to fill the screen on the inhale and contracts on the exhale. People can pause, skip, exit, or simply rest.
- Breath cues are announced politely to screen readers; there is no progress bar. Escape never discards typed words.
- One optional question: "What would make the rest of today feel more meaningful?" Six action invitations plus "My own".
- The close is calm: no counts, scores or "well done". A chosen action is shown large with "The screen can wait."; "I'm heading off" or "Done"; a subtle "View my journey".
- Sound is on by default (`sound`) but only ever starts from a tap. Easy to turn off on Today, in the session, and in Settings.
- Follow-up (`FollowUpCard`) on Today: up to three unrevisited intentions per visit, newest first, "Ask me later".

### My Journey (`/journey`)
- A calm, scannable bento of cards: "A line from before" (`LineFromBefore`, a random past reflection, "Show another"), stat pills (`JourneySummary`: pauses taken, intentions chosen, looked back on, acted upon: plain counts, no targets), and the landscape.
- Filter pills (All / Reflections / Intentions, `aria-pressed`), then month-grouped compact cards (`MomentEntry`) each drawn as the shape and colour of the feeling it began with (`MomentShape`; `Moment.mood` is optional). Cards expand (also via `#moment-<id>`) to show the reflection, intention and follow-up.
- An "Options" menu per entry: edit/remove reflection, edit/remove intention, remove moment, save reflection as an image (`shareImage.ts`, local canvas, opt-in).
- Follow-up is neutral and optional: "I did it", "Not yet", "My priorities changed". None is framed as better.
- Never invent data: a Moment shows only what the person actually gave. No placeholders.
- "Your shapes": a row of small mood shapes, one per Moment, newest first, linking to the entry. No gaps are ever shown.
- Everything is editable and deletable (per reflection, per intention, per Moment, or all data).

### Navigation
- Today is the hub. Follow-ups live on Today (`FollowUpCard`). A top-right `MenuButton` (Today, Journey, Settings, Support) is the one navigation.
- The menu button is persistent and hidden during a Session, which keeps Exit.

## Visual design principles

- **Night, with one living shape.** Near-black `#070a1f` with a soft aura in the chosen feeling's colour (`Backdrop`),
  near-white text, frosted `bg-white/[0.06-0.15]` cards, white primary pill. Reference: Calm's deep, immersive screens
  and the Kinorama geometric breathing videos. Use theme tokens in `globals.css`.
- **Shape + colour + tone belong together.** `BreathVisual` (geometry or bloom, driven by `--breath`) and `Backdrop` take
  their `--hue` from the feeling via `useShape`; hue changes animate (`@property --hue`).
- **Navigation.** A single `MenuButton` top-right opens a labelled menu panel (Escape closes). The breathing shape in a Session is drawn faint with a soft scrim behind the words, so text stays readable while it still swells large.
- **Type.** Fraunces (serif display) for headings and reflections; DM Sans for UI text.
- **Space.** Generous whitespace, a narrow column, few elements per screen.
- **Motion.** One `--breath` value (0..1) drives the shape, glow and backdrop (own 8s loop on Today, Journey and Settings;
  driven by the guided breath in Session). Always respect `prefers-reduced-motion` (the shape rests).
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
- `src/app/` routes: `/` Today, `/moment` (redirects to `/`), `/journey`, `/settings`, `/support`; `manifest.ts` and `icon.svg` make it installable (no service worker)
- `src/components/` shared UI; `moment/` and `settings/` hold feature components; `ui/` holds Button and RadioCard
- `src/lib/` `breath.ts` (timing), `sky.ts` (time-of-day greeting), `moods.ts`, `arrival.ts` (feeling + shape), `sound.ts`, `preferences.ts` and `journey.ts` (localStorage stores), `actions.ts` (action copy), `shareImage.ts`
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
