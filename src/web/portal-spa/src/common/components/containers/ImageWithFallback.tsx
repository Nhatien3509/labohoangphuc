"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ImageWithFallbackProps = Omit<ImageProps, "src"> & {
  src?: string | null;
  fallbackNode?: React.ReactNode;
};

const imageLoader = ({ src, width }: { src: string; width: number }) => {
  const url = new URL(src);
  url.searchParams.set("w", width.toString());
  return url.toString();
};

export default function ImageWithFallback({
  src,
  fallbackNode,
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [isError, setIsError] = useState(false);

  if ((isError && fallbackNode) || !src) return fallbackNode;

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      loader={imageLoader}
      onError={() => {
        setIsError(true);
      }}
    />
  );
}
