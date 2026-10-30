import { Section } from "@/components/section";
import { ProjectGrid } from "@/components/project-grid";
import type { ShowcaseProject } from "@/types/showcase";
import type { SectionIntro } from "@/types/content";
export function Portfolio({
  intro,
  projects,
  batchSize,
}: {
  intro: SectionIntro;
  projects: readonly ShowcaseProject[];
  batchSize?: number;
}) {
  return (
    <Section intro={intro} tone="muted">
      <ProjectGrid projects={projects} batchSize={batchSize} />
    </Section>
  );
}
