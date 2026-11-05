import { Arrow } from "@/components/arrow";
import { ImageCard } from "@/components/image-card";
import { ProcessSpine } from "@/components/process-spine";
import { SectionNav } from "@/components/section-nav";
import { Button } from "@/components/ui/button";
import {
  deliveryStages,
  collaborationNotes,
  pageIntros,
  pageSections,
} from "@/data/pages";
import { processSteps } from "@/data/approach";
import { PageNextStep } from "./PageNextStep";

export function ApproachPage() {
  return (
    <>
      <section
        id="journey"
        className="dark-surface bg-background"
        aria-labelledby="page-title"
      >
        <div className="page-container section-space grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:flex lg:min-h-[calc(100dvh-17rem)] lg:flex-col lg:justify-center lg:self-start">
            <p className="eyebrow mb-5 text-brand">
              {pageIntros.approach.eyebrow}
            </p>
            <h1 id="page-title" className="section-title max-w-xl">
              <span className="block">From the first idea,</span>{" "}
              <span className="block text-brand">To launch &amp; beyond.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-muted-foreground">
              {pageIntros.approach.description}
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <a href="#delivery">
                  See how we deliver
                  <Arrow className="size-5 rotate-90" />
                </a>
              </Button>
            </div>
          </div>
          <ProcessSpine steps={processSteps} />
        </div>
      </section>
      <SectionNav items={pageSections.approach} />
      <section
        id="delivery"
        className="fill-below-nav bg-background"
        aria-labelledby="delivery-title"
      >
        <div className="page-container section-space">
          <h2 id="delivery-title" className="section-title">
            Decisions before deliverables.
          </h2>
          <p className="mt-5 mb-10 text-muted-foreground">
            Four stages. Something useful to review at every step.
          </p>
          <ol className="grid gap-6 md:grid-cols-2">
            {deliveryStages.map((stage) => (
              <li key={stage.title}>
                <ImageCard
                  image={stage.image}
                  title={stage.title}
                  description={stage.description}
                  label={stage.question}
                >
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {stage.outputs.map((output) => (
                      <li
                        key={output}
                        className="border border-border bg-secondary px-3 py-2 text-xs"
                      >
                        {output}
                      </li>
                    ))}
                  </ul>
                </ImageCard>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section
        id="collaboration"
        className="bg-secondary"
        aria-labelledby="collaboration-title"
      >
        <div className="page-container section-space">
          <h2 id="collaboration-title" className="section-title">
            How we keep the work clear.
          </h2>
          <p className="mt-5 mb-10 text-muted-foreground">
            Good collaboration is built into the process.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {collaborationNotes.map((note) => (
              <ImageCard
                key={note.title}
                {...note}
                label="Working together"
              />
            ))}
          </div>
        </div>
      </section>
      <PageNextStep
        title="Start with a useful question."
        description="You bring the context. We’ll work through the next step together."
      />
    </>
  );
}
