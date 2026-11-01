import type { CSSProperties } from "react";
import { LiveFrame } from "@/components/live-frame";
import { ProjectCard } from "@/components/project-card";
import { SectionNav } from "@/components/section-nav";
import { services } from "@/data/services";
import { processSteps } from "@/data/approach";
import { showcaseProjects } from "@/data/device-showcase";
import { projects } from "@/data/projects";
import { pageIntros, pageSections } from "@/data/pages";
import { ConceptsReveal } from "./ConceptsReveal";
import { PageNextStep } from "./PageNextStep";

// Two extra photos per concept, from the free Unsplash photos already used on
// the site. They show after the card photo in the concept's slider.
const conceptPhotos: Record<string, readonly string[]> = {
  storefront: [processSteps[2].image, processSteps[3].image],
  learning: [processSteps[0].image, processSteps[1].image],
  operations: [services[4].image, processSteps[5].image],
};

export function WorkPage() {
  return (
    <>
      <section
        className="dark-surface bg-background"
        aria-labelledby="page-title"
      >
        <div className="page-container section-space">
          <p className="eyebrow mb-6 text-brand">
            PROJECT INDEX / SELECTED WEBSITES
          </p>
          <h1 id="page-title" className="hero-title max-w-4xl">
            {pageIntros.work.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Different worlds. Real websites. Explore what we’ve put out there.
          </p>
          <div
            className="work-fan mt-12 grid grid-cols-3 items-center gap-3 py-6 sm:gap-6"
            aria-hidden="true"
          >
            {showcaseProjects.slice(0, 3).map((project, index) => (
              <div
                key={project.id}
                className="work-fan-card relative aspect-[12/7] overflow-hidden border border-border bg-card"
                style={{ "--i": index } as CSSProperties}
              >
                <LiveFrame url={project.url} title={project.title} controls={false} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <SectionNav items={pageSections.work} />
      <section id="work" className="bg-background" aria-labelledby="work-title">
        <div className="page-container section-space">
          <h2 id="work-title" className="section-title">
            Built. Shipped. Explore.
          </h2>
          <p className="mt-5 mb-10 text-muted-foreground">
            A closer look at our selected websites.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {showcaseProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>
      <ConceptsReveal
        eyebrow="THE EXPLORATION DESK"
        title="Not every idea is a live project."
        description="Illustrative directions, separate from the delivered websites above."
        concepts={projects.map((project, index) => ({
          id: project.id,
          title: project.title,
          category: project.category,
          description: project.description,
          brief: project.brief,
          tags: project.tags,
          image: services[index].image,
          gallery: [services[index].image, ...(conceptPhotos[project.id] ?? [])],
        }))}
      />
      <PageNextStep
        title="Let’s make room for your project."
        description="Share the experience you want to create, or the problem you want to solve."
      />
    </>
  );
}
