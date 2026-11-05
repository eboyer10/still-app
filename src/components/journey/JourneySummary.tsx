import type { JourneyCounts } from "@/lib/journey";

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

function Num({ children }: { children: number }) {
  return <span className="font-serif text-4xl font-light sm:text-5xl">{children}</span>;
}

/** Counts as plain sentences: they describe, they never score or instruct. */
export default function JourneySummary({ counts }: { counts: JourneyCounts }) {
  const { momentsTaken, intentionsChosen, intentionsRevisited, intentionsActedOn } = counts;
  return (
    <div className="space-y-4 text-lg leading-10 text-foreground/80 sm:text-xl sm:leading-[3rem]">
      <p>
        You&apos;ve made time to pause <Num>{momentsTaken}</Num> {plural(momentsTaken, "time", "times")}.
      </p>
      {intentionsChosen > 0 && (
        <p>
          You&apos;ve chosen <Num>{intentionsChosen}</Num> {plural(intentionsChosen, "intention", "intentions")}
          {intentionsRevisited > 0 ? (
            <>
              , and looked back on <Num>{intentionsRevisited}</Num>.
            </>
          ) : (
            "."
          )}
          {intentionsActedOn > 0 && (
            <>
              {" "}
              <Num>{intentionsActedOn}</Num> {plural(intentionsActedOn, "was", "were")} acted upon.
            </>
          )}
        </p>
      )}
    </div>
  );
}
