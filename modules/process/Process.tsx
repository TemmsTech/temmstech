import { ImageCard } from "@/components/image-card";
import { Section } from "@/components/section";
import type { ProcessStep, SectionIntro } from "@/types/content";
export function Process({
  intro,
  steps,
}: {
  intro: SectionIntro;
  steps: readonly ProcessStep[];
}) {
  return (
    <Section intro={intro} tone="dark">
      <ol className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => (
          <li key={step.title}>
            <ImageCard {...step} />
          </li>
        ))}
      </ol>
    </Section>
  );
}
