import type { Metadata } from "next";
import { termsOfUse } from "@/data/legal";
import { LegalPage } from "@/modules/legal";

export const metadata: Metadata = { title: "Terms of Use | TemmsTech" };

export default function Page() {
  return <LegalPage document={termsOfUse} />;
}
