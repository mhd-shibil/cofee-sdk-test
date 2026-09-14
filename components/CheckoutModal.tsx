"use client";

import { useState } from "react";
import { CartItem } from "@/lib/types";

type Stage = "form" | "creating-order" | "error" | "success";

export function CheckoutModal({
  items,
  total,
  onClose,
  onOrderPaid,
}: {
  items: CartItem[];
  total: number;
  onClose: () => void;
  onOrderPaid: () => void;
}) {
  const [stage, setStage] = useState<Stage>("form");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStage("creating-order");
    setErrorMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(({ product, quantity }) => ({
            productId: product.id,
            quantity,
          })),
          customerName: name,
          customerMobile: mobile,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "Failed to create order");
      }

      const orderId: string = body.order.order_id;
      const checkoutKey = process.env.NEXT_PUBLIC_COFEE_CHECKOUT_KEY;

      if (!checkoutKey) {
        throw new Error("NEXT_PUBLIC_COFEE_CHECKOUT_KEY is not configured");
      }

      // The published SDK's UMD build only flattens the double-nested export
      // (`{ CofeeCheckout: { CofeeCheckout: class } }`) for the `window.CofeeCheckout`
      // global, not for bundler/ESM imports — so unwrap it defensively here.
      const sdkModule = await import("@cofee/checkout-web-sdk");
      const CofeeCheckout =
        typeof sdkModule.CofeeCheckout === "function"
          ? sdkModule.CofeeCheckout
          : (
              sdkModule.CofeeCheckout as unknown as {
                CofeeCheckout: typeof sdkModule.CofeeCheckout;
              }
            ).CofeeCheckout;

      const checkout = new CofeeCheckout({
        key: checkoutKey,
        order_id: orderId,
        currency: "INR",
        name: "Cofee SDK Test Store",
        description: `Order for ${items.length} item${items.length === 1 ? "" : "s"}`,
        ui_version: "v2",
        handler: () => {
          setStage("success");
        },
        modal: {
          ondismiss: () => {
            setStage((current) => (current === "success" ? current : "form"));
          },
        },
      });

      checkout.on("payment.failed", (response) => {
        setErrorMessage(response.error.description || "Payment failed");
        setStage("error");
      });

      checkout.open();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
      setStage("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl bg-background border border-black/10 dark:border-white/15 p-6">
        {stage === "form" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Checkout details</h2>
            <p className="text-sm text-black/60 dark:text-white/60">
              Total amount: <span className="font-medium">₹{total.toFixed(2)}</span>
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="customer-name">
                Full name
              </label>
              <input
                id="customer-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                placeholder="Jane Doe"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="customer-mobile">
                Mobile number
              </label>
              <input
                id="customer-mobile"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm"
                placeholder="+919876543210"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-black/15 dark:border-white/20 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-md bg-foreground text-background py-2 text-sm font-medium hover:opacity-90"
              >
                Pay now
              </button>
            </div>
          </form>
        )}

        {stage === "creating-order" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-10 w-10 rounded-full border-2 border-black/15 dark:border-white/20 border-t-foreground animate-spin" />
            <p className="text-sm text-black/60 dark:text-white/60">
              Creating your order…
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="text-3xl">⚠️</div>
            <p className="text-sm text-red-500">{errorMessage}</p>
            <div className="flex gap-2 w-full">
              <button
                onClick={onClose}
                className="flex-1 rounded-md border border-black/15 dark:border-white/20 py-2 text-sm font-medium"
              >
                Close
              </button>
              <button
                onClick={() => setStage("form")}
                className="flex-1 rounded-md bg-foreground text-background py-2 text-sm font-medium hover:opacity-90"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {stage === "success" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="text-3xl">✅</div>
            <p className="text-sm font-medium">Payment successful!</p>
            <button
              onClick={onOrderPaid}
              className="w-full rounded-md bg-foreground text-background py-2 text-sm font-medium hover:opacity-90"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
