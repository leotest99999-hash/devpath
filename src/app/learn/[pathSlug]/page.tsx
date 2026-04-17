import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Crown, Lock, Sparkles } from "lucide-react";
import { BillingButton } from "@/components/billing-button";
import { getPathBySlug } from "@/lib/course-data";
import { getViewerState } from "@/lib/viewer-state";

export default async function LearningPathPage({
  params,
}: {
  params: Promise<{ pathSlug: string }>;
}) {
  const { pathSlug } = await params;
  const path = getPathBySlug(pathSlug);

  if (!path) {
    notFound();
  }

  const viewer = await getViewerState();
  const pathProgress =
    viewer.pathProgress.find((entry) => entry.pathSlug === path.slug) ?? null;
  const isLocked = Boolean(path.proRequired && !viewer.isPro);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2.25rem] panel-surface p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              Learning path
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {path.title}
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-300">{path.tagline}</p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              {path.description}
            </p>
          </div>

          <div className="grid min-w-[250px] gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Progress</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {pathProgress?.progressPercent ?? 0}%
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {pathProgress?.completedLessons ?? 0}/{path.lessons.length} lessons done
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {isLocked ? "Locked" : "Open"}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {path.proRequired ? "Pro tier" : "Included free"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 h-2 rounded-full bg-white/6">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-300"
            style={{ width: `${pathProgress?.progressPercent ?? 0}%` }}
          />
        </div>
      </div>

      {isLocked ? (
        <div className="mt-8 rounded-[2rem] panel-surface p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="flex items-start gap-3">
                <Lock className="mt-1 h-5 w-5 text-amber-200" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-100">
                    Pro required
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">
                    Python and advanced paths open with DevPath Pro.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
                    Upgrade to unlock this path, unlimited AI tutor messages, and every
                    path we add after launch. Free still gives you the full HTML, CSS,
                    and JavaScript lanes.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {viewer.isAuthenticated ? (
                  <BillingButton isProActive={viewer.isPro} />
                ) : (
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    <Sparkles className="h-4 w-4" />
                    Create account
                  </Link>
                )}
                <Link
                  href="/#paths"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Back to free paths
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/8 bg-slate-950/60 p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                What’s inside
              </p>
              <div className="mt-5 space-y-4">
                {path.lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">
                        {index + 1}. {lesson.title}
                      </p>
                      <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100">
                        {lesson.xp} XP
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{lesson.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {path.lessons.map((lesson, index) => {
            const isComplete =
              viewer.progress?.completedLessonIds.includes(lesson.id) ?? false;

            return (
              <Link
                key={lesson.id}
                href={`/learn/${path.slug}/${lesson.slug}`}
                className="flex flex-col gap-5 rounded-[2rem] panel-surface p-6 transition hover:border-cyan-400/20 hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-100">
                    {index + 1}
                  </div>
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold text-white">{lesson.title}</h2>
                      {isComplete ? (
                        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                          Complete
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{lesson.summary}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
                    {lesson.minutes} min
                  </div>
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-50">
                    {lesson.xp} XP
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                    Open lesson
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
        >
          Back home
        </Link>
        {path.lessons[0] ? (
          <Link
            href={`/learn/${path.slug}/${path.lessons[0].slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            {isLocked ? <Crown className="h-4 w-4" /> : null}
            {isLocked ? "See Pro preview" : "Start first lesson"}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
