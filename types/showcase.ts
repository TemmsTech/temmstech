export type ShowcaseProject = {
  id: string;
  title: string;
  category: string;
  url: string;
  /** Local screenshots. Only needed for the 3D hero devices; work cards use the live site. */
  desktopImage?: string;
  mobileImage?: string;
};
/** A project that has the screenshots the 3D hero devices need. */
export type CapturedProject = ShowcaseProject & {
  desktopImage: string;
  mobileImage: string;
};
