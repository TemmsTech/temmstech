import type { Metadata } from "next";
import { privacyPolicy } from "@/data/legal";
import { LegalPage } from "@/modules/legal";

export const metadata: Metadata = { title: "Privacy Policy | TemmsTech" };

export default function Page() {
  return <LegalPage document={privacyPolicy} />;
}
