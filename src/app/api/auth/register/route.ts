import { z } from "zod";
import { createUser } from "@/lib/users";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  try {
    const payload = registerSchema.parse(await request.json());
    const user = await createUser(payload);

    return Response.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          error: error.issues[0]?.message ?? "Check the form and try again.",
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "We couldn't create that account right now.";

    return Response.json(
      {
        error: message,
      },
      { status: 400 },
    );
  }
}

