"use client";

import Link from "next/link";
import { LogOut, Sparkles } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10";
const primaryClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300";

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
        Loading...
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/sign-in" className={buttonClass}>
          Sign in
        </Link>
        <Link href="/sign-up" className={primaryClass}>
          <Sparkles className="h-4 w-4" />
          Create account
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href="/#paths" className={buttonClass}>
        My paths
      </Link>
      <div className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-white/80">
        {session.user.name}
      </div>
      <button
        type="button"
        className={buttonClass}
        onClick={() => void signOut({ callbackUrl: "/" })}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}
