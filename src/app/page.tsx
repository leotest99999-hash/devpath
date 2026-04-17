import Link from "next/link";
import { ArrowRight, Flame, Sparkles, Star, Trophy, Zap } from "lucide-react";
import { BillingButton } from "@/components/billing-button";
import { freePathSlugs, getTotalXp, learningPaths } from "@/lib/course-data";
import { getViewerState } from "@/lib/viewer-state";

function formatProgress(value: number) {
  return `${value}% complete`;
}

export default async function Home() {
  const viewer = await getViewerState();
  const totalXp = getTotalXp();
  const firstPath = learningPaths[0];
  const firstLesson = firstPath.lessons[0];

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl gap-14 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Learn code like a game, not a textbook
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Build tiny wins every day on your{" "}
              <span className="text-gradient">own DevPath.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Short interactive lessons, instant code feedback, and an AI tutor that
              stays in the lesson with you. Free gets HTML, CSS, and JavaScript. Pro
              unlocks Python and unlimited tutor help.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/learn/${firstPath.slug}/${firstLesson.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Start learning now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#paths"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
              >
                Explore learning paths
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl panel-surface p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Free access
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {freePathSlugs.length} paths
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  HTML, CSS, and JavaScript are open on day one.
                </p>
              </div>
              <div className="rounded-3xl panel-surface p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Practice format
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">8 lessons</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Every lesson ends with a challenge you can run immediately.
                </p>
              </div>
              <div className="rounded-3xl panel-surface p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Total XP
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">{totalXp}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Enough momentum to make streaks feel real from the start.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl hero-orb" />
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-fuchsia-400/20 blur-3xl hero-orb" />
            <div className="relative rounded-[2rem] panel-surface p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                    Learning cockpit
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    Progress feels visible from the first lesson.
                  </h2>
                </div>
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.26em] text-cyan-200">
                    Streak
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {viewer.progress?.streakDays ?? 0} day
                    {(viewer.progress?.streakDays ?? 0) === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {learningPaths.map((path, index) => {
                  const progress =
                    viewer.pathProgress.find((entry) => entry.pathSlug === path.slug) ??
                    null;

                  return (
                    <Link
                      key={path.slug}
                      href={`/learn/${path.slug}`}
                      className="group block rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.05]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                            Path {index + 1}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-sm font-semibold text-slate-100">
                              {path.icon}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {path.title}
                              </h3>
                              <p className="text-sm text-slate-400">{path.tagline}</p>
                            </div>
                          </div>
                        </div>
                        <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                          {path.proRequired && !viewer.isPro ? "Pro" : "Open"}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-slate-500">
                        <span>
                          {progress ? formatProgress(progress.progressPercent) : "0% complete"}
                        </span>
                        <span>
                          {progress?.completedLessons ?? 0}/{path.lessons.length} lessons
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/6">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-300 transition-all"
                          style={{ width: `${progress?.progressPercent ?? 0}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    XP banked
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {viewer.progress?.xp ?? 0}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Account status
                  </p>
                  <p className="mt-3 text-3xl font-semibold text-white">
                    {viewer.isPro ? "Pro" : viewer.isAuthenticated ? "Free" : "Guest"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="paths" className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Learning paths
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Pick one lane and feel progress immediately.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400 sm:text-lg">
            Every path is broken into short guided lessons with a coding challenge at
            the end. Free starts with the web stack. Pro unlocks Python and every
            future path we add.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {learningPaths.map((path) => {
            const progress =
              viewer.pathProgress.find((entry) => entry.pathSlug === path.slug) ?? null;

            return (
              <div key={path.slug} className="rounded-[2rem] panel-surface p-6 sm:p-8">
                <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                  <div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br ${path.accent} text-lg font-semibold text-white`}
                      >
                        {path.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-semibold text-white">{path.title}</h3>
                          {path.proRequired ? (
                            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-100">
                              Pro
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-base text-slate-400">{path.tagline}</p>
                      </div>
                    </div>
                    <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                      {path.description}
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                          Lessons
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {path.lessons.length}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                          Earnable XP
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {path.lessons.reduce((sum, lesson) => sum + lesson.xp, 0)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                          Progress
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {progress?.progressPercent ?? 0}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/8 bg-slate-950/60 p-5 sm:p-6">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.26em] text-slate-500">
                      <span>Chapter trail</span>
                      <span>{path.lessons.length} checkpoints</span>
                    </div>
                    <div className="mt-5 space-y-4">
                      {path.lessons.map((lesson, index) => {
                        const complete =
                          viewer.progress?.completedLessonIds.includes(lesson.id) ?? false;

                        return (
                          <Link
                            key={lesson.id}
                            href={`/learn/${path.slug}/${lesson.slug}`}
                            className="flex items-start gap-4 rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.05]"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-100">
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-semibold text-white">{lesson.title}</p>
                                <span className="text-sm text-cyan-200">{lesson.xp} XP</span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-slate-400">
                                {lesson.summary}
                              </p>
                            </div>
                            <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                              {complete ? "Done" : `${lesson.minutes} min`}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto mt-20 w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              icon: <Zap className="h-5 w-5" />,
              title: "Learn in minutes, not lectures",
              body: "Each lesson is compact on purpose: a few ideas, one challenge, one visible win.",
            },
            {
              icon: <Flame className="h-5 w-5" />,
              title: "Keep streaks alive with tiny daily reps",
              body: "XP and streak tracking reward consistency, even when you only have 10 quiet minutes.",
            },
            {
              icon: <Star className="h-5 w-5" />,
              title: "Ask the AI tutor without leaving the lesson",
              body: "The tutor already knows the lesson context, the challenge prompt, and the hint you were given.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[2rem] panel-surface p-6 sm:p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                {item.icon}
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-white">{item.title}</h3>
              <p className="mt-4 text-base leading-7 text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pro" className="mx-auto mt-20 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2.25rem] panel-surface p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                DevPath Pro
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Unlock the full learning map for{" "}
                <span className="text-gradient">$9.99/month.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
                Pro gives you Python, all future paths, unlimited AI tutor messages,
                and full synced progress across devices.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Paths
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">All current + future</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    AI tutor
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">Unlimited</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Sync
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">Every lesson saved</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 p-6 text-left sm:p-7">
              <div className="flex items-center gap-3 text-cyan-100">
                <Trophy className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.26em]">
                  Upgrade lane
                </p>
              </div>
              <p className="mt-5 text-5xl font-semibold tracking-tight text-white">$9.99</p>
              <p className="mt-2 text-sm text-cyan-50/80">per month, cancel anytime</p>

              <div className="mt-6">
                {viewer.isAuthenticated ? (
                  <BillingButton isProActive={viewer.isPro} />
                ) : (
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Create free account first
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-200">
                <li>Python path and future paths stay unlocked.</li>
                <li>Unlimited lesson-aware AI tutor messages.</li>
                <li>Perfect for people who want momentum without classroom drag.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
