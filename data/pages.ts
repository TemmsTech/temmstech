import type { PageIntroContent } from "@/types/page";
import { services } from "@/data/services";
import { processSteps } from "@/data/approach";

export const pageIntros = {
  capabilities: {
    eyebrow: "WHAT WE BUILD",
    title: "Big ideas need more than one kind of thinking.",
    description:
      "Web, apps, hardware, and AI. Bring the challenge; we’ll bring the disciplines together to build a useful solution.",
    image: services[2].image,
  },
  work: {
    eyebrow: "THE WORK",
    title: "Ideas, out in the world.",
    description:
      "Explore a selection of our websites, followed by sample concepts for what could come next. Different projects, the same care in the details.",
    image: services[0].image,
  },
  approach: {
    eyebrow: "HOW WE WORK",
    title: "From the first question to the next release.",
    description:
      "A clear problem. A shared direction. Thoughtful design and engineering, with room to learn as we build.",
    image: processSteps[0].image,
  },
  contact: {
    eyebrow: "LET’S TALK",
    title: "Your next idea starts with a conversation.",
    description:
      "Tell us what you’re imagining, what needs to work better, or where you’re getting stuck. We’ll start with the problem and work from there.",
    image: processSteps[1].image,
  },
} satisfies Record<string, PageIntroContent>;

type CapabilityDetail = {
  title: string;
  description: string;
  examples: readonly string[];
  image: string;
};
export const capabilityDetails = [
  {
    title: "Experiences people use",
    image: services[0].image,
    description: "Interfaces that make the everyday feel effortless.",
    examples: [
      "Websites and commerce",
      "Mobile and web applications",
      "Learning and customer portals",
    ],
  },
  {
    title: "Systems behind the experience",
    image: services[4].image,
    description: "Tools, data, and workflows that work together.",
    examples: [
      "Custom business software",
      "Integrations and workflow automation",
      "Data tools and operational dashboards",
    ],
  },
  {
    title: "Intelligence beyond the screen",
    image: services[2].image,
    description:
      "Connected hardware and useful AI, built into the bigger picture.",
    examples: [
      "Connected-device interfaces",
      "AI-assisted product features",
      "Software and hardware prototypes",
    ],
  },
] satisfies CapabilityDetail[];

type DeliveryStage = {
  title: string;
  question: string;
  description: string;
  outputs: readonly string[];
  image: string;
};
export const deliveryStages = [
  {
    title: "Frame the problem",
    question: "What needs to change?",
    image: processSteps[0].image,
    description:
      "Find the real problem. Agree what a useful outcome looks like.",
    outputs: [
      "Problem statement",
      "Priorities and constraints",
      "Initial scope",
    ],
  },
  {
    title: "Make it tangible",
    question: "Does the idea work in practice?",
    image: processSteps[2].image,
    description:
      "Test the important assumptions with something people can try.",
    outputs: [
      "User journeys",
      "Prototype for discussion",
      "Technical direction",
    ],
  },
  {
    title: "Build in useful increments",
    question: "What can we try next?",
    image: processSteps[3].image,
    description: "Build, review, and improve in clear, working increments.",
    outputs: [
      "Working increments",
      "Review notes",
      "Checks for critical journeys",
    ],
  },
  {
    title: "Prepare for real use",
    question: "Are the product and the people ready?",
    image: processSteps[4].image,
    description: "Check the release. Equip the people. Plan what comes next.",
    outputs: ["Release checklist", "Handover guidance", "Next-step backlog"],
  },
] satisfies DeliveryStage[];

export const collaborationNotes = [
  {
    title: "Make decisions visible",
    image: processSteps[1].image,
    description:
      "One shared view of priorities, trade-offs, and open questions.",
  },
  {
    title: "Review working things",
    image: processSteps[2].image,
    description: "Real screens and working flows make feedback useful.",
  },
  {
    title: "Agree the next step",
    image: processSteps[0].image,
    description: "Leave each review with a clear decision and an owner.",
  },
];

export const briefPrompts = [
  {
    title: "The situation",
    image: processSteps[1].image,
    description: "What needs to work better, and where is it getting in the way today?",
  },
  {
    title: "The people",
    image: processSteps[0].image,
    description: "Who will use it, who is affected, and who needs to be involved?",
  },
  {
    title: "The practical details",
    image: services[0].image,
    description: "Useful links, timing, and a budget range if you have one.",
  },
];

export const startingPoints = [
  {
    title: "Test an idea",
    description: "Make the unknown tangible with a focused prototype.",
    image: processSteps[2].image,
  },
  {
    title: "Connect the pieces",
    description: "Bring scattered tools and manual steps into one flow.",
    image: services[5].image,
  },
  {
    title: "Take the next step",
    description: "Extend a product that already has a place in the world.",
    image: processSteps[5].image,
  },
];

export const pageSections = {
  capabilities: [
    { id: "disciplines", label: "Disciplines" },
    { id: "starting-points", label: "Starting points" },
    { id: "contact", label: "Let’s build" },
  ],
  work: [
    { id: "work", label: "Selected work" },
    { id: "concepts", label: "Concept lab" },
    { id: "contact", label: "Your project" },
  ],
  approach: [
    { id: "delivery", label: "The process" },
    { id: "collaboration", label: "Working together" },
    { id: "contact", label: "Get started" },
  ],
  contact: [
    { id: "brief-guide", label: "What to share" },
    { id: "contact", label: "Your brief" },
  ],
} satisfies Record<
  string,
  readonly import("@/types/section-navigation").SectionNavItem[]
>;
