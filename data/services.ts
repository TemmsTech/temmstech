import type { Service } from "@/types/content";

// Photos are hotlinked from Unsplash (images.unsplash.com). All are published
// under the Unsplash License — free to use commercially, no attribution
// required — see https://unsplash.com/license. `w=1200&q=80&auto=format&fit=crop`
// keeps each request to a reasonably sized, pre-cropped asset.
const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?w=1200&q=80&auto=format&fit=crop`;

export const services = [
  {
    id: "web",
    // "turned-on monitor displaying digital products" — Daniel Korpai
    image: unsplash("photo-1547658719-da2b51169166"),
    title: "Web & digital platforms",
    description:
      "From a standout website to a complex platform. Digital experiences designed to turn attention into action.",
  },
  {
    id: "apps",
    // "space gray iPhone X" — William Hook
    image: unsplash("photo-1512941937669-90a1b58e7e9c"),
    title: "App development",
    description:
      "Bring your idea into people’s hands with applications built around how they live, work, and connect.",
  },
  {
    id: "hardware",
    // "flat lay photography of circuit board" — Robin Glauser
    image: unsplash("photo-1555664424-778a1e5e1b48"),
    title: "Hardware & connected systems",
    description:
      "Take technology beyond the screen. Develop devices and the software that connects them to the real world.",
  },
  {
    id: "ai",
    // "abstract image of a sphere with dots and lines" — Growtika
    image: unsplash("photo-1674027444485-cec3da58eef4"),
    title: "AI-integrated solutions",
    description:
      "Make intelligence a useful part of your product — through AI-powered features, connected workflows, and automation.",
  },
  {
    id: "custom",
    // "people sitting down near table with assorted laptop computers" — Marvin Meyer
    image: unsplash("photo-1519389950473-47ba0277781c"),
    title: "Custom software & systems",
    description:
      "SaaS, commerce, education, business tools, or something entirely new. We build around the opportunity, not the category.",
  },
  {
    id: "integration",
    // "man writing on white board" — Campaign Creators
    image: unsplash("photo-1542744094-24638eff58bb"),
    title: "Automation & integrations",
    description:
      "Bring your tools, data, and processes together. Replace disconnected steps with a system that moves as one.",
  },
] satisfies Service[];
