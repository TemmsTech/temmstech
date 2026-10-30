import type { Metadata } from "next";
import { WorkPage } from "@/modules/company-pages";

export const metadata: Metadata = { title: "Our work | TemmsTech" };

export default function Page() {
  return <WorkPage />;
}
