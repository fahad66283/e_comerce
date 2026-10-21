// Placeholder product "image": the product's emoji on the brand's soft green.
// Swap for next/image once real product photos are available.
const sizes = {
  sm: "h-[54px] w-[54px] rounded-xl text-[1.6rem]",
  md: "aspect-[1.1] w-full text-[3.2rem]",
  lg: "min-h-[300px] w-full rounded-panel text-[5.5rem] md:min-h-[420px]",
};

export default function ProductImage({ product, size = "md", children }) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center bg-brand-50 ${sizes[size]}`}
      role="img"
      aria-label={product.name}
    >
      {children}
      <span aria-hidden="true">{product.emoji}</span>
    </div>
  );
}
