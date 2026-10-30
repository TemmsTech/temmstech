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
} from "@/data/page";
import { services } from "@/data/services";
import { processSteps } from "@/data/approach";
import { contact } from "@/data/site";
import { showcaseProjects } from "@/data/device-showcase";
export function Home() {
  return (
    <>
      <Hero
        content={heroContent}
        projects={showcaseProjects}
        nextSectionId={servicesIntro.id}
      />
      <Services intro={servicesIntro} services={services} />
      <TabletTransition fromId={servicesIntro.id} toId={portfolioIntro.id} />
      <Portfolio
        intro={portfolioIntro}
        projects={showcaseProjects}
        batchSize={4}
      />
      <Process intro={processIntro} steps={processSteps} />
      <Cta intro={contactIntro} email={contact.email} />
    </>
  );
}
