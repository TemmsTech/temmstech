"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { usePathname } from "next/navigation";
import { contactHref } from "@/lib/contact";

/** Link to the nearest brief form for the page it is rendered on. */
export function ContactLink(props: Omit<ComponentProps<typeof Link>, "href">) {
  return <Link {...props} href={contactHref(usePathname())} />;
}
