import type { ReactNode } from "react";
import type { SectionIntro } from "@/types/content";
import { SectionHeading } from "@/components/section-heading";
import { cn } from "@/lib/utils";

type SectionProps = {
  intro: SectionIntro;
  tone?: "light" | "muted" | "dark";
  children: ReactNode;
  showHeading?: boolean;
};
export function Section({
  intro,
  tone = "light",
  children,
  showHeading = true,
}: SectionProps) {
  return (
    <section
      id={intro.id}
      aria-labelledby={`${intro.id}-title`}
      className={cn(
        tone === "dark" && "dark-surface bg-background",
        tone === "muted" && "bg-secondary",
        tone === "light" && "bg-background",
      )}
    >
      <div className="page-container section-space">
        {showHeading ? (
          <SectionHeading
            id={`${intro.id}-title`}
            eyebrow={intro.eyebrow}
            title={intro.title}
            description={intro.description}
          />
        ) : (
          <>
            <h2 id={`${intro.id}-title`} className="sr-only">
              {intro.title}
            </h2>
            {intro.description && (
              <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {intro.description}
              </p>
            )}
          </>
        )}
        {children}
      </div>
    </section>
  );
}
