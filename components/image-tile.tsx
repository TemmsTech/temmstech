import Image from "next/image";
import { cn } from "@/lib/utils";

export function ImageTile({
  image,
  caption,
  className,
  priority = false,
}: {
  image: string;
  caption: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure
      className={cn(
        "dark-surface relative aspect-video overflow-hidden bg-ink",
        className,
      )}
    >
      <Image
        src={image}
        alt=""
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
        priority={priority}
      />
      <figcaption className="image-tile-shade absolute inset-x-0 bottom-0 px-5 pt-12 pb-5 text-sm font-semibold text-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}
