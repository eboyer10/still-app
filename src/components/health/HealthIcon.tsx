import type { AreaId } from "@/lib/health";

const paths = {
  movement: "M3 13h4l3-7 4 12 3-5h4",
  food: "M12 21v-9m0 3c-5.5 0-8-3-8-7 4.5 0 8 2.5 8 7Zm0-3c0-4.5 2.7-7 7.5-7 0 4.4-2.7 7-7.5 7Z",
  sleep: "M20.5 15A8.6 8.6 0 0 1 9 3.5 8.7 8.7 0 1 0 20.5 15Z",
  care: "M8 6H5v15h14V6h-3M9 4h6v4H9zm3 7v6m-3-3h6",
} satisfies Record<AreaId, string>;

export default function HealthIcon({ area }: { area: AreaId }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[area]} />
    </svg>
  );
}
