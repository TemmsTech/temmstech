import type { ShowcaseProject, ShowcaseVideo } from "@/types/showcase";

/** Plays once in the miniature player on the hero screens, then minimises. */
export const showcaseVideo: ShowcaseVideo = {
  title: "TemmsTech intro",
  src: "/videos/intro.mp4",
};

export const showcaseProjects = [
  {
    id: "mog-nine",
    title: "MOG",
    category: "AI meeting assistant",
    url: "https://mog-nine.vercel.app/",
  },
  {
    id: "donelclasico",
    title: "Don Elclasico Wears",
    category: "Fashion commerce",
    url: "https://donelclasico.netlify.app",
  },
  {
    id: "talawan",
    title: "Talawan Global Farms",
    category: "Agriculture",
    url: "https://talawan-global-farms.vercel.app/",
  },
  {
    id: "naijalearn",
    title: "NaijaLearn",
    category: "Education",
    url: "https://naijalearn.netlify.app/",
  },
  {
    id: "makinde",
    title: "Makinde Bibitayo",
    category: "Personal portfolio",
    url: "https://makindebibitayo.netlify.app/",
  },
  {
    id: "cmwgtours",
    title: "CMWG Travel",
    category: "Travel & tours",
    url: "https://cmwgtours.netlify.app",
  },
  {
    id: "proximitynews",
    title: "Proximity News",
    category: "News",
    url: "https://proximitynews.netlify.app",
  },
] satisfies readonly ShowcaseProject[];
