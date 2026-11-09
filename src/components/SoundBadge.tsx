/** Shows, in words and motion, that a tone is playing. */
export default function SoundBadge({ hz, playing }: { hz: number; playing: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm" role="status">
      {playing ? (
        <span className="eq" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      ) : (
        <span aria-hidden="true">♪</span>
      )}
      {playing ? `Playing ${hz} Hz` : `${hz} Hz`}
    </span>
  );
}
