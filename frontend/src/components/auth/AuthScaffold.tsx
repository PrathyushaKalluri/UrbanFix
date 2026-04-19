import type { ReactNode } from "react";
import { Navbar } from "../Navbar";

type AuthScaffoldProps = {
  title: string;
  description: string;
  versionTag?: string;
  preForm?: ReactNode;
  children: ReactNode;
  postForm?: ReactNode;
};

export function AuthScaffold({
  title,
  description,
  versionTag = "v4.0.2",
  preForm,
  children,
  postForm,
}: AuthScaffoldProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#FCFDFC] text-[#090A0A]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      <Navbar />

      <main className="relative z-10 flex flex-1 items-center justify-center p-6">
        <div className="absolute top-1/4 -right-20 h-96 w-96 rounded-full bg-emerald-100 opacity-50 blur-[120px]" />
        <div className="absolute bottom-1/4 -left-20 h-96 w-96 rounded-full bg-cyan-100 opacity-50 blur-[120px]" />

        <div className="grid w-full max-w-[1100px] items-stretch gap-8 md:grid-cols-2">
          <section className="hidden flex-col justify-center space-y-8 pr-12 md:flex">
            <div className="space-y-4">
              <span className="font-mono text-[10px] tracking-[0.3em] text-emerald-600 uppercase">
                System initiation
              </span>
              <h1 className="text-5xl leading-tight font-bold tracking-tight text-[#090A0A]">
                Orchestrate Your <br /> Urban Reality.
              </h1>
              <p className="max-w-md text-lg text-[#878D89]">
                Join the precision network connecting premium maintenance with
                specialized technical expertise.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <article className="space-y-2 border border-emerald-200/50 bg-white/70 p-6 shadow-sm backdrop-blur-xl">
                <span className="font-mono text-xs text-emerald-600">
                  01 // PRECISION
                </span>
                <p className="text-xs leading-relaxed font-medium text-zinc-700">
                  Verified technical standards for every domestic intervention.
                </p>
              </article>
              <article className="space-y-2 border border-emerald-200/50 bg-white/70 p-6 shadow-sm backdrop-blur-xl">
                <span className="font-mono text-xs text-emerald-600">
                  02 // CLARITY
                </span>
                <p className="text-xs leading-relaxed font-medium text-zinc-700">
                  Transparent status logs and real-time orchestration.
                </p>
              </article>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <div className="h-px flex-grow bg-emerald-200/60" />
              <span className="font-mono text-[10px] tracking-widest text-[#878D89] uppercase">
                Active nodes: 1,284
              </span>
            </div>
          </section>

          <section className="border border-emerald-200/50 bg-white/70 p-8 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl md:p-12">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#090A0A]">{title}</h2>
                <p className="mt-1 text-sm text-[#878D89]">{description}</p>
              </div>
              <span className="font-mono text-[10px] text-[#878D89]/70">
                {versionTag}
              </span>
            </div>

            {preForm}
            {children}
            {postForm}
          </section>
        </div>
      </main>

      <footer className="relative z-10 mt-auto flex w-full flex-col items-center justify-center gap-8 border-t border-zinc-100 bg-transparent px-6 py-12 md:flex-row">
        <span className="font-mono text-[10px] tracking-tight text-zinc-400 uppercase">
          © {new Date().getFullYear()} UrbanFix
        </span>
        <div className="flex gap-6">
          <span className="font-mono text-[10px] tracking-tight text-zinc-400 uppercase">
            Privacy
          </span>
          <span className="font-mono text-[10px] tracking-tight text-zinc-400 uppercase">
            Terms
          </span>
          <span className="font-mono text-[10px] tracking-tight text-zinc-400 uppercase">
            Support
          </span>
        </div>
      </footer>
    </div>
  );
}

