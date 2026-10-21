"use client";

import { useState } from "react";
import AddToCartButton from "./AddToCartButton";
import QuantityStepper from "./QuantityStepper";

export default function ProductActions({ product }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="mt-6 flex items-center gap-3">
      <QuantityStepper value={quantity} onChange={setQuantity} max={product.stock} />
      <AddToCartButton product={product} quantity={quantity} className="flex-1" />
    </div>
  );
}
