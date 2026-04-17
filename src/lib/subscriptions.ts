import Stripe from "stripe";
import { z } from "zod";
import { readJson, writeJson } from "@/lib/storage";

const subscriptionRecordSchema = z.object({
  userId: z.string().min(1),
  customerId: z.string().nullable(),
  subscriptionId: z.string().nullable(),
  status: z.string().nullable(),
  currentPeriodEnd: z.string().nullable(),
  cancelAtPeriodEnd: z.boolean().default(false),
  updatedAt: z.string().min(1),
});

export type SubscriptionRecord = z.infer<typeof subscriptionRecordSchema>;

function getSubscriptionPath(userId: string) {
  return `subscriptions/${userId}.json`;
}

export function isProActive(record: SubscriptionRecord | null) {
  if (!record?.status) {
    return false;
  }

  return ["trialing", "active", "past_due"].includes(record.status);
}

export async function getSubscriptionRecord(userId: string) {
  return readJson(getSubscriptionPath(userId), subscriptionRecordSchema);
}

export async function saveSubscriptionFromStripe(input: {
  userId: string;
  subscription: Stripe.Subscription;
  customerId: string | null;
}) {
  const currentPeriodEnd = input.subscription.items.data[0]?.current_period_end ?? null;

  const record: SubscriptionRecord = {
    userId: input.userId,
    customerId: input.customerId,
    subscriptionId: input.subscription.id,
    status: input.subscription.status,
    currentPeriodEnd: currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : null,
    cancelAtPeriodEnd: input.subscription.cancel_at_period_end,
    updatedAt: new Date().toISOString(),
  };

  await writeJson(getSubscriptionPath(input.userId), record);
  return record;
}
