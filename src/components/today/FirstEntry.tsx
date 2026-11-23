"use client";

import { useRef, useState } from "react";
import EntryForm from "@/components/health/EntryForm";
import HealthIcon from "@/components/health/HealthIcon";
import Button from "@/components/ui/Button";
import { AREAS, AREA_IDS, ENTRY_FIELDS, type AreaId, type EntryKind } from "@/lib/health";

export default function FirstEntry({ onFinish }: { onFinish: () => void }) {
  const [area, setArea] = useState<AreaId>();
  const [kind, setKind] = useState<EntryKind>();
  const choices = useRef<HTMLDivElement>(null);

  function reset() {
    setArea(undefined);
    setKind(undefined);
    requestAnimationFrame(() => choices.current?.querySelector("button")?.focus());
  }

  if (kind) return <EntryForm key={kind} quick kind={kind} onClose={(saved) => saved ? onFinish() : reset()} />;

  return (
    <div ref={choices} className="mt-6 w-full max-w-lg">
      {area === "care" ? (
        <div role="group" aria-label="Care entry" className="flex flex-wrap justify-center gap-2">
          {AREAS.care.kinds.map((item) => (
            <Button key={item} variant="quiet" onClick={() => setKind(item)}>Add {ENTRY_FIELDS[item].singular}</Button>
          ))}
          <Button variant="ghost" onClick={reset}>Choose another area</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {AREA_IDS.map((item) => (
            <button
              key={item}
              type="button"
              className="flex min-h-16 items-center gap-2 rounded-2xl border border-white/15 bg-white/6 px-3 text-left text-sm transition-colors hover:border-white/35 hover:bg-white/12"
              onClick={() => {
                if (item === "care") {
                  setArea(item);
                  requestAnimationFrame(() => choices.current?.querySelector("button")?.focus());
                } else setKind(AREAS[item].kinds[0]);
              }}
            >
              <span style={{ color: AREAS[item].color }}><HealthIcon area={item} /></span>
              {AREAS[item].title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
