/** How long each website stays open in the hero laptop before the next tab opens. */
export const SHOWCASE_INTERVAL_MS = 7000;
/** Pause after a video's last frame before the next tab opens. */
const VIDEO_TAIL_MS = 600;

const videoDurations = new Map<string, number>();

/** How long a project stays open: a video plays to its end, a site gets the default. */
export function showcaseDelay(project?: { video?: string }) {
  const duration = project?.video && videoDurations.get(project.video);
  return duration ? duration + VIDEO_TAIL_MS : SHOWCASE_INTERVAL_MS;
}

/** Reads each video's length from its metadata so tabs can wait for it. */
export function loadVideoDurations(projects: readonly { video?: string }[]) {
  if (typeof document === "undefined") return Promise.resolve();
  return Promise.all(
    projects.map(({ video }) => {
      if (!video || videoDurations.has(video)) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const probe = document.createElement("video");
        const done = () => {
          probe.removeAttribute("src");
          probe.load();
          resolve();
        };
        probe.preload = "metadata";
        probe.muted = true;
        probe.addEventListener("loadedmetadata", () => {
          if (Number.isFinite(probe.duration) && probe.duration > 0)
            videoDurations.set(video, probe.duration * 1000);
          done();
        });
        probe.addEventListener("error", done);
        probe.src = video;
      });
    }),
  ).then(() => undefined);
}
