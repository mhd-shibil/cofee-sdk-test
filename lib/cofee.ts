const COFEE_API_BASE_URL =
  process.env.COFEE_API_BASE_URL || "https://partner-api.dev.cofee.life";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export interface CreatePaymentOrderInput {
  amount: number;
  merchantOrderId: string;
  orderPurpose: string;
  customerName: string;
  customerMobile: string;
}

export interface PaymentOrderData {
  order_id: string;
  order_status: string;
  payment_link: string;
  amount: number;
  currency: string;
  [key: string]: unknown;
}

interface ValidationIssue {
  field: string;
  message: string;
}

interface PaymentOrderApiResponse {
  status: "SUCCESS" | "ERROR";
  data: PaymentOrderData | ValidationIssue[] | null;
  error: { code: string; message: string } | null;
}

async function cofeeFetch(path: string, init?: RequestInit) {
  const apiKey = getRequiredEnv("COFEE_API_KEY");

  const response = await fetch(`${COFEE_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      ...init?.headers,
    },
    cache: "no-store",
  });

  const body = (await response.json()) as PaymentOrderApiResponse;

  if (!response.ok || body.status === "ERROR") {
    const baseMessage = body.error?.message || `CoFee API request failed (${response.status})`;
    const validationIssues = Array.isArray(body.data)
      ? body.data.map((issue) => `${issue.field}: ${issue.message}`).join(", ")
      : "";
    throw new Error(validationIssues ? `${baseMessage} (${validationIssues})` : baseMessage);
  }

  return body as PaymentOrderApiResponse & { data: PaymentOrderData };
}

function toE164Mobile(rawMobile: string): string {
  const digitsOnly = rawMobile.replace(/[^\d+]/g, "");
  if (digitsOnly.startsWith("+")) {
    return digitsOnly;
  }
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  return `+${digitsOnly}`;
}

export async function createPaymentOrder(
  input: CreatePaymentOrderInput
): Promise<PaymentOrderData> {
  const branchId = getRequiredEnv("COFEE_BRANCH_ID");
  const accountReferenceId = getRequiredEnv("COFEE_ACCOUNT_REFERENCE_ID");

  const body = await cofeeFetch("/v2/payment-order", {
    method: "POST",
    body: JSON.stringify({
      branch_id: branchId,
      amount: input.amount,
      currency: "INR",
      merchant_order_id: input.merchantOrderId,
      order_purpose: input.orderPurpose,
      notify_customer: false,
      customer_details: {
        name: input.customerName,
        mobile: toE164Mobile(input.customerMobile),
      },
      settlement_details: [
        {
          account_reference_id: accountReferenceId,
          amount: input.amount,
          label: "Shopping Cart Order",
        },
      ],
      send_receipt_to_customer: false,
      hide_review_page: true,
    }),
  });

  if (!body.data) {
    throw new Error("CoFee API did not return order data");
  }

  return body.data;
}

export async function getPaymentOrder(orderId: string): Promise<PaymentOrderData> {
  const body = await cofeeFetch(`/v1/payment-order/${encodeURIComponent(orderId)}`, {
    method: "GET",
  });

  if (!body.data) {
    throw new Error("CoFee API did not return order data");
  }

  return body.data;
}
