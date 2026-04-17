import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { saveSubscriptionFromStripe } from "@/lib/subscriptions";

export const runtime = "nodejs";

const handledEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing Stripe webhook configuration.", {
      status: 400,
    });
  }

  const stripe = getStripeClient();
  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return new Response(
      error instanceof Error ? error.message : "Invalid Stripe signature.",
      { status: 400 },
    );
  }

  if (!handledEvents.has(event.type)) {
    return Response.json({ received: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId ?? session.client_reference_id;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (userId && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await saveSubscriptionFromStripe({
        userId,
        subscription,
        customerId:
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null,
      });
    }

    return Response.json({ received: true });
  }

  const subscription = event.data.object as Stripe.Subscription;
  const userId = subscription.metadata?.userId;

  if (!userId) {
    return Response.json({ received: true });
  }

  await saveSubscriptionFromStripe({
    userId,
    subscription,
    customerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id ?? null,
  });

  return Response.json({ received: true });
}
