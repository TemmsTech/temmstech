import type { CapturedProject, ShowcaseProject } from "@/types/showcase";

export const showcaseProjects = [
  {
    id: "mog-nine",
    title: "MOG",
    category: "AI meeting assistant",
    url: "https://mog-nine.vercel.app/",
    desktopImage: "/showcases/mog-nine-desktop.png",
    mobileImage: "/showcases/mog-nine-mobile.png",
  },
  {
    id: "donelclasico",
    title: "Don Elclasico Wears",
    category: "Fashion commerce",
    url: "https://donelclasico.netlify.app",
    desktopImage: "/showcases/donelclasico-desktop.png",
    mobileImage: "/showcases/donelclasico-mobile.png",
  },
  {
    id: "santystitches",
    title: "Santy Stitches",
    category: "Luxury fashion",
    url: "https://santystitches.netlify.app",
    desktopImage: "/showcases/santystitches-desktop.png",
    mobileImage: "/showcases/santystitches-mobile.png",
  },
  {
    id: "talawan",
    title: "Talawan Global Farms",
    category: "Agriculture",
    url: "https://talawan-global-farms.vercel.app/",
    desktopImage: "/showcases/talawan-desktop.png",
    mobileImage: "/showcases/talawan-mobile.png",
  },
  {
    id: "naijalearn",
    title: "NaijaLearn",
    category: "Education",
    url: "https://naijalearn.netlify.app/",
    desktopImage: "/showcases/naijalearn-desktop.png",
    mobileImage: "/showcases/naijalearn-mobile.png",
  },
  {
    id: "makinde",
    title: "Makinde Bibitayo",
    category: "Personal portfolio",
    url: "https://makindebibitayo.netlify.app/",
    desktopImage: "/showcases/makinde-desktop.png",
    mobileImage: "/showcases/makinde-mobile.png",
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

const hasCaptures = (project: ShowcaseProject): project is CapturedProject =>
  Boolean(project.desktopImage && project.mobileImage);

/** The 3D hero devices only show projects that have local screenshots. */
export const heroProjects: readonly CapturedProject[] =
  showcaseProjects.filter(hasCaptures);
