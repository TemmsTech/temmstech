"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import type { ShowcaseProject } from "@/types/showcase";

type ProjectGridProps = {
  projects: readonly ShowcaseProject[];
  batchSize?: number;
};

export function ProjectGrid({
  projects,
  batchSize = projects.length,
}: ProjectGridProps) {
  const batch = Math.max(1, batchSize);
  const [visibleCount, setVisibleCount] = useState(batch);
  const grid = useRef<HTMLDivElement>(null);
  const previousCount = useRef(visibleCount);
  const visibleProjects = projects.slice(0, visibleCount);

  useEffect(() => {
    if (visibleCount > previousCount.current) {
      grid.current?.children[previousCount.current]
        ?.querySelector("a")
        ?.focus();
    }
    previousCount.current = visibleCount;
  }, [visibleCount]);

  return (
    <>
      <div ref={grid} className="grid gap-6 md:grid-cols-2">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
      {visibleCount < projects.length && (
        <div className="mt-10 text-center">
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + batch, projects.length),
              )
            }
          >
            Show more
          </Button>
        </div>
      )}
      <p role="status" className="sr-only">
        Showing {visibleProjects.length} of {projects.length} projects.
      </p>
    </>
  );
}
