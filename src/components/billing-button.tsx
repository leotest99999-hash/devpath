"use client";

import { useState } from "react";
import { BadgeDollarSign, LoaderCircle, Sparkles } from "lucide-react";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-55";
const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-55";

export function BillingButton({
  isProActive,
  style = "primary",
}: {
  isProActive: boolean;
  style?: "primary" | "secondary";
}) {
  const [isLoading, setIsLoading] = useState(false);
  const buttonStyles = style === "primary" ? buttonClass : secondaryButtonClass;

  async function handleClick() {
    setIsLoading(true);

    try {
      const response = await fetch(
        isProActive ? "/api/billing/portal" : "/api/billing/checkout",
        {
          method: "POST",
        },
      );
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Billing is unavailable right now.");
      }

      window.location.assign(payload.url);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Billing is unavailable right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button type="button" className={buttonStyles} onClick={handleClick} disabled={isLoading}>
      {isLoading ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Opening Stripe...
        </>
      ) : isProActive ? (
        <>
          <BadgeDollarSign className="h-4 w-4" />
          Manage Pro
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          Go Pro - $9.99/mo
        </>
      )}
    </button>
  );
}

