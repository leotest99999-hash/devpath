"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { startTransition, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  Circle,
  Crown,
  LoaderCircle,
  Lock,
  Play,
  RefreshCcw,
  TerminalSquare,
} from "lucide-react";
import type { LearningPath, Lesson } from "@/lib/course-data";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-[1.75rem] border border-white/8 bg-slate-950/70 text-sm text-slate-400">
      Loading editor...
    </div>
  ),
});

const pyodideIndexUrl = "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/";
const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-55";
const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-55";

type TutorMessage = {
  role: "assistant" | "user";
  content: string;
};

type LessonWorkbenchProps = {
  path: LearningPath;
  lesson: Lesson;
  isSignedIn: boolean;
  isPro: boolean;
  isLocked: boolean;
  initialCompletedLessonIds: string[];
  nextLessonHref: string | null;
};

type CheckResult = {
  message: string;
  passed: boolean;
};

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<{
      runPythonAsync: (code: string) => Promise<string>;
    }>;
  }
}

function evaluateChecks(lesson: Lesson, code: string) {
  return lesson.runtime.checks.map((check) => {
    const passed =
      check.kind === "includes"
        ? code.includes(check.value)
        : new RegExp(check.value, check.flags).test(code);

    return {
      message: check.message,
      passed,
    } satisfies CheckResult;
  });
}

function escapeInlineScript(value: string) {
  return value.replace(/<\/script/gi, "<\\/script");
}

