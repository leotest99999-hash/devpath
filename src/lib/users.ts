import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { z } from "zod";
import { normalizeEmail, sha256 } from "@/lib/hash";
import { readJson, writeJson } from "@/lib/storage";

export const userSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  passwordHash: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.string().min(1),
});

const userIndexSchema = z.object({
  userId: z.string().min(1),
});

export type AppUser = z.infer<typeof userSchema>;

function getUserByIdPath(userId: string) {
  return `users/by-id/${userId}.json`;
}

function getUserByEmailPath(email: string) {
  return `users/by-email/${sha256(normalizeEmail(email))}.json`;
}

export async function getUserById(userId: string) {
  return readJson(getUserByIdPath(userId), userSchema);
}

export async function getUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const userIndex = await readJson(getUserByEmailPath(normalizedEmail), userIndexSchema);

  if (!userIndex) {
    return null;
  }

  return getUserById(userIndex.userId);
}

export async function createUser(input: {
  email: string;
  password: string;
  name: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const existingUser = await getUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("An account with that email already exists.");
  }

  const now = new Date().toISOString();
  const user: AppUser = {
    id: randomUUID(),
    email: normalizedEmail,
    name: input.name.trim(),
    passwordHash: await hash(input.password, 12),
    createdAt: now,
  };

  await writeJson(getUserByIdPath(user.id), user);
  await writeJson(getUserByEmailPath(user.email), {
    userId: user.id,
  });

  return user;
}
