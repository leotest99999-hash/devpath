import { z } from "zod";
import { auth } from "@/auth";
import { getLessonById } from "@/lib/course-data";
import { completeLesson, getPathProgress } from "@/lib/progress";

const completeLessonSchema = z.object({
  lessonId: z.string().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json(
      { error: "Create a free account to save your DevPath progress." },
      { status: 401 },
    );
  }

  try {
    const payload = completeLessonSchema.parse(await request.json());
    const lessonEntry = getLessonById(payload.lessonId);

    if (!lessonEntry) {
      return Response.json(
        { error: "That lesson no longer exists." },
        { status: 404 },
      );
    }

    const progress = await completeLesson(
      userId,
      lessonEntry.lesson.id,
      lessonEntry.lesson.xp,
    );

    return Response.json({
      progress,
      pathProgress: getPathProgress(progress.completedLessonIds),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Try again." },
        { status: 400 },
      );
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Progress could not be saved.",
      },
      { status: 400 },
    );
  }
}

