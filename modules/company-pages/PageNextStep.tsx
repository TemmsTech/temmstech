import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Arrow } from "@/components/arrow";

export function PageNextStep({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section
      id="contact"
      className="dark-surface bg-background"
      aria-labelledby="next-step-title"
    >
      <div className="page-container section-space text-center">
        <h2 id="next-step-title" className="section-title mx-auto max-w-2xl">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/contact#contact">
            Tell us about your project <Arrow />
          </Link>
        </Button>
      </div>
    </section>
  );
}
