import type { Metadata } from "next";
import { CapabilitiesPage } from "@/modules/company-pages";

export const metadata: Metadata = { title: "Capabilities | TemmsTech" };

export default function Page() {
  return <CapabilitiesPage />;
}
