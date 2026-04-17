import { z } from "zod";
import { auth } from "@/auth";
import { getGroqClient } from "@/lib/groq";
import { getLessonBySlugs } from "@/lib/course-data";
import { getSubscriptionRecord, isProActive } from "@/lib/subscriptions";
import { consumeTutorMessage } from "@/lib/tutor-usage";

const tutorSchema = z.object({
  pathSlug: z.string().min(1),
  lessonSlug: z.string().min(1),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(12),
});

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json(
      {
        error: "Create a free account to use the DevPath AI tutor.",
      },
      { status: 401 },
    );
  }

  try {
    const payload = tutorSchema.parse(await request.json());
    const lessonEntry = getLessonBySlugs(payload.pathSlug, payload.lessonSlug);

    if (!lessonEntry) {
      return Response.json(
        {
          error: "The tutor couldn't find that lesson context.",
        },
        { status: 404 },
      );
    }

    const subscription = await getSubscriptionRecord(userId);
    const proActive = isProActive(subscription);
    const usage = await consumeTutorMessage(userId, proActive);

    if (!usage.allowed) {
      return Response.json(
        {
          error:
            "Free tutor messages are used up for today. Upgrade to Pro for unlimited help.",
        },
        { status: 429 },
      );
    }

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content: [
            "You are DevPath Tutor, a patient coding coach inside an interactive learning platform.",
            "Keep explanations practical, compact, and friendly.",
            "Do not give the full final solution immediately unless the learner directly asks for it.",
            "Prefer hints, debugging guidance, and step-by-step nudges.",
            `Current path: ${lessonEntry.path.title}.`,
            `Current lesson: ${lessonEntry.lesson.title}.`,
            `Lesson summary: ${lessonEntry.lesson.summary}`,
            "Key lesson points:",
            ...lessonEntry.lesson.steps.map((step) => `- ${step.title}: ${step.body}`),
            `Challenge prompt: ${lessonEntry.lesson.runtime.challengePrompt}`,
            `Hint available in the lesson: ${lessonEntry.lesson.runtime.hint}`,
          ].join("\n"),
        },
        ...payload.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });

    const content = completion.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("The tutor returned an empty response.");
    }

    return Response.json({
      message: content,
      remainingMessages: usage.remaining,
      freeLimit: usage.limit,
      isPro: proActive,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: error.issues[0]?.message ?? "Try again.",
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The DevPath tutor could not respond just now.",
      },
      { status: 400 },
    );
  }
}

