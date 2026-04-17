import { auth } from "@/auth";
import { getStripeClient } from "@/lib/stripe";
import { getSubscriptionRecord, isProActive, saveSubscriptionFromStripe } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return Response.json(
        { error: "Sign in first to verify billing." },
        { status: 401 },
      );
    }

    const sessionId = new URL(request.url).searchParams.get("session_id");

    if (!sessionId) {
      return Response.json(
        { error: "Missing Stripe session id." },
        { status: 400 },
      );
    }

    const stripe = getStripeClient();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const checkoutUserId =
      checkoutSession.metadata?.userId ?? checkoutSession.client_reference_id ?? null;

    if (checkoutUserId !== userId) {
      return Response.json(
        { error: "This billing session belongs to a different account." },
        { status: 403 },
      );
    }

    if (typeof checkoutSession.subscription !== "string") {
      return Response.json(
        { error: "Stripe has not attached a subscription yet." },
        { status: 409 },
      );
    }

    const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription);
    const record = await saveSubscriptionFromStripe({
      userId,
      subscription,
      customerId:
        typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : checkoutSession.customer?.id ?? null,
    });

    return Response.json({
      isProActive: isProActive(record),
      status: record.status,
      currentPeriodEnd: record.currentPeriodEnd,
      cancelAtPeriodEnd: record.cancelAtPeriodEnd,
    });
  } catch (error) {
    const session = await auth();
    const existing = session?.user?.id
      ? await getSubscriptionRecord(session.user.id)
      : null;

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Billing verification failed.",
        isProActive: isProActive(existing),
      },
      { status: 400 },
    );
  }
}

