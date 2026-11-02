import { TabletTransition } from "@/components/tablet-transition";
import { Hero } from "@/modules/hero";
import { Services } from "@/modules/services";
import { Portfolio } from "@/modules/portfolio";
import { Process } from "@/modules/process";
import { Cta } from "@/modules/cta";
import {
  heroContent,
  servicesIntro,
  portfolioIntro,
  processIntro,
  contactIntro,
  contactPoints,
} from "@/data/page";
import { services } from "@/data/services";
import { processSteps } from "@/data/approach";
import { heroProjects, showcaseProjects } from "@/data/device-showcase";
export function Home() {
  return (
    <>
      <Hero
        content={heroContent}
        projects={heroProjects}
        nextSectionId={servicesIntro.id}
      />
      <Services intro={servicesIntro} services={services} />
      {/* Laptops: tablet, then phone. Tablets: phone only. Phones: none. */}
      <TabletTransition
        fromId={servicesIntro.id}
        toId={portfolioIntro.id}
        device="tablet"
        forKinds={["laptop"]}
      />
      <TabletTransition
        fromId={servicesIntro.id}
        toId={portfolioIntro.id}
        device="phone"
        forKinds={["tablet"]}
      />
      <Portfolio
        intro={portfolioIntro}
        projects={showcaseProjects}
        batchSize={4}
      />
      <TabletTransition
        fromId={portfolioIntro.id}
        toId={processIntro.id}
        device="phone"
        forKinds={["laptop"]}
      />
      <Process intro={processIntro} steps={processSteps} />
      <Cta
        intro={contactIntro}
        points={contactPoints}
      />
    </>
  );
}
