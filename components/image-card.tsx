import type { ReactNode } from "react";
import Image from "next/image";

type ImageCardProps = {
  image: string;
  label?: string;
  title: string;
  description: string;
  /** Replaces the still photo, e.g. with a slideshow. `image` is then unused. */
  media?: ReactNode;
  children?: ReactNode;
};

export function ImageCard({
  image,
  label,
  title,
  description,
  media,
  children,
}: ImageCardProps) {
  return (
    <article className="image-card">
      <div className="relative aspect-video overflow-hidden bg-ink">
        {media ?? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="image-card-body">
        {label && <span className="image-card-label">{label}</span>}
        <h3 className="mb-3 text-xl font-semibold tracking-tight">{title}</h3>
        <p className="image-card-description">{description}</p>
        {children}
      </div>
    </article>
  );
}
