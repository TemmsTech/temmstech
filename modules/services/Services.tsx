import { Section } from "@/components/section";
import { ServiceCard } from "@/components/service-card";
import type { Service, SectionIntro } from "@/types/content";
export function Services({
  intro,
  services,
}: {
  intro: SectionIntro;
  services: readonly Service[];
}) {
  return (
    <Section intro={intro}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </Section>
  );
}
