import { z } from "zod";
import { readJson, writeJson } from "@/lib/storage";

export const freeTutorDailyLimit = 8;

const tutorUsageSchema = z.object({
  userId: z.string().min(1),
  date: z.string().min(1),
  messageCount: z.number().int().nonnegative().default(0),
  updatedAt: z.string().min(1),
});

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getTutorUsagePath(userId: string, date: string) {
  return `tutor-usage/${userId}/${date}.json`;
}

export async function consumeTutorMessage(userId: string, isPro: boolean) {
  if (isPro) {
    return {
      allowed: true,
      remaining: null,
      limit: freeTutorDailyLimit,
    };
  }

  const today = getTodayIsoDate();
  const record =
    (await readJson(getTutorUsagePath(userId, today), tutorUsageSchema)) ?? {
      userId,
      date: today,
      messageCount: 0,
      updatedAt: new Date().toISOString(),
    };

  if (record.messageCount >= freeTutorDailyLimit) {
    return {
      allowed: false,
      remaining: 0,
      limit: freeTutorDailyLimit,
    };
  }

  const next = {
    ...record,
    messageCount: record.messageCount + 1,
    updatedAt: new Date().toISOString(),
  };

  await writeJson(getTutorUsagePath(userId, today), next);

  return {
    allowed: true,
    remaining: Math.max(0, freeTutorDailyLimit - next.messageCount),
    limit: freeTutorDailyLimit,
  };
}

