"use client";
import { useState } from "react";
import Image from "next/image";
import { carRenderUrl, carImageByModel } from "@/data/mock";

interface Props {
  brandId: string;
  brandSlug: string;
  brandName: string;
  modelId: string;
  modelSlug: string;
  modelName: string;
  year: number;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

// Tries imagin.studio first (clean 3D render on transparent background).
// If that image fails to load (404, no asset for this model), falls back
// to our Wikipedia-backed /api/car-image endpoint.
export function CarImage({
  brandId,
  brandSlug,
  brandName,
  modelId,
  modelSlug,
  modelName,
  year,
  alt,
  className,
  sizes,
  priority,
}: Props) {
  const renderUrl = carRenderUrl(brandSlug, modelSlug, year);
  const fallbackUrl = carImageByModel(brandId, modelId, brandName, modelName);
  const [src, setSrc] = useState(renderUrl);

  return (
    <Image
      src={src}
      alt={alt ?? `${brandName} ${modelName}`}
      fill
      unoptimized
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => {
        if (src !== fallbackUrl) setSrc(fallbackUrl);
      }}
    />
  );
}
