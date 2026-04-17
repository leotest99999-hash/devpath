import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import { auth } from "@/auth";
import { SiteHeader } from "@/components/site-header";
import { AppSessionProvider } from "@/components/session-provider";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "DevPath",
  description:
    "A Mimo-style coding playground with guided paths, instant challenges, and an AI tutor.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${sora.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-slate-100">
        <AppSessionProvider session={session}>
          <div className="relative min-h-screen overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.16),transparent_26%),linear-gradient(180deg,#020617_0%,#020617_48%,#020617_100%)]" />
            <div className="pointer-events-none absolute inset-0 shell-grid opacity-40" />
            <div className="relative z-10 flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <footer className="border-t border-white/8 bg-slate-950/60">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                  <p>DevPath helps you learn code by building tiny wins every day.</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link href="/#paths" className="transition hover:text-white">
                      Paths
                    </Link>
                    <Link href="/#pro" className="transition hover:text-white">
                      Pro
                    </Link>
                    <Link href="/sign-up" className="transition hover:text-white">
                      Start for free
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </AppSessionProvider>
      </body>
    </html>
  );
}
