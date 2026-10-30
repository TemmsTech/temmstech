import Image from "next/image";
import { Arrow } from "@/components/arrow";
import type { ShowcaseProject } from "@/types/showcase";

export function ProjectCard({ project }: { project: ShowcaseProject }) {
  return (
    <article className="image-card min-w-0">
      <div className="relative aspect-[12/7] overflow-hidden bg-ink">
        <Image
          src={project.desktopImage}
          alt={`${project.title} website preview`}
          fill
          sizes="(min-width: 1280px) 592px, (min-width: 768px) 50vw, 100vw"
          className="object-cover object-top"
        />
      </div>
      <div className="image-card-body">
        <p className="image-card-label">{project.category}</p>
        <h3 className="text-2xl font-semibold tracking-tight">
          {project.title}
        </h3>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${project.title} website (opens in a new tab)`}
          className="mt-5 inline-flex min-h-11 items-center gap-3 text-sm font-semibold underline decoration-current underline-offset-8 hover:text-accent-foreground"
        >
          Visit website <Arrow />
        </a>
      </div>
    </article>
  );
}
