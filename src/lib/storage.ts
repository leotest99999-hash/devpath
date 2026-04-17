import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { get, put } from "@vercel/blob";
import { z, type ZodType } from "zod";

const storagePrefix = "devpath/";
const localStorageRoot = join(process.cwd(), ".data", "devpath");
const textSchema = z.string();

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function canUseLocalFallback() {
  return !hasBlobToken() && process.env.NODE_ENV !== "production";
}

function getBlobPath(pathname: string) {
  return `${storagePrefix}${pathname}`;
}

function getLocalPath(pathname: string) {
  return join(localStorageRoot, pathname);
}

function missingPersistenceError() {
  return new Error(
    "DevPath persistence is not configured. Set BLOB_READ_WRITE_TOKEN for production storage.",
  );
}

export async function readText(pathname: string) {
  if (hasBlobToken()) {
    const blob = await get(getBlobPath(pathname), {
      access: "private",
    });

    if (!blob || blob.statusCode !== 200) {
      return null;
    }

    return textSchema.parse(await new Response(blob.stream).text());
  }

  if (!canUseLocalFallback()) {
    return null;
  }

  try {
    return textSchema.parse(await readFile(getLocalPath(pathname), "utf8"));
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }

    throw error;
  }
}

export async function readJson<T>(pathname: string, schema: ZodType<T>) {
  const stored = await readText(pathname);

  if (!stored) {
    return null;
  }

  return schema.parse(JSON.parse(stored));
}

export async function writeJson(pathname: string, value: unknown) {
  const content = JSON.stringify(value, null, 2);

  if (hasBlobToken()) {
    await put(getBlobPath(pathname), content, {
      access: "private",
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: "application/json",
    });
    return;
  }

  if (!canUseLocalFallback()) {
    throw missingPersistenceError();
  }

  const localPath = getLocalPath(pathname);
  await mkdir(dirname(localPath), { recursive: true });
  await writeFile(localPath, content, "utf8");
}

