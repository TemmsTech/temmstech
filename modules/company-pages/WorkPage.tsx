import type { CSSProperties } from "react";
import Image from "next/image";
import { ImageCard } from "@/components/image-card";
import { ProjectCard } from "@/components/project-card";
import { SectionNav } from "@/components/section-nav";
import { services } from "@/data/services";
import { showcaseProjects } from "@/data/device-showcase";
import { projects } from "@/data/projects";
import { pageIntros, pageSections } from "@/data/pages";
import { PageNextStep } from "./PageNextStep";

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
                className="work-fan-card relative aspect-[12/7] border border-border bg-card"
                style={{ "--i": index } as CSSProperties}
              >
                <Image
                  src={project.desktopImage}
                  alt=""
                  fill
                  sizes="33vw"
                  className="object-cover"
                  priority={index === 1}
                />
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
      <section
        id="concepts"
        className="bg-secondary"
        aria-labelledby="lab-title"
      >
        <div className="page-container section-space">
          <p className="eyebrow mb-5">THE EXPLORATION DESK</p>
          <h2 id="lab-title" className="section-title">
            Not every idea is a live project.
          </h2>
          <p className="mt-5 mb-10 max-w-2xl text-muted-foreground">
            Illustrative directions, separate from the delivered websites above.
          </p>
          <div className="grid gap-6 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ImageCard
                key={project.id}
                image={services[index].image}
                label="Sample concept"
                title={project.title}
                description={project.description}
              >
                <details className="mt-5 border-t border-border pt-4">
                  <summary className="cursor-pointer py-2 text-sm font-semibold">
                    Explore the idea
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {project.brief}
                  </p>
                </details>
              </ImageCard>
            ))}
          </div>
        </div>
      </section>
      <PageNextStep
        title="Let’s make room for your project."
        description="Share the experience you want to create, or the problem you want to solve."
      />
    </>
  );
}
