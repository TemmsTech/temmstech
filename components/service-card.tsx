import { ImageCard } from "@/components/image-card";
import type { Service } from "@/types/content";

export function ServiceCard({ service }: { service: Service }) {
  return <ImageCard {...service} />;
}
