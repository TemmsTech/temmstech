import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site, contact } from "@/data/site";
import { Navbar } from "@/modules/navbar";
import { Footer } from "@/modules/footer";
import { navigation } from "@/data/navigation";
import { services } from "@/data/services";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "TemmsTech — Built by us. Used by millions.",
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body
        id="top"
        className="min-h-dvh bg-ink font-sans text-foreground antialiased"
      >
        <a
          href="#main-content"
          className="sr-only rounded-md bg-background px-4 py-3 font-medium text-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
        >
          Skip to content
        </a>
        <Navbar navigation={navigation} />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer
          navigation={navigation}
          services={services}
          email={contact.email}
        />
      </body>
    </html>
  );
}
