"use client";

import { useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "@/lib/products";
import { CartItem, Product } from "@/lib/types";
import { ProductList } from "@/components/ProductList";
import { CartPanel } from "@/components/CartPanel";
import { CheckoutModal } from "@/components/CheckoutModal";
import { loadCofeeCheckout } from "@/lib/cofeeCheckout";

export default function Home() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [resumedPaymentStatus, setResumedPaymentStatus] = useState<string | null>(null);

  // On Android the browser may discard this tab while the customer is in a UPI app.
  // The SDK reopens checkout on reload; attach handlers so the result still reaches us.
  useEffect(() => {
    let cancelled = false;
    loadCofeeCheckout().then((CofeeCheckout) => {
      if (cancelled) return;
      CofeeCheckout.resumePending({
        handler: (response) => setResumedPaymentStatus(`Payment successful for order ${response.order_id}.`),
      })?.on("payment.failed", (response) =>
        setResumedPaymentStatus(response.error.description || "Payment failed")
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function addToCart(product: Product) {
    setCart((prev) => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }));
  }

  function increment(productId: string) {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
  }

  function decrement(productId: string) {
    setCart((prev) => {
      const next = { ...prev };
      const qty = (next[productId] ?? 0) - 1;
      if (qty <= 0) {
        delete next[productId];
      } else {
        next[productId] = qty;
      }
      return next;
    });
  }

  function remove(productId: string) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }

  const cartItems: CartItem[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([productId, quantity]) => {
          const product = PRODUCTS.find((p) => p.id === productId);
          return product ? { product, quantity } : null;
        })
        .filter((item): item is CartItem => item !== null),
    [cart]
  );

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );

  return (
    <div className="min-h-screen p-6 sm:p-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Cofee Checkout SDK — Test Store</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Add products, check out, and the Cofee checkout overlay SDK will take over payment.
        </p>
      </header>

      {resumedPaymentStatus && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-md border border-black/15 dark:border-white/20 px-4 py-3 text-sm">
          <span>{resumedPaymentStatus}</span>
          <button onClick={() => setResumedPaymentStatus(null)} className="font-medium">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <ProductList products={PRODUCTS} onAdd={addToCart} />
        <div className="lg:sticky lg:top-6">
          <CartPanel
            items={cartItems}
            total={total}
            onIncrement={increment}
            onDecrement={decrement}
            onRemove={remove}
            onCheckout={() => setShowCheckout(true)}
          />
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          items={cartItems}
          total={total}
          onClose={() => setShowCheckout(false)}
          onOrderPaid={() => {
            setCart({});
            setShowCheckout(false);
          }}
        />
      )}
    </div>
  );
}
