"use client";

import StoredImage from "./StoredImage";

// A product's main photo, or its emoji on the brand's soft green when it has no photos.
const sizes = {
  xs: "h-9 w-9 rounded-lg text-base",
  sm: "h-[54px] w-[54px] rounded-xl text-[1.6rem]",
  md: "aspect-[1.1] w-full text-[3.2rem]",
  lg: "aspect-square w-full rounded-panel text-[5.5rem]",
};

export default function ProductImage({ product, size = "md", imageId, children }) {
  const src = imageId ?? product.images?.[0];
  const emoji = <span aria-hidden="true">{product.emoji}</span>;
  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-brand-50 ${sizes[size]}`}>
      {children}
      {src ? (
        <StoredImage
          src={src}
          alt={product.name}
          className="h-full w-full object-cover"
          fallback={emoji}
        />
      ) : (
        <span role="img" aria-label={product.name} className="contents">
          {emoji}
        </span>
      )}
    </div>
  );
}
