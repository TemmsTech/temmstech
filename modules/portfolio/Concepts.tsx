import { Section } from "@/components/section";
import { ConceptCard } from "@/components/concept-card";
import type { Project } from "@/types/project";
import type { SectionIntro } from "@/types/content";
import { ProjectPreview } from "./ProjectPreview";

export function Concepts({
  intro,
  projects,
}: {
  intro: SectionIntro;
  projects: readonly Project[];
}) {
  return (
    <Section intro={intro}>
      <div className="grid gap-10 md:grid-cols-3">
        {projects.map((project) => (
          <ConceptCard
            key={project.id}
            project={project}
            preview={<ProjectPreview kind={project.kind} />}
          />
        ))}
      </div>
    </Section>
  );
}
