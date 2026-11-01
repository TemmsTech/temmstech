import type { SectionIntro } from "@/types/content";
import { BriefReveal, type BriefPoint } from "./BriefReveal";

export function Cta({
  intro,
  points,
}: {
  intro: SectionIntro;
  points?: readonly BriefPoint[];
}) {
  return (
    <BriefReveal
      id={intro.id}
      eyebrow={intro.eyebrow}
      title={intro.title}
      description={intro.description}
      points={points}
      tone="brand"
      fill={false}
    />
  );
}
