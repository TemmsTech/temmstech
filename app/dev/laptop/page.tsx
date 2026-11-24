import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeviceShowcase } from "@/components/device-showcase";
import { showcaseProjects, showcaseVideo } from "@/data/device-showcase";

// Development scratch page. Remove this folder (app/dev) before release.
export const metadata: Metadata = {
  title: "Laptop scratch",
  robots: { index: false, follow: false },
};

export default function LaptopScratchPage() {
  // Never part of the real site: a production build answers 404.
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <section className="dark-surface hero-stage relative isolate overflow-hidden bg-background">
      <div className="page-container relative pt-6 pb-10">
        <DeviceShowcase
          projects={showcaseProjects}
          video={showcaseVideo}
          nextSectionId="scratch-next"
          startOpen
        />
      </div>
    </section>
  );
}
