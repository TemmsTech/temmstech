import { Arrow } from "@/components/arrow";
import { Button } from "@/components/ui/button";
import { BriefReveal } from "@/modules/cta";
import { LiveFrame } from "@/components/live-frame";
import { showcaseProjects } from "@/data/device-showcase";
import { BriefCards } from "@/components/brief-cards";
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

// Three rows of works. The grid has 2, 3 or 4 columns depending on screen width,
// so the tiles past the first 6 or 9 only appear on wider screens. Hidden tiles
// never load their live sites. Stepping through the list three at a time keeps
// the same site from sitting next to itself.
const backdropWorks = Array.from(
  { length: 12 },
  (_, index) => showcaseProjects[(index * 3) % showcaseProjects.length],
);

function tileVisibility(index: number) {
  if (index >= 9) return "hidden lg:block";
  if (index >= 6) return "hidden md:block";
  return "";
}

// The last word of the title is picked out in the brand blue, like the other
// page heroes. Splitting it here keeps the wording in one place (the page data).
const titleWords = pageIntros.contact.title.split(" ");
const titleAccent = titleWords.pop();
const titleLead = titleWords.join(" ");

export function ContactPage() {
  return (
    <>
      <section
        className="relative flex min-h-[calc(100svh-5rem)] items-start overflow-hidden bg-ink"
        aria-labelledby="page-title"
      >
        {/* Wall of our work: three rows that fill the whole section. The navbar's
            dark colour shows in the gaps, and each tile is faded slightly
            towards white (no tint). */}
        <div
          className="pointer-events-none absolute inset-0 select-none bg-ink"
          aria-hidden="true"
          inert
        >
          <div className="grid h-full grid-cols-2 grid-rows-3 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {backdropWorks.map((project, index) => (
              <div
                key={`${project.id}-${index}`}
                className={`relative overflow-hidden bg-white [container-type:size] ${tileVisibility(index)}`}
              >
                <LiveFrame
                  url={project.url}
                  title={project.title}
                  controls={false}
                  className="absolute top-1/2 left-1/2 w-[max(100cqw,calc(100cqh*12/7))] -translate-x-1/2 -translate-y-1/2 opacity-80"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="page-container relative w-full pb-16 lg:pb-20">
          <div className="dark-surface mx-auto max-w-5xl rounded-b-3xl border border-t-0 border-white/10 bg-background/95 px-6 py-12 text-center shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] backdrop-blur-md sm:px-12 sm:py-16">
            <p className="eyebrow mb-6">LET’S MAKE A START</p>
            <h1 id="page-title" className="hero-title mx-auto max-w-4xl">
              {titleLead} <span className="text-brand">{titleAccent}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 sm:text-xl sm:leading-9">
              An idea, a challenge, or a better way of doing things. Tell us
              what you are trying to achieve, who it is for, and what is
              getting in the way. A rough outline is plenty, and we will help
              you shape the rest together.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Button asChild size="lg">
                <a href="#contact">
                  Contact us <Arrow />
                </a>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#brief-guide">
                  Learn more <Arrow className="size-5 rotate-90" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <SectionNav items={pageSections.contact} />
      <section
        id="brief-guide"
        className="fill-below-nav flex items-center bg-background"
        aria-labelledby="guide-title"
      >
        <div className="page-container section-space w-full">
          <h2 id="guide-title" className="section-title">
            Three things to bring.
          </h2>
          <p className="mt-5 mb-10 text-muted-foreground">
            No polished pitch required.
          </p>
          <BriefCards prompts={briefPrompts} />
        </div>
      </section>
      <BriefReveal points={nextSteps} />
    </>
  );
}
