import type { Project } from "@/types/project";

export const projects = [
  {
    id: "storefront",
    title: "A better way to sell.",
    category: "COMMERCE PLATFORM",
    kind: "commerce",
    description:
      "A storefront concept that brings thoughtful shopping and straightforward store management together.",
    tags: ["E-commerce", "Customer experience"],
    sample: true,
    brief:
      "Explore a connected storefront, product discovery, and order-management experience. This is an illustrative concept, not a delivered client project.",
  },
  {
    id: "learning",
    title: "Make room for learning.",
    category: "LEARNING PLATFORM",
    kind: "education",
    description:
      "A learning-space concept that helps students find their next lesson and educators organise their content.",
    tags: ["EdTech", "Digital platform"],
    sample: true,
    brief:
      "Explore course organisation, lesson discovery, and a clear learning journey. This is an illustrative concept, not a delivered client project.",
  },
  {
    id: "operations",
    title: "Less friction. More flow.",
    category: "BUSINESS WORKSPACE",
    kind: "operations",
    description:
      "An operations concept that gives a team a shared place to organise tasks, requests, and everyday work.",
    tags: ["Internal tools", "Automation"],
    sample: true,
    brief:
      "Explore a shared queue for incoming work, clear ownership, and connected workflows. This is an illustrative concept, not a delivered client project.",
  },
] satisfies Project[];
