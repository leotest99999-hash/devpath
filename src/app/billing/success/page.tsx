import { BillingSuccessClient } from "@/components/billing-success-client";

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-3xl justify-center px-4 py-20 sm:px-6 lg:px-8">
      <BillingSuccessClient sessionId={params.session_id ?? null} />
    </div>
  );
}
