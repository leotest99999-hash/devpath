import Link from "next/link";
import { AuthCard } from "@/components/auth-card";

export default function SignInPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_0.85fr] lg:px-8 lg:py-20">
      <div className="rounded-[2.5rem] panel-surface p-7 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
          Sign in
        </p>
        <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Save your streak, keep your XP, and keep moving.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
          DevPath accounts track completed lessons, unlock the AI tutor, and keep
          your progress synced the next time you come back.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-sm font-semibold text-white">Free includes</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
              <li>Three full learning paths</li>
              <li>Daily streak and XP tracking</li>
              <li>Lesson-aware AI tutor access</li>
            </ul>
          </div>
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-sm font-semibold text-white">Want more?</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
              <li>Upgrade to Pro for Python</li>
              <li>Unlock unlimited tutor messages</li>
              <li>Keep every future path open</li>
            </ul>
          </div>
        </div>

        <p className="mt-8 text-sm text-slate-400">
          New here?{" "}
          <Link href="/sign-up" className="font-semibold text-cyan-300 hover:text-cyan-200">
            Create an account
          </Link>
        </p>
      </div>

      <div className="flex items-start justify-center lg:justify-end">
        <AuthCard mode="sign-in" />
      </div>
    </div>
  );
}
