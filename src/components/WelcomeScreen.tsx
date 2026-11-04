export default function WelcomeScreen() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center sm:px-10 md:py-24">
      <div
        aria-hidden="true"
        className="still-breathe mb-10 size-20 rounded-full bg-foreground/10 ring-1 ring-foreground/15 sm:mb-14 sm:size-28 md:size-32"
      />
      <h1 className="text-5xl font-light tracking-tight sm:text-6xl md:text-7xl">
        Still
      </h1>
      <p className="mt-6 max-w-xs text-base leading-7 text-foreground/70 sm:max-w-md sm:text-lg sm:leading-8 md:max-w-lg md:text-xl md:leading-9">
        A quiet space to pause, notice how you feel, and reflect.
      </p>
      <p className="mt-10 text-sm tracking-wide text-foreground/50 sm:mt-14">
        Take a breath. There&apos;s no rush.
      </p>
    </main>
  );
}
