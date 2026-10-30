import Image from "next/image";
import type { PageIntroContent } from "@/types/page";

export function PageIntro({ content }: { content: PageIntroContent }) {
  return (
    <section
      className="dark-surface bg-background"
      aria-labelledby="page-title"
    >
      <div className="page-container grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div>
          <p className="eyebrow mb-6 text-brand">{content.eyebrow}</p>
          <h1 id="page-title" className="hero-title">
            {content.title}
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">
            {content.description}
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden border border-border">
          <Image
            src={content.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
