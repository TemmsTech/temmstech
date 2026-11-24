/** What the simulated Recycle Bin holds. Everything here is made up: names echo the owner's own projects, the dates are counted back from the visitor's clock, and the folder is a placeholder user path. */
export type BinKind = "folder" | "zip" | "video" | "site" | "mobile" | "model";

export type BinItem = {
  id: string;
  name: string;
  kind: BinKind;
  /** The type column of the Details pane, e.g. "PNG File". */
  type: string;
  /** Where it was deleted from. */
  from: string;
  size: string;
  /** [days ago, hour, minute] */
  deleted: readonly [number, number, number];
  /** Page thumbnails: [background, accent]. */
  look?: readonly [string, string];
};

const HOME = "C:\\Users\\dev\\";
const DONEL = ["#14110f", "#d9c3a0"] as const;
const MAKINDE = ["#0e1420", "#4cc2ff"] as const;
const MOG = ["#f2f3f5", "#e5484d"] as const;
const NAIJA = ["#eef4ee", "#1f9d62"] as const;
const TALAWAN = ["#10221a", "#c9a24a"] as const;

const page = (
  name: string,
  look: readonly [string, string],
  mobile: boolean,
  from: string,
  deleted: BinItem["deleted"],
  size: string,
): BinItem => ({
  id: name,
  name,
  kind: mobile ? "mobile" : "site",
  type: "PNG File",
  from: `${HOME}${from}`,
  size,
  deleted,
  look,
});

export const binItems: readonly BinItem[] = [
  { id: "zip-temmstech", name: "TemmsTech", kind: "zip", type: "Compressed (zipped) Folder", from: `${HOME}Downloads`, size: "14.2 MB", deleted: [2, 15, 42] },
  { id: "zip-interact", name: "TemmsTech-interact-mode", kind: "zip", type: "Compressed (zipped) Folder", from: `${HOME}Downloads`, size: "13.8 MB", deleted: [2, 15, 40] },
  { id: "dir-interact", name: "TemmsTech-interact-mode", kind: "folder", type: "File folder", from: `${HOME}Downloads`, size: "—", deleted: [2, 15, 40] },
  { id: "zip-hero", name: "TemmsTech-hero-motion", kind: "zip", type: "Compressed (zipped) Folder", from: `${HOME}Downloads`, size: "12.9 MB", deleted: [4, 9, 18] },
  { id: "dir-hero", name: "TemmsTech-hero-motion", kind: "folder", type: "File folder", from: `${HOME}Downloads`, size: "—", deleted: [4, 9, 18] },
  { id: "intro", name: "intro", kind: "video", type: "MP4 Video File", from: `${HOME}Videos`, size: "8.4 MB", deleted: [5, 20, 7] },
  page("donelclasico-desktop", DONEL, false, "Pictures\\Screenshots", [5, 11, 36], "412 KB"),
  page("donelclasico-mobile", DONEL, true, "Pictures\\Screenshots", [5, 11, 36], "188 KB"),
  page("makinde-desktop", MAKINDE, false, "Pictures\\Screenshots", [6, 14, 3], "366 KB"),
  page("makinde-mobile", MAKINDE, true, "Pictures\\Screenshots", [6, 14, 3], "171 KB"),
  page("mog-nine-desktop", MOG, false, "Pictures\\Screenshots", [6, 16, 51], "524 KB"),
  page("mog-nine-mobile", MOG, true, "Pictures\\Screenshots", [6, 16, 51], "203 KB"),
  page("naijalearn-desktop", NAIJA, false, "Pictures\\Screenshots", [7, 10, 24], "447 KB"),
  page("naijalearn-mobile", NAIJA, true, "Pictures\\Screenshots", [7, 10, 24], "196 KB"),
  page("talawan-desktop", TALAWAN, false, "Pictures\\Screenshots", [8, 13, 9], "389 KB"),
  page("talawan-mobile", TALAWAN, true, "Pictures\\Screenshots", [8, 13, 9], "177 KB"),
  { id: "dir-temms", name: "Temms Tech", kind: "folder", type: "File folder", from: `${HOME}Desktop`, size: "—", deleted: [9, 8, 30] },
  { id: "zip-temms", name: "Temms Tech", kind: "zip", type: "Compressed (zipped) Folder", from: `${HOME}Desktop`, size: "11.6 MB", deleted: [9, 8, 29] },
  { id: "iphone-16", name: "iphone-16", kind: "model", type: "3D Object", from: `${HOME}Documents`, size: "6.1 MB", deleted: [12, 19, 55] },
];
