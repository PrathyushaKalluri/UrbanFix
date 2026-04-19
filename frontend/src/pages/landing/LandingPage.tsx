import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowRight,
  Route,
  ShieldCheck,
  Activity,
  Radar,
  ChevronRight,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FCFDFC] text-[#090A0A]">
      {/* Noise Texture Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Gradient Orbs */}
      <div className="pointer-events-none absolute top-20 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-100/60 opacity-50 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-40 -left-20 h-96 w-96 rounded-full bg-cyan-100/60 opacity-40 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/3 h-64 w-64 rounded-full bg-emerald-50/80 opacity-30 blur-[100px]" />

      {/* Global Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col">
        <section className="flex flex-col items-center justify-center px-6 py-24 text-center md:py-32">
          <div className="space-y-6">
            <span className="font-mono text-[10px] tracking-[0.3em] text-emerald-600 uppercase">
              Precision Network v2.0
            </span>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-[#090A0A] md:text-6xl lg:text-7xl">
              Orchestrate Your
              <br />
              Urban Reality.
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-[#878D89] md:text-xl">
              High-precision service routing and intelligent telemetry for the
              modern metropolis. Locate verified expertise with atmospheric
              accuracy.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-10 w-full max-w-xl">
            <div className="flex items-center gap-3 border border-emerald-200/50 bg-white/80 p-2 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl">
              <Search className="ml-3 h-5 w-5 text-[#878D89]" />
              <Input
                type="text"
                placeholder="Search services, locations, expertise..."
                className="flex-1 border-0 bg-transparent text-sm tracking-wide placeholder:text-zinc-400 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="h-11 rounded-none border border-emerald-300/30 bg-emerald-100 px-6 text-xs font-bold tracking-[0.15em] text-emerald-700 uppercase shadow-none hover:bg-emerald-100/80">
                Execute
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-2 border border-emerald-200/50 bg-white/70 px-4 py-2 backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[10px] tracking-widest text-emerald-700 uppercase">
                Status: Optimal
              </span>
            </div>
            <div className="flex items-center gap-2 border border-zinc-200/50 bg-white/70 px-4 py-2 backdrop-blur-xl">
              <span className="font-mono text-[10px] tracking-widest text-[#878D89] uppercase">
                Grid: Active
              </span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 px-6 py-20">
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <article className="group border border-emerald-200/50 bg-white/70 p-8 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl transition-all hover:border-emerald-300/60 hover:bg-white/80">
              <div className="mb-6 flex h-12 w-12 items-center justify-center border border-emerald-200/50 bg-emerald-50/50">
                <Route className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#090A0A]">
                  Intelligent Routing
                </h3>
                <p className="text-sm leading-relaxed text-[#878D89]">
                  Algorithmic dispatch matching your exact coordinates with the
                  optimal specialist in real-time.
                </p>
              </div>
            </article>

            {/* Feature 2 */}
            <article className="group border border-emerald-200/50 bg-white/70 p-8 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl transition-all hover:border-emerald-300/60 hover:bg-white/80">
              <div className="mb-6 flex h-12 w-12 items-center justify-center border border-emerald-200/50 bg-emerald-50/50">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#090A0A]">
                  Verified Expertise
                </h3>
                <p className="text-sm leading-relaxed text-[#878D89]">
                  Cryptographically verified credentials ensuring absolute
                  precision and quality for every engagement.
                </p>
              </div>
            </article>

            {/* Feature 3 */}
            <article className="group border border-emerald-200/50 bg-white/70 p-8 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl transition-all hover:border-emerald-300/60 hover:bg-white/80">
              <div className="mb-6 flex h-12 w-12 items-center justify-center border border-emerald-200/50 bg-emerald-50/50">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#090A0A]">
                  Real-time Telemetry
                </h3>
                <p className="text-sm leading-relaxed text-[#878D89]">
                  Continuous stream of diagnostic data and progress tracking via
                  our hyper-responsive dashboard.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* System Architecture Section */}
        <section className="relative z-10 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center space-y-12 text-center">
              <div className="space-y-4">
                <span className="font-mono text-[10px] tracking-[0.3em] text-emerald-600 uppercase">
                  System Architecture
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-[#090A0A] md:text-4xl">
                  Module: Discovery
                </h2>
                <p className="text-[#878D89]">
                  Precision Filtering & Spatial Awareness
                </p>
              </div>

              {/* Proximity Radar Card */}
              <div className="w-full max-w-3xl border border-emerald-200/50 bg-white/70 p-8 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl md:p-12">
                <div className="flex flex-col items-center space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center border border-emerald-200/50 bg-emerald-50/50">
                      <Radar className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-[#090A0A]">
                        Proximity Radar
                      </h3>
                      <p className="text-sm text-[#878D89]">
                        Visualize active nodes within your immediate perimeter.
                      </p>
                    </div>
                  </div>

                  {/* Radar Visualization Placeholder */}
                  <div className="aspect-video w-full border border-dashed border-emerald-200/50 bg-emerald-50/30 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Radar className="h-12 w-12 text-emerald-400 mx-auto" />
                      <p className="font-mono text-xs tracking-widest text-emerald-600 uppercase">
                        Radar Active
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 border-y border-emerald-200/30 bg-emerald-50/30 px-6 py-16">
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-emerald-600" />
                <span className="font-mono text-3xl font-bold tracking-tight text-[#090A0A]">
                  142+
                </span>
              </div>
              <p className="font-mono text-[10px] tracking-widest text-[#878D89] uppercase">
                Specialists Online
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="font-mono text-3xl font-bold tracking-tight text-[#090A0A]">
                  99.8%
                </span>
              </div>
              <p className="font-mono text-[10px] tracking-widest text-[#878D89] uppercase">
                Resolution Rate
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-emerald-600" />
                <span className="font-mono text-3xl font-bold tracking-tight text-[#090A0A]">
                  &lt;12m
                </span>
              </div>
              <p className="font-mono text-[10px] tracking-widest text-[#878D89] uppercase">
                Avg ETA
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 px-6 py-24">
          <div className="mx-auto flex max-w-4xl flex-col items-center space-y-8 text-center">
            <div className="space-y-4">
              <span className="font-mono text-[10px] tracking-[0.3em] text-emerald-600 uppercase">
                Network Access
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[#090A0A] md:text-4xl">
                Initialize Your Account
              </h2>
              <p className="mx-auto max-w-lg text-[#878D89]">
                Join the network of optimized urban nodes. Secure your access to
                precision services today.
              </p>
            </div>
            <Link to="/signup/user">
              <Button className="h-14 rounded-none border border-emerald-300/30 bg-emerald-100 px-8 text-sm font-bold tracking-[0.2em] text-emerald-700 uppercase shadow-none hover:bg-emerald-100/80">
                Connect to Grid
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 flex w-full flex-col items-center justify-center gap-6 border-t border-emerald-200/30 bg-transparent px-6 py-12 md:flex-row">
          <span className="font-mono text-[10px] tracking-tight text-[#878D89] uppercase">
            © {new Date().getFullYear()} UrbanFix
          </span>
          <div className="flex gap-6">
            <Link
              to="#"
              className="font-mono text-[10px] tracking-tight text-[#878D89] uppercase hover:text-emerald-600 transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="#"
              className="font-mono text-[10px] tracking-tight text-[#878D89] uppercase hover:text-emerald-600 transition-colors"
            >
              Terms
            </Link>
            <Link
              to="#"
              className="font-mono text-[10px] tracking-tight text-[#878D89] uppercase hover:text-emerald-600 transition-colors"
            >
              API Docs
            </Link>
            <Link
              to="#"
              className="font-mono text-[10px] tracking-tight text-[#878D89] uppercase hover:text-emerald-600 transition-colors"
            >
              Network Status
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
