import Link from "next/link";
import { Brand } from "@/components/brand";
import type { NavItem, Service } from "@/types/content";

type FooterProps = {
  navigation: readonly NavItem[];
  services: readonly Service[];
  email: string | null;
};

export function Footer({ navigation, services, email }: FooterProps) {
  return (
    <footer className="dark-surface bg-background">
      <div className="page-container pt-16 pb-7">
        <div className="grid gap-12 pb-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_.7fr_1fr_1fr]">
          <div>
            <Brand />
            <p className="mt-5 max-w-xs text-sm leading-7 text-muted-foreground">
              Software. Hardware. AI.
              <br />
              Connected thinking.
              <br />
              Built around what matters.
            </p>
          </div>
          <div>
            <h2 className="eyebrow mb-5">EXPLORE</h2>
            <nav aria-label="Footer">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="nav-link inline-flex min-h-9 items-center"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div>
            <h2 className="eyebrow mb-5">WHAT WE BUILD</h2>
            <ul className="space-y-2">
              {services.slice(0, 4).map((service) => (
                <li key={service.id}>
                  <Link
                    href="/capabilities"
                    className="nav-link inline-flex min-h-9 items-center"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="eyebrow mb-5">LET’S CONNECT</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              A challenge, an idea,
              <br />
              or a better way forward.
            </p>
            <a
              href={email ? `mailto:${email}` : "/contact"}
              className="mt-4 inline-flex min-h-11 items-center gap-3 text-sm text-brand underline-offset-4 hover:underline"
            >
              {email ?? "Start a conversation"}{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} TemmsTech. All rights reserved.</p>
          <a href="/models/ATTRIBUTION.md" className="hover:text-brand">
            3D model credits
          </a>
          <a
            href="#top"
            className="inline-flex items-center gap-3 hover:text-brand"
          >
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
