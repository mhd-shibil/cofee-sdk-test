"use client";

import { CartItem } from "@/lib/types";

export function CartPanel({
  items,
  total,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
}: {
  items: CartItem[];
  total: number;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}) {
  return (
    <div className="flex flex-col h-full rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 p-4">
      <h2 className="text-lg font-semibold mb-3">Your Cart</h2>

      {items.length === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50 flex-1">
          Your cart is empty. Add some products to get started.
        </p>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col gap-3">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center gap-2 border-b border-black/5 dark:border-white/10 pb-3"
            >
              <div className="text-2xl">{product.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{product.name}</div>
                <div className="text-xs text-black/50 dark:text-white/50">
                  ₹{product.price.toFixed(2)} each
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDecrement(product.id)}
                  className="w-6 h-6 rounded border border-black/15 dark:border-white/20 text-sm leading-none"
                  aria-label={`Decrease ${product.name} quantity`}
                >
                  −
                </button>
                <span className="w-5 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => onIncrement(product.id)}
                  className="w-6 h-6 rounded border border-black/15 dark:border-white/20 text-sm leading-none"
                  aria-label={`Increase ${product.name} quantity`}
                >
                  +
                </button>
              </div>
              <div className="text-sm font-medium w-14 text-right">
                ₹{(product.price * quantity).toFixed(2)}
              </div>
              <button
                onClick={() => onRemove(product.id)}
                className="text-black/40 dark:text-white/40 hover:text-red-500 text-sm ml-1"
                aria-label={`Remove ${product.name} from cart`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/15">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Total</span>
          <span className="text-lg font-semibold">₹{total.toFixed(2)}</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full rounded-md bg-foreground text-background py-2 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
