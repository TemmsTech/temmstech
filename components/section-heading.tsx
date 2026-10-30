import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  id: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-12 flex flex-col gap-5", className)}>
      <div>
        <p className="eyebrow mb-5">
          <span className="mr-3 text-accent-foreground">↗</span>
          {eyebrow}
        </p>
        <h2 id={id} className="section-title max-w-2xl">
          {title}
        </h2>
      </div>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
