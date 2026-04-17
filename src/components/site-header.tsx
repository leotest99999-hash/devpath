import Link from "next/link";
import { Code2, Compass, Sparkles, Zap } from "lucide-react";
import { AuthButtons } from "@/components/auth-buttons";

const navLinkClass =
  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_12px_32px_rgba(34,211,238,0.16)]">
            <Code2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">DevPath</p>
            <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
              Learn by building
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link href="/#paths" className={navLinkClass}>
            <Compass className="h-4 w-4" />
            Paths
          </Link>
          <Link href="/#how-it-works" className={navLinkClass}>
            <Zap className="h-4 w-4" />
            How it works
          </Link>
          <Link href="/#pro" className={navLinkClass}>
            <Sparkles className="h-4 w-4" />
            Pro
          </Link>
        </nav>

        <AuthButtons />
      </div>
    </header>
  );
}
