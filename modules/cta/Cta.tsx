import type { SectionIntro } from "@/types/content";
import { ProjectBrief } from "./ProjectBrief";

export function Cta({
  intro,
  email,
}: {
  intro: SectionIntro;
  email: string | null;
}) {
  return (
    <section
      id={intro.id}
      className="relative overflow-hidden bg-brand text-ink"
      aria-labelledby={`${intro.id}-title`}
    >
      <div className="page-container section-space relative text-center">
        <p className="eyebrow mb-6">{intro.eyebrow}</p>
        <h2
          id={`${intro.id}-title`}
          className="section-title mx-auto max-w-3xl"
        >
          {intro.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-xl sm:text-2xl">
          {intro.description}
        </p>
        <ProjectBrief email={email} />
      </div>
    </section>
  );
}
