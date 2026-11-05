import { services } from "@/data/services";

// Photos are hotlinked from Unsplash (images.unsplash.com), published under the
// Unsplash License: free for commercial use, no attribution required. See
// https://unsplash.com/license. The first slide in each panel is the original
// still, so the page looks the same before the slideshow starts.
const unsplash = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?w=1200&q=80&auto=format&fit=crop`;

export const capabilityHeroSlides = {
  digital: [
    services[0].image,
    // "A MacBook with lines of code on its screen on a busy desk"
    unsplash("photo-1498050108023-c5249f4df085"),
    // "MacBook Pro on table beside white iMac and Magic Mouse"
    unsplash("photo-1499951360447-b19be8fe80f5"),
    // "monitor showing Java programming"
    unsplash("photo-1461749280684-dccba630e2f6"),
  ],
  hardware: [
    services[2].image,
    // "brown Around computer motherboard"
    unsplash("photo-1553406830-ef2513450d76"),
    // "focus photo of gray and black circuit board"
    unsplash("photo-1517055729445-fa7d27394b48"),
    // "a group of electronic components laid out on a table"
    unsplash("photo-1577962144759-8dec6b55c952"),
  ],
  ai: [
    services[3].image,
    // "a computer circuit board with a brain on it"
    unsplash("photo-1677442135703-1787eea5ce01"),
    // "a computer chip with the letter a on top of it"
    unsplash("photo-1697577418970-95d99b5a55cf"),
    // "Abstract blue waves of glowing particles"
    unsplash("photo-1757466762489-52fea38071ad"),
  ],
} as const satisfies Record<string, readonly string[]>;
