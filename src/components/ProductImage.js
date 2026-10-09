// Placeholder product "image" made from an emoji and a gradient.
// Swap for next/image once real product photos are available.
export default function ProductImage({ product, size = "md" }) {
  const sizes = { md: "h-48 text-6xl", lg: "h-80 md:h-96 text-9xl", sm: "h-20 w-20 text-4xl" };
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gradient-to-br ${product.color} ${sizes[size]}`}
      role="img"
      aria-label={product.name}
    >
      <span className="drop-shadow-lg">{product.emoji}</span>
    </div>
  );
}
