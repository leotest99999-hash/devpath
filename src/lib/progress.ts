import { z } from "zod";
import { learningPaths } from "@/lib/course-data";
import { readJson, writeJson } from "@/lib/storage";

const progressSchema = z.object({
  userId: z.string().min(1),
  completedLessonIds: z.array(z.string().min(1)).default([]),
  xp: z.number().int().nonnegative().default(0),
  streakDays: z.number().int().nonnegative().default(0),
  lastCompletedOn: z.string().nullable().default(null),
  updatedAt: z.string().min(1),
});

export type ProgressRecord = z.infer<typeof progressSchema>;

function getProgressPath(userId: string) {
  return `progress/${userId}.json`;
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function diffInDays(previousDate: string, nextDate: string) {
  const previous = new Date(`${previousDate}T00:00:00Z`).getTime();
  const next = new Date(`${nextDate}T00:00:00Z`).getTime();

  return Math.round((next - previous) / (24 * 60 * 60 * 1000));
}

export async function getProgress(userId: string) {
  const existing = await readJson(getProgressPath(userId), progressSchema);

  if (existing) {
    return existing;
  }

  return {
    userId,
    completedLessonIds: [],
    xp: 0,
    streakDays: 0,
    lastCompletedOn: null,
    updatedAt: new Date().toISOString(),
  } satisfies ProgressRecord;
}

export async function completeLesson(userId: string, lessonId: string, xpAward: number) {
  const current = await getProgress(userId);

  if (current.completedLessonIds.includes(lessonId)) {
    return current;
  }

  const today = getTodayIsoDate();
  let streakDays = current.streakDays;

  if (current.lastCompletedOn === today) {
    streakDays = Math.max(1, current.streakDays);
  } else if (!current.lastCompletedOn) {
    streakDays = 1;
  } else {
    const daysSinceLast = diffInDays(current.lastCompletedOn, today);
    streakDays = daysSinceLast === 1 ? current.streakDays + 1 : 1;
  }

  const next: ProgressRecord = {
    userId,
    completedLessonIds: [...current.completedLessonIds, lessonId],
    xp: current.xp + xpAward,
    streakDays,
    lastCompletedOn: today,
    updatedAt: new Date().toISOString(),
  };

  await writeJson(getProgressPath(userId), next);
  return next;
}

export function getPathProgress(completedLessonIds: string[]) {
  return learningPaths.map((path) => {
    const completed = path.lessons.filter((lesson) =>
      completedLessonIds.includes(lesson.id),
    ).length;

    return {
      pathSlug: path.slug,
      completedLessons: completed,
      totalLessons: path.lessons.length,
      progressPercent:
        path.lessons.length === 0
          ? 0
          : Math.round((completed / path.lessons.length) * 100),
    };
  });
}

