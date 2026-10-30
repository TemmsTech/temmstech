import type { Metadata } from "next";
import { ContactPage } from "@/modules/company-pages";

export const metadata: Metadata = { title: "Let’s talk | TemmsTech" };

export default function Page() {
  return <ContactPage />;
}
