import { auth } from "@/auth";
import { getStripeClient } from "@/lib/stripe";
import { getSubscriptionRecord, isProActive } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return Response.json(
        { error: "Sign in first so DevPath can attach Pro to your account." },
        { status: 401 },
      );
    }

    const existingRecord = await getSubscriptionRecord(userId);

    if (isProActive(existingRecord)) {
      return Response.json(
        { error: "DevPath Pro is already active for this account." },
        { status: 409 },
      );
    }

    const stripe = getStripeClient();
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      new URL(request.url).origin;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      billing_address_collection: "auto",
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      client_reference_id: userId,
      ...(existingRecord?.customerId
        ? {
            customer: existingRecord.customerId,
          }
        : {}),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 999,
            recurring: {
              interval: "month",
            },
            product_data: {
              name: "DevPath Pro",
              description:
                "Unlock Python, all future paths, unlimited AI tutor chats, and full progress sync.",
            },
          },
        },
      ],
      metadata: {
        app: "DevPath",
        userId,
      },
      subscription_data: {
        metadata: {
          app: "DevPath",
          userId,
        },
      },
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return Response.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe checkout could not be created.",
      },
      { status: 400 },
    );
  }
}

