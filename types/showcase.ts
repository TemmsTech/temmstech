export type ShowcaseProject = {
  id: string;
  title: string;
  category: string;
  url: string;
};

/** A video played in the miniature player on the device screens. */
export type ShowcaseVideo = {
  title: string;
  /** e.g. /videos/name.mp4 */
  src: string;
  poster?: string;
};
