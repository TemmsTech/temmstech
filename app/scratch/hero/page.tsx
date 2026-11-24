import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { showcaseProjects } from "@/data/device-showcase";
import { servicesIntro } from "@/data/page";
import { RedesignedHero } from "./redesigned-hero";

// DEV ONLY. Preview of the hero redesign at /scratch/hero.
// Nothing in the real site imports this folder: delete app/scratch/hero to remove it.
export const metadata: Metadata = {
  title: "Scratch: hero redesign",
  robots: { index: false, follow: false },
};

export default function ScratchHeroPage() {
  // Gone from production builds (a 404) unless ENABLE_SCRATCH=1 is set.
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_SCRATCH !== "1")
    notFound();
  return (
    <RedesignedHero
      projects={showcaseProjects}
      nextSectionId={servicesIntro.id}
    />
  );
}
