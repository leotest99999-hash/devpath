import { auth } from "@/auth";
import { getPathProgress, getProgress } from "@/lib/progress";
import { getSubscriptionRecord, isProActive } from "@/lib/subscriptions";

export async function getViewerState() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  if (!userId) {
    return {
      session: null,
      userId: null,
      isAuthenticated: false,
      isPro: false,
      progress: null,
      pathProgress: getPathProgress([]),
    };
  }

  const [subscription, progress] = await Promise.all([
    getSubscriptionRecord(userId),
    getProgress(userId),
  ]);

  return {
    session,
    userId,
    isAuthenticated: true,
    isPro: isProActive(subscription),
    progress,
    pathProgress: getPathProgress(progress.completedLessonIds),
  };
}
