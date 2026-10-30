import Image from "next/image";
import { ImageCard } from "@/components/image-card";
import { SectionNav } from "@/components/section-nav";
import { SectionReveal } from "@/components/section-reveal";
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
        className="dark-surface relative isolate overflow-hidden bg-background"
        aria-labelledby="page-title"
      >
        <Image
          src={processSteps[1].image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="hero-photo-shade absolute inset-0" />
        <div className="page-container relative py-20 lg:py-32">
          <p className="eyebrow mb-6 text-brand">THINK. MAKE. LEARN. REPEAT.</p>
          <h1 id="page-title" className="hero-title max-w-3xl">
            {pageIntros.approach.title}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8">
            Clear decisions. Tangible progress. A shared way forward.
          </p>
          <div className="mt-12 flex flex-wrap gap-3">
            {["Discover", "Prototype", "Build", "Release"].map(
              (phase, index) => (
                <span
                  key={phase}
                  className="border border-foreground/30 bg-background/70 px-4 py-3 text-sm"
                >
                  0{index + 1} / {phase}
                </span>
              ),
            )}
          </div>
        </div>
      </section>
      <SectionNav items={pageSections.approach} />
      <section
        id="delivery"
        className="bg-background"
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
      <SectionReveal fromId="delivery" toId="collaboration" />
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
      <SectionReveal fromId="collaboration" toId="contact" />
      <PageNextStep
        title="Start with a useful question."
        description="You bring the context. We’ll work through the next step together."
      />
    </>
  );
}
