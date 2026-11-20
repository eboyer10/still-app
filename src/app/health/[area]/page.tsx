import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HealthArea from "@/components/health/HealthArea";
import { AREAS, AREA_IDS, isArea } from "@/lib/health";

export function generateStaticParams() {
  return AREA_IDS.map((area) => ({ area }));
}

export async function generateMetadata({ params }: PageProps<"/health/[area]">): Promise<Metadata> {
  const { area } = await params;
  if (!isArea(area)) notFound();
  return { title: `${AREAS[area].title} · Still` };
}

export default async function AreaPage({ params }: PageProps<"/health/[area]">) {
  const { area } = await params;
  if (!isArea(area)) notFound();
  return <HealthArea key={area} area={area} />;
}
