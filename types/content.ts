export type NavItem = { label: string; href: `/${string}` };
export type LinkAction = { label: string; href: `#${string}` };
export type SectionIntro = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
};
export type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
};
export type ProcessStep = {
  title: string;
  description: string;
  image: string;
};
