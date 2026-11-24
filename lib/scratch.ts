/**
 * SCRATCH ONLY switch. Things still being tried run only on /scratch. Right now
 * that is the desktop icon cleanup (TRIMMED_ICONS in lib/screen-desktop.ts).
 * To release it, make that check return true; when nothing uses this any more,
 * delete this file and app/scratch.
 */
export const onScratch = () =>
  typeof location !== "undefined" && location.pathname.startsWith("/scratch");
