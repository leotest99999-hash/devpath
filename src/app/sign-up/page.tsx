import Link from "next/link";
import { AuthCard } from "@/components/auth-card";

export default function SignUpPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_0.85fr] lg:px-8 lg:py-20">
      <div className="rounded-[2.5rem] panel-surface p-7 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
          Create account
        </p>
        <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Turn quick lessons into a coding streak that actually sticks.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
          DevPath is built for short, repeatable sessions. Make an account to save
          XP, lock in your streak, and keep every lesson you finish.
        </p>

        <div className="mt-10 space-y-4">
          {[
            "HTML, CSS, and JavaScript are open on the free tier.",
            "Each lesson ends with a challenge you can run instantly.",
            "Your progress syncs with Vercel Blob-backed storage.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-5 py-4 text-sm leading-6 text-slate-300"
            >
              {item}
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-cyan-300 hover:text-cyan-200">
            Sign in
          </Link>
        </p>
      </div>

      <div className="flex items-start justify-center lg:justify-end">
        <AuthCard mode="sign-up" />
      </div>
    </div>
  );
}
