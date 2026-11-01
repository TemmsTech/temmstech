import { Arrow } from "@/components/arrow";
import { Button } from "@/components/ui/button";
import { BriefReveal } from "@/modules/cta";
import { ImageTile } from "@/components/image-tile";
import { ImageCard } from "@/components/image-card";
import { SectionNav } from "@/components/section-nav";
import {
  briefPrompts,
  deliveryStages,
  pageIntros,
  pageSections,
} from "@/data/pages";

// What the work looks like once you have shared your brief: the first stages of
// our approach, so the contact page never repeats the "what to bring" cards.
const nextSteps = deliveryStages
  .slice(0, 3)
  .map(({ title, description }) => ({ title, description }));

export function ContactPage() {
  return (
    <>
      <section className="bg-brand text-ink" aria-labelledby="page-title">
        <div className="page-container py-16 text-center lg:py-20">
          <p className="eyebrow mb-6">LET’S MAKE A START</p>
          <h1 id="page-title" className="hero-title mx-auto max-w-4xl">
            {pageIntros.contact.title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8">
            An idea, a challenge, or a better way of doing things.
          </p>
          <Button asChild size="lg" variant="ink" className="mt-8">
            <a href="#contact">
              Prepare your brief <Arrow />
            </a>
          </Button>
          <div className="contact-float mt-12 grid grid-cols-3 gap-3 text-left sm:gap-6">
            {briefPrompts.map((prompt, index) => (
              <ImageTile
                key={prompt.title}
                image={prompt.image}
                caption={prompt.title}
                className={`aspect-[3/4] sm:aspect-video ${index === 1 ? "-translate-y-3 sm:-translate-y-6" : ""}`}
              />
            ))}
          </div>
        </div>
      </section>
      <SectionNav items={pageSections.contact} />
      <section
        id="brief-guide"
        className="bg-background"
        aria-labelledby="guide-title"
      >
        <div className="page-container section-space">
          <h2 id="guide-title" className="section-title">
            Three things to bring.
          </h2>
          <p className="mt-5 mb-10 text-muted-foreground">
            No polished pitch required.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {briefPrompts.map((prompt) => (
              <ImageCard
                key={prompt.title}
                {...prompt}
              />
            ))}
          </div>
        </div>
      </section>
      <BriefReveal points={nextSteps} />
    </>
  );
}
