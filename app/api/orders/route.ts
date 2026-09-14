import { NextRequest, NextResponse } from "next/server";
import { createPaymentOrder } from "@/lib/cofee";
import { PRODUCTS } from "@/lib/products";
import { CartItem } from "@/lib/types";

interface CheckoutRequestBody {
  items: { productId: string; quantity: number }[];
  customerName: string;
  customerMobile: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutRequestBody;

    if (!body.customerName?.trim() || !body.customerMobile?.trim()) {
      return NextResponse.json(
        { error: "Customer name and mobile number are required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const cartItems: CartItem[] = body.items.map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Unknown product: ${item.productId}`);
      }
      return { product, quantity: item.quantity };
    });

    const amount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    if (amount <= 0) {
      return NextResponse.json({ error: "Cart total must be greater than zero" }, { status: 400 });
    }

    const merchantOrderId = `sdk_test_${Date.now()}`;

    const order = await createPaymentOrder({
      amount,
      merchantOrderId,
      orderPurpose: "Cofee SDK Test Store Purchase",
      customerName: body.customerName.trim(),
      customerMobile: body.customerMobile.trim(),
    });

    return NextResponse.json({ order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
