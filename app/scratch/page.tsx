import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "@/modules/hero";
import { Services } from "@/modules/services";
import { heroContent, servicesIntro } from "@/data/page";
import { services } from "@/data/services";
import { showcaseProjects } from "@/data/device-showcase";
import { OpenZoom } from "@/components/open-zoom";

// DEV ONLY. The real hero with the laptop already in "Zoom in & interact".
// Nothing in the real site imports this folder: delete app/scratch to remove it.
export const metadata: Metadata = {
  title: "Scratch",
  robots: { index: false, follow: false },
};

export default function ScratchPage() {
  // Gone from production builds (a 404) unless ENABLE_SCRATCH=1 is set.
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_SCRATCH !== "1")
    notFound();
  return (
    <>
      {/* Same pieces, data and order as modules/home. No intro video, so it
          never covers the screen while an app is being tried. */}
      <Hero
        content={heroContent}
        projects={showcaseProjects}
        nextSectionId={servicesIntro.id}
      />
      <Services intro={servicesIntro} services={services} />
      <OpenZoom />
    </>
  );
}
