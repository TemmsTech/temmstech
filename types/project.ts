export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  kind: "commerce" | "education" | "operations";
  tags: string[];
  sample: true;
  brief: string;
};
