export type LegalSection = {
  id: string;
  title: string;
  /** Short label for the "On this page" bar; falls back to the title. */
  short?: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
};

export type LegalDocument = {
  slug: "privacy" | "terms";
  title: string;
  summary: string;
  updated: string;
  sections: readonly LegalSection[];
};
