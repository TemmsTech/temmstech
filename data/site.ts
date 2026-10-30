import type { SiteMetadata } from "@/types/site";

export const site = {
  name: "TemmsTech",
  description:
    "TemmsTech is the product and technology company behind products used by millions. Explore our software, hardware, and AI capabilities.",
} satisfies SiteMetadata;

export const contact: { email: string | null } = { email: null };