function buildPreviewDocument(lesson: Lesson, code: string, previewChannel: string) {
  if (lesson.runtime.mode === "python") {
    return "";
  }

  const html =
    lesson.runtime.target === "html"
      ? lesson.runtime.baseHtml.replace("{{code}}", code)
      : lesson.runtime.baseHtml;
  const css =
    lesson.runtime.target === "css"
      ? `${lesson.runtime.baseCss}\n\n${code}`
      : lesson.runtime.baseCss;
  const js =
    lesson.runtime.target === "js" ? `${lesson.runtime.baseJs}\n\n${code}` : lesson.runtime.baseJs;

  const escapedJs = escapeInlineScript(js);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>${css}</style>
  </head>
  <body>
    ${html}
    <script>
      const previewChannel = ${JSON.stringify(previewChannel)};
      const send = (type, payload) => {
        window.parent.postMessage(
          { source: "devpath-preview", previewChannel, type, payload },
          "*",
        );
      };

      ["log", "warn", "error"].forEach((method) => {
        const original = console[method];
        console[method] = (...args) => {
          send("console", {
            method,
            args: args.map((value) => {
              if (typeof value === "string") {
                return value;
              }

              try {
                return JSON.stringify(value);
              } catch (error) {
                return String(value);
              }
            }),
          });
          original.apply(console, args);
        };
      });

      window.addEventListener("error", (event) => {
        send("runtime-error", event.message);
      });

      window.addEventListener("DOMContentLoaded", () => {
        send("ready", null);
      });
    </script>
    <script>
      try {
        ${escapedJs}
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
      }
    </script>
  </body>
</html>`;
}

function TutorBubble({ message }: { message: TutorMessage }) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`rounded-[1.5rem] px-4 py-3 text-sm leading-7 ${
        isAssistant
          ? "border border-white/8 bg-white/[0.04] text-slate-200"
          : "border border-cyan-400/20 bg-cyan-400/10 text-cyan-50"
      }`}
    >
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
        {isAssistant ? "AI tutor" : "You"}
      </p>
      <p className="whitespace-pre-wrap">{message.content}</p>
    </div>
  );
}

export function LessonWorkbench({
  path,
  lesson,
  isSignedIn,
  isPro,
  isLocked,
  initialCompletedLessonIds,
  nextLessonHref,
}: LessonWorkbenchProps) {
  const previewSeed = useId().replace(/:/g, "");
  const [code, setCode] = useState(lesson.runtime.starterCode);
  const [activePanel, setActivePanel] = useState<"lesson" | "code" | "tutor">("lesson");
  const [previewChannel, setPreviewChannel] = useState(`preview-${previewSeed}`);
  const [previewDoc, setPreviewDoc] = useState<string>(() =>
    lesson.runtime.mode === "python"
      ? ""
      : buildPreviewDocument(
          lesson,
          lesson.runtime.starterCode,
          `preview-${previewSeed}`,
        ),
  );
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const [pythonOutput, setPythonOutput] = useState("");
  const [runError, setRunError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState(initialCompletedLessonIds);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      role: "assistant",
      content:
        "Need a nudge? Ask about the current lesson, paste an error, or ask for a smaller hint before the full solution.",
    },
  ]);
  const [tutorInput, setTutorInput] = useState("");
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const pyodidePromiseRef = useRef<Promise<{ runPythonAsync: (code: string) => Promise<string> }> | null>(
    null,
  );

  const checkResults = useMemo(() => evaluateChecks(lesson, code), [lesson, code]);
  const allChecksPassed = checkResults.every((check) => check.passed);
  const isCompleted = completedLessonIds.includes(lesson.id);
  const completedLessonsInPath = path.lessons.filter((entry) =>
    completedLessonIds.includes(entry.id),
  ).length;
  const pathProgressPercent =
    path.lessons.length === 0
      ? 0
      : Math.round((completedLessonsInPath / path.lessons.length) * 100);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const payload = event.data as
        | {
            source?: string;
            previewChannel?: string;
            type?: string;
            payload?: { method?: string; args?: string[] } | string | null;
          }
        | undefined;

      if (
        !payload ||
        payload.source !== "devpath-preview" ||
        payload.previewChannel !== previewChannel
      ) {
        return;
      }

      if (payload.type === "console" && payload.payload && typeof payload.payload === "object") {
        const method = payload.payload.method?.toUpperCase() ?? "LOG";
        const args = payload.payload.args?.join(" ") ?? "";
        setConsoleLines((current) => [...current, `${method}: ${args}`]);
      }

      if (payload.type === "runtime-error" && typeof payload.payload === "string") {
        setRunError(payload.payload);
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [previewChannel]);

  async function ensurePyodide() {
    if (!pyodidePromiseRef.current) {
      pyodidePromiseRef.current = (async () => {
        if (!window.loadPyodide) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.getElementById("devpath-pyodide-loader");

            if (existing) {
              existing.addEventListener("load", () => resolve(), { once: true });
              existing.addEventListener(
                "error",
                () => reject(new Error("Could not load Pyodide.")),
                { once: true },
              );
              return;
            }

            const script = document.createElement("script");
            script.id = "devpath-pyodide-loader";
            script.src = `${pyodideIndexUrl}pyodide.js`;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Could not load Pyodide."));
            document.head.appendChild(script);
          });
        }

        if (!window.loadPyodide) {
          throw new Error("Pyodide did not attach to the browser.");
        }

        return window.loadPyodide({ indexURL: pyodideIndexUrl });
      })();
    }

    return pyodidePromiseRef.current;
  }

  async function runChallenge() {
    if (isLocked) {
      return;
    }

    setIsRunning(true);
    setRunError(null);
    setCompletionMessage(null);
    setCompletionError(null);

    try {
      if (lesson.runtime.mode === "python") {
        const pyodide = await ensurePyodide();
        const wrappedCode = `
import io
import contextlib
import traceback

__devpath_buffer = io.StringIO()
__devpath_globals = {}

try:
    with contextlib.redirect_stdout(__devpath_buffer), contextlib.redirect_stderr(__devpath_buffer):
        exec(${JSON.stringify(code)}, __devpath_globals)
except Exception:
    __devpath_buffer.write(traceback.format_exc())

__devpath_buffer.getvalue()
`;
        const output = await pyodide.runPythonAsync(wrappedCode);
        setPythonOutput(output.trim() ? output : "Program ran without printed output.");
      } else {
        setConsoleLines([]);
        const nextPreviewChannel = `preview-${previewSeed}-${Date.now()}`;
        setPreviewChannel(nextPreviewChannel);
        setPreviewDoc(buildPreviewDocument(lesson, code, nextPreviewChannel));
      }

      setHasExecuted(true);
    } catch (error) {
      setRunError(
        error instanceof Error ? error.message : "The code runner could not finish.",
      );
    } finally {
      setIsRunning(false);
    }
  }

  async function handleCompleteLesson() {
    if (!allChecksPassed || !hasExecuted || isLocked) {
      return;
    }

    if (!isSignedIn) {
      setCompletionError("Create a free account first so DevPath can save this lesson.");
      return;
    }

    setIsCompleting(true);
    setCompletionError(null);

    try {
      const response = await fetch("/api/progress/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: lesson.id,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        progress?: { completedLessonIds: string[] };
      };

      if (!response.ok || !payload.progress) {
        throw new Error(payload.error || "The lesson could not be saved.");
      }

      startTransition(() => {
        setCompletedLessonIds(payload.progress?.completedLessonIds ?? completedLessonIds);
        setCompletionMessage(`Lesson complete. ${lesson.xp} XP added to your account.`);
      });
    } catch (error) {
      setCompletionError(
        error instanceof Error ? error.message : "The lesson could not be saved.",
      );
    } finally {
      setIsCompleting(false);
    }
  }

  async function handleTutorSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!tutorInput.trim() || !isSignedIn || isLocked) {
      return;
    }

    const nextUserMessage: TutorMessage = {
      role: "user",
      content: tutorInput.trim(),
    };

    const nextMessages = [...messages, nextUserMessage];
    setMessages(nextMessages);
    setTutorInput("");
    setTutorError(null);
    setIsTutorLoading(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pathSlug: path.slug,
          lessonSlug: lesson.slug,
          messages: nextMessages.slice(-10),
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        message?: string;
        remainingMessages?: number | null;
      };

      if (!response.ok || !payload.message) {
        throw new Error(payload.error || "The AI tutor could not respond.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: payload.message ?? "Try asking again in a second.",
        },
      ]);
      setRemainingMessages(
        typeof payload.remainingMessages === "number" ? payload.remainingMessages : null,
      );
    } catch (error) {
      setTutorError(
        error instanceof Error ? error.message : "The AI tutor could not respond.",
      );
    } finally {
      setIsTutorLoading(false);
    }
  }

  function renderLessonPanel() {
    return (
      <div className="rounded-[2rem] panel-surface p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Lesson guide
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{lesson.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">{lesson.summary}</p>
          </div>
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Path progress</p>
            <p className="mt-1 text-2xl font-semibold text-white">{pathProgressPercent}%</p>
          </div>
        </div>

        <div className="mt-6 h-2 rounded-full bg-white/6">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-cyan-400 to-sky-300"
            style={{ width: `${pathProgressPercent}%` }}
          />
        </div>

        <div className="mt-8 space-y-4">
          {lesson.steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-cyan-400/15 bg-cyan-400/8 p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Challenge</p>
          <p className="mt-3 text-base font-medium text-white">
            {lesson.runtime.challengePrompt}
          </p>
          <p className="mt-3 text-sm leading-7 text-cyan-50/80">
            Hint: {lesson.runtime.hint}
          </p>
        </div>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Challenge checklist
          </p>
          <div className="mt-4 space-y-3">
            {checkResults.map((result) => (
              <div
                key={result.message}
                className="flex items-start gap-3 rounded-[1.4rem] border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                {result.passed ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 text-slate-500" />
                )}
                <p className="text-sm leading-6 text-slate-300">{result.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderCodePanel() {
    return (
      <div className="rounded-[2rem] panel-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Workspace</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Write, run, and clear the challenge.
            </h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            {lesson.runtime.editableLabel}
          </div>
        </div>

        {isLocked ? (
          <div className="mt-6 rounded-[1.75rem] border border-amber-300/20 bg-amber-300/10 p-5">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 text-amber-200" />
              <div>
                <p className="text-sm font-semibold text-white">
                  This lesson is inside DevPath Pro.
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-50/80">
                  Upgrade to unlock Python, unlimited tutor chats, and every new
                  path we add after launch.
                </p>
                <div className="mt-4">
                  {isSignedIn ? (
                    <Link href="/#pro" className={buttonClass}>
                      <Crown className="h-4 w-4" />
                      Unlock Pro
                    </Link>
                  ) : (
                    <Link href="/sign-up" className={buttonClass}>
                      Create account first
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-white/8 bg-slate-950/80">
          <MonacoEditor
            height="420px"
            theme="vs-dark"
            defaultLanguage={
              lesson.runtime.mode === "javascript"
                ? "javascript"
                : lesson.runtime.mode === "python"
                  ? "python"
                  : lesson.runtime.mode === "html"
                    ? "html"
                    : "css"
            }
            value={code}
            onChange={(value) => setCode(value ?? "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              lineNumbersMinChars: 3,
              tabSize: 2,
              padding: { top: 16, bottom: 16 },
              readOnly: isLocked,
            }}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={buttonClass}
            onClick={() => void runChallenge()}
            disabled={isRunning || isLocked}
          >
            {isRunning ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run challenge
              </>
            )}
          </button>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => {
              setCode(lesson.runtime.starterCode);
              setConsoleLines([]);
              setPythonOutput("");
              setRunError(null);
              setHasExecuted(false);
            }}
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => void handleCompleteLesson()}
            disabled={isCompleting || isCompleted || !allChecksPassed || !hasExecuted || isLocked}
          >
            {isCompleting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isCompleted ? (
              <>
                <Check className="h-4 w-4" />
                Completed
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Complete lesson
              </>
            )}
          </button>
        </div>

        {completionMessage ? (
          <div className="mt-4 rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-50">
            {completionMessage}
          </div>
        ) : null}
        {completionError ? (
          <div className="mt-4 rounded-[1.5rem] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
            {completionError}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              {lesson.runtime.mode === "python" ? "Output" : "Live preview"}
            </p>
            <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-white/8 bg-white">
              {lesson.runtime.mode === "python" ? (
                <pre className="min-h-[240px] overflow-auto bg-slate-950 p-4 font-mono text-sm text-emerald-200">
                  {pythonOutput || "Run the challenge to see Python output here."}
                </pre>
              ) : (
                <iframe
                  key={previewChannel}
                  title={`${lesson.title} preview`}
                  srcDoc={previewDoc}
                  sandbox="allow-scripts"
                  className="min-h-[240px] w-full bg-white"
                />
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
              <TerminalSquare className="h-4 w-4" />
              Debug output
            </p>
            <div className="mt-4 min-h-[240px] rounded-[1.25rem] border border-white/8 bg-slate-950 p-4 font-mono text-sm text-slate-200">
              {runError ? (
                <p className="whitespace-pre-wrap text-rose-200">{runError}</p>
              ) : lesson.runtime.mode === "python" ? (
                <p className="whitespace-pre-wrap text-slate-300">
                  {pythonOutput || "Printed lines and Python tracebacks show up here."}
                </p>
              ) : consoleLines.length > 0 ? (
                <div className="space-y-2">
                  {consoleLines.map((line, index) => (
                    <p key={`${line}-${index}`} className="whitespace-pre-wrap text-slate-300">
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">
                  Console logs and runtime errors appear here after you press Run.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-white/8 bg-white/[0.03] px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-white">
              {isCompleted ? "Lesson saved to your account." : "Finish the checklist to bank XP."}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {allChecksPassed
                ? "Your code matches the challenge requirements."
                : "One or more checklist items still need attention."}
            </p>
          </div>
          {nextLessonHref ? (
            <Link href={nextLessonHref} className={secondaryButtonClass}>
              Next lesson
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link href={`/learn/${path.slug}`} className={secondaryButtonClass}>
              Back to path
            </Link>
          )}
        </div>
      </div>
    );
  }

  function renderTutorPanel() {
    return (
      <div className="rounded-[2rem] panel-surface p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">AI tutor</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Ask for help without leaving the lesson.
            </h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            {isPro
              ? "Unlimited"
              : remainingMessages !== null
                ? `${remainingMessages} left today`
                : "Free has 8/day"}
          </div>
        </div>

        {isLocked ? (
          <div className="mt-6 rounded-[1.75rem] border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-7 text-amber-50/80">
            Tutor help for this path unlocks with DevPath Pro.
          </div>
        ) : !isSignedIn ? (
          <div className="mt-6 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
            <div className="flex items-start gap-3">
              <Bot className="mt-1 h-5 w-5 text-cyan-200" />
              <div>
                <p className="text-sm font-semibold text-white">
                  Create a free account to unlock the tutor.
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  The tutor reads the lesson context before it answers, so it can give
                  you tighter hints than a generic chatbot.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/sign-up" className={buttonClass}>
                    Create account
                  </Link>
                  <Link href="/sign-in" className={secondaryButtonClass}>
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4">
              {messages.map((message, index) => (
                <TutorBubble key={`${message.role}-${index}`} message={message} />
              ))}
            </div>

            {tutorError ? (
              <div className="mt-4 rounded-[1.5rem] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                {tutorError}
              </div>
            ) : null}

            <form className="mt-5 space-y-3" onSubmit={handleTutorSubmit}>
              <textarea
                value={tutorInput}
                onChange={(event) => setTutorInput(event.target.value)}
                placeholder="Ask about the challenge, the code you wrote, or the error you hit..."
                className="min-h-[132px] w-full rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
                disabled={isTutorLoading}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-400">
                  {isPro
                    ? "Pro keeps the tutor open as long as you need it."
                    : "Free accounts get 8 AI tutor messages per day."}
                </p>
                <button
                  type="submit"
                  className={buttonClass}
                  disabled={isTutorLoading || !tutorInput.trim()}
                >
                  {isTutorLoading ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Asking tutor...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4" />
                      Ask tutor
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] panel-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
              {path.title} path
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {lesson.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
              {lesson.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              {lesson.minutes} min
            </div>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-50">
              {lesson.xp} XP
            </div>
            {path.proRequired ? (
              <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100">
                Pro path
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex gap-2 rounded-[1.5rem] border border-white/8 bg-slate-950/60 p-2 md:hidden">
        {[
          ["lesson", "Lesson"],
          ["code", "Code"],
          ["tutor", "Tutor"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setActivePanel(value as "lesson" | "code" | "tutor")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activePanel === value
                ? "bg-cyan-400 text-slate-950"
                : "bg-transparent text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="md:hidden">
        {activePanel === "lesson" ? renderLessonPanel() : null}
        {activePanel === "code" ? renderCodePanel() : null}
        {activePanel === "tutor" ? renderTutorPanel() : null}
      </div>

      <div className="hidden gap-6 md:grid xl:grid-cols-[0.72fr_1.12fr_0.72fr]">
        {renderLessonPanel()}
        {renderCodePanel()}
        {renderTutorPanel()}
      </div>
    </div>
  );
}
