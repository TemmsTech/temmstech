"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { useNavbarVisibility, usePageStartNavigation } from "@/hooks";
import { Brand } from "@/components/brand";
import { Arrow } from "@/components/arrow";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/types/content";

export function Navbar({ navigation }: { navigation: readonly NavItem[] }) {
  const pathname = usePathname();
  const beginNavigation = usePageStartNavigation();
  return (
    <NavbarContent
      key={pathname}
      navigation={navigation}
      pathname={pathname}
      beginNavigation={beginNavigation}
    />
  );
}

function NavbarContent({
  navigation,
  pathname,
  beginNavigation,
}: {
  navigation: readonly NavItem[];
  pathname: string;
  beginNavigation: (destination: string) => void;
}) {
  const navVisible = useNavbarVisibility();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  return (
    <header
      data-hidden={!navVisible && !open}
      inert={!navVisible && !open}
      aria-hidden={!navVisible && !open}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          setOpen(false);
          trigger.current?.focus();
        }
      }}
      className="site-navbar dark-surface sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md"
    >
      <div className="page-container flex h-20 items-center justify-between gap-6">
        <Brand onNavigate={() => beginNavigation("/")} />
        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onNavigate={() => beginNavigation(item.href)}
              aria-current={pathname === item.href ? "page" : undefined}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Button asChild className="hidden sm:inline-flex">
          <Link href="/contact" onNavigate={() => beginNavigation("/contact")}>
            Let’s talk <Arrow />
          </Link>
        </Button>
        <Button
          ref={trigger}
          variant="outline"
          size="icon"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="lg:hidden"
          onClick={() => setOpen(!open)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            {open ? (
              <path d="m6 6 12 12M6 18 18 6" />
            ) : (
              <path d="M4 8h16M4 16h16" />
            )}
          </svg>
        </Button>
      </div>
      <div
        id="mobile-navigation"
        inert={!open}
        className={`mobile-menu lg:hidden ${open ? "is-open" : ""}`}
      >
        <nav aria-label="Mobile" className="page-container overflow-hidden">
          <div className="flex flex-col gap-2 border-t border-border py-5">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onNavigate={() => beginNavigation(item.href)}
                aria-current={pathname === item.href ? "page" : undefined}
                className="nav-link py-3"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-3 self-start">
              <Link
                href="/contact"
                onNavigate={() => beginNavigation("/contact")}
                onClick={() => setOpen(false)}
              >
                Start a conversation <Arrow />
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
