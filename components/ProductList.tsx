"use client";

import { Product } from "@/lib/types";

export function ProductList({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex flex-col items-center gap-2 rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white dark:bg-white/5 hover:shadow-md transition-shadow"
        >
          <div className="text-4xl">{product.emoji}</div>
          <div className="text-sm font-medium text-center">{product.name}</div>
          <div className="text-sm text-black/60 dark:text-white/60">
            ₹{product.price.toFixed(2)}
          </div>
          <button
            onClick={() => onAdd(product)}
            className="mt-1 w-full rounded-md bg-foreground text-background text-sm py-1.5 font-medium hover:opacity-90 transition-opacity"
          >
            Add to cart
          </button>
        </div>
      ))}
    </div>
  );
}
