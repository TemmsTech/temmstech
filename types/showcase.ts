export type ShowcaseProject = {
  id: string;
  title: string;
  category: string;
  url: string;
  /** Optional video (e.g. /videos/name.mp4) played on the screen instead of the live site. */
  video?: string;
};
