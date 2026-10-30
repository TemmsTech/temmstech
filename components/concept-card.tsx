import type { ReactNode } from "react";
import type { Project } from "@/types/project";

export function ConceptCard({
  project,
  preview,
}: {
  project: Project;
  preview: ReactNode;
}) {
  return (
    <article className="image-card min-w-0">
      {preview}
      <div className="image-card-body">
        <p className="text-xs text-muted-foreground">
          <span>Sample concept</span> · {project.category}
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight">
          {project.title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {project.description}
        </p>
        <details className="group mt-5 border-t border-border pt-3">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-medium">
            Explore the concept{" "}
            <span aria-hidden="true" className="text-xl group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="pb-3 text-sm leading-7 text-muted-foreground">
            {project.brief}
          </p>
        </details>
      </div>
    </article>
  );
}
