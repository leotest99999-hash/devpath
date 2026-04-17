"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Sparkles } from "lucide-react";

export function BillingSuccessClient({ sessionId }: { sessionId: string | null }) {
  const [message, setMessage] = useState("Verifying your DevPath Pro subscription...");
  const [error, setError] = useState<string | null>(
    sessionId ? null : "Missing Stripe session id.",
  );

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const verifiedSessionId = sessionId;
    let cancelled = false;

    async function verify() {
      try {
        const response = await fetch(
          `/api/billing/verify?session_id=${encodeURIComponent(verifiedSessionId)}`,
        );
        const payload = (await response.json()) as {
          error?: string;
          isProActive?: boolean;
        };

        if (!response.ok || !payload.isProActive) {
          throw new Error(payload.error || "Could not verify billing.");
        }

        if (!cancelled) {
          setMessage("DevPath Pro is active. You now have all paths and unlimited tutor chats.");
          window.setTimeout(() => {
            window.location.assign("/");
          }, 1800);
        }
      } catch (verifyError) {
        if (!cancelled) {
          setError(
            verifyError instanceof Error
              ? verifyError.message
              : "Could not verify billing.",
          );
        }
      }
    }

    void verify();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#11213f_0%,#020617_55%,#02040c_100%)] px-4 py-20">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-center shadow-[0_32px_120px_rgba(0,0,0,0.42)] backdrop-blur">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/12 text-cyan-300">
          {error ? <Sparkles className="h-6 w-6" /> : <LoaderCircle className="h-6 w-6 animate-spin" />}
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white">
          {error ? "Billing needs one more look" : "Almost there"}
        </h1>
        <p className="mt-4 text-base leading-8 text-slate-300">
          {error ?? message}
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
          >
            Back to DevPath
          </Link>
        </div>
      </div>
    </div>
  );
}
