import { DeviceShowcase } from "@/components/device-showcase";
import type { ShowcaseProject } from "@/types/showcase";
import { Arrow } from "@/components/arrow";
import { Button } from "@/components/ui/button";
import type { HeroContent } from "./types";
import { AnimatedHeroCopy } from "./AnimatedHeroCopy";

export function Hero({
  content,
  projects,
  nextSectionId,
}: {
  content: HeroContent;
  nextSectionId: string;
  projects: readonly ShowcaseProject[];
}) {
  return (
    <section
      className="dark-surface hero-stage relative isolate overflow-hidden bg-background"
      aria-labelledby="hero-title"
    >
      <div className="page-container relative grid items-start gap-10 pt-6 pb-10 sm:pt-8 lg:grid-cols-[1fr_1.1fr] lg:gap-8">
        <div>
          <p className="eyebrow mb-9 flex items-center gap-3 text-muted-foreground">
            <span className="h-px w-8 shrink-0 bg-brand" />
            {content.eyebrow}
          </p>
          <AnimatedHeroCopy content={content} />
          <div className="max-w-lg">
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Button asChild size="lg" className="hero-primary">
                <a href={content.primaryAction.href}>
                  {content.primaryAction.label}
                  <Arrow />
                </a>
              </Button>
              <a
                href={content.secondaryAction.href}
                className="inline-flex min-h-11 items-center gap-3 text-sm font-medium underline-offset-8 hover:underline"
              >
                {content.secondaryAction.label}
                <Arrow className="size-4" />
              </a>
            </div>
          </div>
        </div>
        <DeviceShowcase
          projects={projects}
          nextSectionId={nextSectionId}
          className="device-showcase-wide"
        />
      </div>
      <div className="page-container relative">
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-border py-6">
          <p className="font-mono text-[0.6rem] tracking-widest text-muted-foreground">
            MANY DISCIPLINES.{" "}
            <span className="text-foreground">ONE TEMMSTECH.</span>
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {content.disciplines.map((discipline) => (
              <li
                key={discipline}
                className="flex items-center gap-2 text-xs text-foreground"
              >
                <span aria-hidden="true" className="size-1 bg-brand" />
                {discipline}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
