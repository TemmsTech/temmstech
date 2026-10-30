import type { LinkAction } from "@/types/content";
export type HeroContent = {
  eyebrow: string;
  headline: string;
  emphasis: string;
  alternateHeadlines: readonly {
    headline: string;
    emphasis: string;
    description: string;
  }[];
  description: string;
  primaryAction: LinkAction;
  secondaryAction: LinkAction;
  disciplines: readonly string[];
};
