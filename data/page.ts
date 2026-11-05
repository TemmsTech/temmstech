import type { HeroContent } from "@/modules/hero";
import type { SectionIntro } from "@/types/content";

export const heroContent = {
  eyebrow: "TEMMSTECH / A PRODUCT & TECHNOLOGY COMPANY",
  headline: "Built by us.",
  emphasis: "Used by millions.",
  alternateHeadlines: [
    {
      headline: "Made to work.",
      emphasis: "Made for people.",
      description: "Across web platforms, mobile apps, connected hardware, and AI, one multidisciplinary team turns difficult challenges into dependable products that keep moving forward.",
    },
    {
      headline: "Code. Craft. AI.",
      emphasis: "One TemmsTech.",
      description: "Ideas deserve more than a pitch. We design, build, and launch thoughtful systems that work in the real world, then improve them with what people actually need.",
    },
  ],
  description:
    "We’re the developers, programmers, and makers behind products people use every day. Across software, hardware, and AI, we turn ambitious ideas into technology that makes it into the world.",
  primaryAction: { label: "Build with TemmsTech", href: "#contact" },
  secondaryAction: { label: "Discover our capabilities", href: "#services" },
  disciplines: [
    "Web & platforms",
    "Applications",
    "Hardware",
    "AI & automation",
  ],
} satisfies HeroContent;

export const servicesIntro = {
  id: "services",
  eyebrow: "01 / OUR CAPABILITIES",
  title: "Different talents. Shared ambition.",
  description:
    "One multidisciplinary company, working across the digital and physical world. These are some of the ways we build — not the limits of what we can do.",
} satisfies SectionIntro;
export const portfolioIntro = {
  id: "work",
  eyebrow: "02 / PREVIOUS WORK",
  title: "Selected work.",
  description:
    "A selection of websites we’ve built. Explore the work, then visit each site to see it for yourself.",
} satisfies SectionIntro;
export const processIntro = {
  id: "approach",
  eyebrow: "03 / FROM IDEA TO EVERYDAY USE",
  title: "We don’t stop at the build.",
  description:
    "Understand the problem. Make the right thing. Put it into people’s hands. Our approach connects thoughtful design, clear engineering, and learning from real use.",
} satisfies SectionIntro;
export const contactIntro = {
  id: "contact",
  eyebrow: "LET’S MAKE YOUR NEXT BIG THING REAL.",
  title: "What should we build next?",
  description: "Bring the idea. Bring the challenge. We’ll bring the team.",
} satisfies SectionIntro;
export const contactPoints = [
  {
    title: "Tell us the problem",
    description: "A few lines are enough. No polished pitch required.",
  },
  {
    title: "Work through it together",
    description:
      "Agree on priorities, scope, and what a useful outcome looks like.",
  },
  {
    title: "Review something real early",
    description: "Four stages, with something useful to review at every step.",
  },
] satisfies readonly { title: string; description: string }[];

export const conceptsIntro = {
  id: "concepts",
  eyebrow: "PRODUCT EXPLORATIONS",
  title: "Space for what comes next.",
  description:
    "Sample concepts exploring commerce, learning, and business tools. These are design explorations, separate from our previous work.",
} satisfies SectionIntro;
