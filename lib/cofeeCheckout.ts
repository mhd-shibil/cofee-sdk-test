import type { CheckoutEnvironment, CofeeCheckout as CofeeCheckoutClass } from "@cofee/checkout-web-sdk";

// Browser-only helpers for the checkout overlay SDK (the bundle touches `window` on import).

// Defaults to sandbox (www.sandbox.cofee.life) rather than production for this test app;
// the SDK itself defaults to production.
export function getCheckoutEnvironment(): CheckoutEnvironment {
  const value = process.env.NEXT_PUBLIC_COFEE_CHECKOUT_ENVIRONMENT || "sandbox";
  if (value !== "production" && value !== "sandbox") {
    throw new Error(`NEXT_PUBLIC_COFEE_CHECKOUT_ENVIRONMENT must be "production" or "sandbox", got "${value}"`);
  }
  return value;
}

export async function loadCofeeCheckout(): Promise<typeof CofeeCheckoutClass> {
  // The published SDK's UMD build only flattens the double-nested export
  // (`{ CofeeCheckout: { CofeeCheckout: class } }`) for the `window.CofeeCheckout`
  // global, not for bundler/ESM imports — so unwrap it defensively here.
  const sdkModule = await import("@cofee/checkout-web-sdk");
  return typeof sdkModule.CofeeCheckout === "function"
    ? sdkModule.CofeeCheckout
    : (
        sdkModule.CofeeCheckout as unknown as {
          CofeeCheckout: typeof CofeeCheckoutClass;
        }
      ).CofeeCheckout;
}
