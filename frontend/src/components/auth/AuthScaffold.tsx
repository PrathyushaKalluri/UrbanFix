import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { HandHeart, Route, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "../ui/badge";
import { SiteFooter } from "../SiteFooter";

type AuthScaffoldProps = {
  title: string;
  description: string;
  preForm?: ReactNode;
  children: ReactNode;
  postForm?: ReactNode;
};

export function AuthScaffold({
  title,
  description,
  preForm,
  children,
  postForm,
}: AuthScaffoldProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#fafafa] text-zinc-900">
      <div
        className="pointer-events-none fixed inset-0"
      >
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-blue-300/20 blur-[120px]" />
        <div className="absolute -right-20 top-28 h-[640px] w-[640px] rounded-full bg-blue-200/15 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[460px] w-[460px] rounded-full bg-cyan-200/10 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <header className="relative z-20 px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between rounded-full border border-white/50 bg-white/60 px-6 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-zinc-900 transition-opacity hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                <HandHeart className="h-4 w-4 text-white" fill="none" />
              </div>
              <span className="hidden sm:inline">UrbanFix</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-blue-600"
              >
                Log in
              </Link>
              <Link
                to="/signup/user"
                className="rounded-xl border border-blue-300/30 bg-gradient-to-b from-blue-400 to-blue-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-300 hover:to-blue-400"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto grid w-full max-w-6xl items-start gap-8 lg:grid-cols-[1.05fr_1fr]">
          <section className="hidden lg:sticky lg:top-24 lg:flex lg:flex-col lg:space-y-8">
            <Badge
              variant="outline"
              className="h-8 w-fit rounded-full border-blue-200/50 bg-blue-50/60 px-4 text-xs font-semibold uppercase tracking-wider text-blue-700 backdrop-blur-sm"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Precision Network
            </Badge>

            <div className="space-y-4">
              <h1
                className="text-5xl font-semibold tracking-tight text-zinc-900"
                style={{ letterSpacing: "-0.03em" }}
              >
                Orchestrate Your
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  Urban Reality
                </span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-zinc-500">
                The same atmospheric UX as your landing page, now carried through
                to authentication. Clear steps, transparent state, trusted access.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-[0_6px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200/50 bg-blue-50/80 text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                  Verified Access
                </p>
                <p className="text-sm leading-relaxed text-zinc-600">
                  Session security and role-based routing maintained end to end.
                </p>
              </article>

              <article className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-[0_6px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200/50 bg-blue-50/80 text-blue-600">
                  <Route className="h-5 w-5" />
                </div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                  Guided Flow
                </p>
                <p className="text-sm leading-relaxed text-zinc-600">
                  Resident and expert onboarding follow a single visual system.
                </p>
              </article>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white/60 px-4 py-3 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Authentication fabric active
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/75 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.07)] backdrop-blur-2xl md:p-10">
            <div className="mb-8">
              <div>
                <h2
                  className="text-3xl font-semibold tracking-tight text-zinc-900"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  {description}
                </p>
              </div>
            </div>

            {preForm}
            {children}
            {postForm}
          </section>
        </div>
      </main>

      <SiteFooter className="relative z-10" />
    </div>
  );
}
