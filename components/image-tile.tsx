import Image from "next/image";
import { cn } from "@/lib/utils";
import { TileSlides } from "@/components/tile-slides";

export function ImageTile({
  image,
  images,
  caption,
  className,
  priority = false,
  slideDelay = 0,
}: {
  image: string;
  /** Two or more photos turn the tile into a random crossfading slideshow. */
  images?: readonly string[];
  caption: string;
  className?: string;
  priority?: boolean;
  slideDelay?: number;
}) {
  const sizes = "(min-width: 1024px) 50vw, 100vw";
  return (
    <figure
      className={cn(
        "dark-surface relative aspect-video overflow-hidden bg-ink",
        className,
      )}
    >
      {images && images.length > 1 ? (
        <TileSlides
          images={images}
          sizes={sizes}
          priority={priority}
          delay={slideDelay}
        />
      ) : (
        <Image
          src={image}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
        />
      )}
      <figcaption className="image-tile-shade absolute inset-x-0 bottom-0 px-5 pt-12 pb-5 text-sm font-semibold text-foreground">
        {caption}
      </figcaption>
    </figure>
  );
}
