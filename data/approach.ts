import type { ProcessStep } from "@/types/content";

// Photos are hotlinked from Unsplash (images.unsplash.com). All are published
// under the Unsplash License — free to use commercially, no attribution
// required — see https://unsplash.com/license. `w=1200&q=80&auto=format&fit=crop`
// keeps each request to a reasonably sized, pre-cropped asset.
const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?w=1200&q=80&auto=format&fit=crop`;

export const processSteps = [
  {
    title: "Understand",
    description:
      "Start with your people, the context, and the problem worth solving.",
    // "two women sitting beside table" — Mimi Thian
    image: unsplash("photo-1531496244015-67bec2b9952b"),
  },
  {
    title: "Plan",
    description:
      "Agree on priorities, scope, and what a useful outcome looks like.",
    // "man in white long sleeve shirt writing on white board" — airfocus
    image: unsplash("photo-1590402494610-2c378a9114c6"),
  },
  {
    title: "Design",
    description:
      "Make the experience tangible and work through the important details.",
    // "person holding black ipad with green plant" — Faizur Rehman
    image: unsplash("photo-1618788372246-79faff0c3742"),
  },
  {
    title: "Build",
    description: "Develop in clear, testable steps with room for feedback.",
    // "hands typing on a keyboard with computer screens" — Jakub Żerdzicki
    image: unsplash("photo-1759662011366-8a743eae9649"),
  },
  {
    title: "Launch",
    description: "Prepare the product, the people, and the path to going live.",
    // "rocket ship launching during daytime" — SpaceX
    image: unsplash("photo-1541185933-ef5d8ed016c2"),
  },
  {
    title: "Improve",
    description: "Learn from real use and decide what should come next.",
    // "a computer screen with a bunch of data on it" — 1981 Digital
    image: unsplash("photo-1686061593213-98dad7c599b9"),
  },
] satisfies ProcessStep[];
