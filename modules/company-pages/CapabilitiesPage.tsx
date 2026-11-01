import { Arrow } from "@/components/arrow";
import { ImageTile } from "@/components/image-tile";
import { ImageCard } from "@/components/image-card";
import { SectionNav } from "@/components/section-nav";
import {
  pageIntros,
  capabilityDetails,
  startingPoints,
  pageSections,
} from "@/data/pages";
import { services } from "@/data/services";
import { capabilityHeroSlides } from "@/data/hero-slides";
import { PageNextStep } from "./PageNextStep";

export function CapabilitiesPage() {
  return (
    <>
      <section className="bg-background" aria-labelledby="page-title">
        <div className="page-container grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="eyebrow mb-6 text-accent-foreground">
              MANY DISCIPLINES. ONE TEAM.
            </p>
            <h1 id="page-title" className="hero-title">
              {pageIntros.capabilities.title}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-muted-foreground">
              From the first interface to the systems behind it. Built to work
              together.
            </p>
            <a
              href="#disciplines"
              className="mt-8 inline-flex min-h-12 items-center border-b border-foreground font-semibold"
            >
              Explore the possibilities <Arrow className="ml-2 size-4" />
            </a>
          </div>
          <div className="hero-mosaic">
            <ImageTile
              image={services[0].image}
              images={capabilityHeroSlides.digital}
              caption="Digital experiences"
              priority
            />
            <ImageTile
              image={services[2].image}
              images={capabilityHeroSlides.hardware}
              caption="Connected hardware"
              slideDelay={1700}
            />
            <ImageTile
              image={services[3].image}
              images={capabilityHeroSlides.ai}
              caption="Applied intelligence"
              slideDelay={3400}
            />
          </div>
        </div>
      </section>
      <SectionNav items={pageSections.capabilities} />
      <section
        id="disciplines"
        className="bg-secondary"
        aria-labelledby="capability-depth"
      >
        <div className="page-container section-space">
          <p className="eyebrow mb-5">CONNECTED DISCIPLINES</p>
          <h2 id="capability-depth" className="section-title">
            Build the whole experience.
          </h2>
          <p className="mt-5 mb-10 text-muted-foreground">
            Different strengths. Connected from the start.
          </p>
          <div className="grid gap-6 lg:grid-cols-3">
            {capabilityDetails.map((detail) => (
              <ImageCard key={detail.title} {...detail}>
                <ul className="mt-6 list-disc space-y-3 border-t border-border pt-5 pl-5 marker:text-muted-foreground">
                  {detail.examples.map((example) => (
                    <li key={example} className="text-sm">
                      {example}
                    </li>
                  ))}
                </ul>
              </ImageCard>
            ))}
          </div>
        </div>
      </section>
      <section
        id="starting-points"
        className="bg-background"
        aria-labelledby="start-small"
      >
        <div className="page-container section-space">
          <h2 id="start-small" className="section-title">
            Start with the uncertainty.
          </h2>
          <p className="mt-5 mb-10 text-muted-foreground">
            Choose the question that sounds like yours.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {startingPoints.map((point) => (
              <ImageCard
                key={point.title}
                {...point}
                label="Starting point"
              />
            ))}
          </div>
        </div>
      </section>
      <PageNextStep
        title="What should technology make possible?"
        description="Bring the challenge. We’ll connect the right disciplines."
      />
    </>
  );
}
