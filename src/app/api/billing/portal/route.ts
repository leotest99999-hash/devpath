import { auth } from "@/auth";
import { getStripeClient } from "@/lib/stripe";
import { getSubscriptionRecord } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json(
      { error: "Sign in first to manage billing." },
      { status: 401 },
    );
  }

  const subscriptionRecord = await getSubscriptionRecord(userId);

  if (!subscriptionRecord?.customerId) {
    return Response.json(
      { error: "No Stripe customer found for this account yet." },
      { status: 404 },
    );
  }

  const stripe = getStripeClient();
  const origin =
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("origin") ||
    new URL(request.url).origin;

  const portal = await stripe.billingPortal.sessions.create({
    customer: subscriptionRecord.customerId,
    return_url: `${origin}/`,
  });

  return Response.json({
    url: portal.url,
  });
}

