// True when every word of the query appears in the product's name, category or description.
export function matchesSearch(product, query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const text = `${product.name} ${product.category} ${product.description}`.toLowerCase();
  return words.every((w) => text.includes(w));
}
