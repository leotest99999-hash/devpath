import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { LessonWorkbench } from "@/components/lesson-workbench";
import { getLessonBySlugs, getNextLesson } from "@/lib/course-data";
import { getViewerState } from "@/lib/viewer-state";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ pathSlug: string; lessonSlug: string }>;
}) {
  const { pathSlug, lessonSlug } = await params;
  const lessonEntry = getLessonBySlugs(pathSlug, lessonSlug);

  if (!lessonEntry) {
    notFound();
  }

  const viewer = await getViewerState();
  const isLocked = Boolean(lessonEntry.path.proRequired && !viewer.isPro);
  const nextLesson = getNextLesson(pathSlug, lessonSlug);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-400">
        <Link href="/" className="transition hover:text-white">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href={`/learn/${lessonEntry.path.slug}`} className="transition hover:text-white">
          {lessonEntry.path.title}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-200">{lessonEntry.lesson.title}</span>
      </div>

      <LessonWorkbench
        path={lessonEntry.path}
        lesson={lessonEntry.lesson}
        isSignedIn={viewer.isAuthenticated}
        isPro={viewer.isPro}
        isLocked={isLocked}
        initialCompletedLessonIds={viewer.progress?.completedLessonIds ?? []}
        nextLessonHref={
          nextLesson ? `/learn/${lessonEntry.path.slug}/${nextLesson.slug}` : null
        }
      />
    </div>
  );
}
