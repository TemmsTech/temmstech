import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/"
      onNavigate={onNavigate}
      aria-label="TemmsTech home"
      className={cn("inline-flex min-h-11 items-center gap-3", className)}
    >
      <Image
        src="/images/brand/logo-mark.png"
        alt=""
        width={480}
        height={331}
        priority
        className="h-11 w-auto"
      />
      {/* Wordmark swaps automatically for the surface it's rendered on:
          .dark-surface sections (e.g. the navbar) get the white "Temms",
          everything else gets the ink-dark "Temms". */}
      <Image
        src="/images/brand/logo-wordmark-on-light.png"
        alt="TemmsTech"
        width={900}
        height={289}
        priority
        className="h-8 w-auto [.dark-surface_&]:hidden"
      />
      <Image
        src="/images/brand/logo-wordmark-on-dark.png"
        alt="TemmsTech"
        width={900}
        height={289}
        priority
        className="hidden h-8 w-auto [.dark-surface_&]:block"
      />
    </Link>
  );
}
