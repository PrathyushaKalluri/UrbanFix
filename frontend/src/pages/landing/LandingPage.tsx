import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Menu,
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
} from "lucide-react"
import { Link } from "react-router-dom"

export function LandingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
          <div className="mr-4 flex">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight">UrbanFix</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center justify-center space-x-6 text-sm font-medium">
            <Link to="#services" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Services
            </Link>
            <Link to="#intelligence" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Intelligence
            </Link>
            <Link to="#routing" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Routing
            </Link>
            <Link to="#about" className="transition-colors hover:text-foreground/80 text-foreground/60">
              About
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/signup/user">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="flex flex-1 items-center justify-end md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-6 py-4">
                  <nav className="flex flex-col space-y-4">
                    <Link
                      to="#services"
                      className="text-foreground/60 hover:text-foreground transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Services
                    </Link>
                    <Link
                      to="#intelligence"
                      className="text-foreground/60 hover:text-foreground transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Intelligence
                    </Link>
                    <Link
                      to="#routing"
                      className="text-foreground/60 hover:text-foreground transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Routing
                    </Link>
                    <Link
                      to="#about"
                      className="text-foreground/60 hover:text-foreground transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      About
                    </Link>
                  </nav>
                  <Separator />
                  <div className="flex flex-col space-y-3">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup/user" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 hero-gradient">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Orchestrate Your
                <br />
                <span className="text-muted-foreground">Urban Reality</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                High-precision service routing and intelligent telemetry for the modern metropolis.
                Locate verified expertise with atmospheric accuracy.
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-xl">
              <div className="flex items-center space-x-2 rounded-lg border border-border bg-background p-2 shadow-sm">
                <Search className="ml-2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search services, locations, expertise..."
                  className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button className="shrink-0">
                  Execute
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex items-center space-x-4 text-sm">
              <Badge variant="secondary" className="px-3 py-1">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                Status: Optimal
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Grid: Active
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-16 md:py-24 urban-gradient">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1: Intelligent Routing */}
            <Card className="border-border/60">
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Route className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Intelligent Routing</h3>
                    <p className="text-muted-foreground">
                      Algorithmic dispatch matching your exact coordinates with the optimal specialist in real-time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2: Verified Expertise */}
            <Card className="border-border/60">
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Verified Expertise</h3>
                    <p className="text-muted-foreground">
                      Cryptographically verified credentials ensuring absolute precision and quality for every engagement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3: Real-time Telemetry */}
            <Card className="border-border/60">
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Real-time Telemetry</h3>
                    <p className="text-muted-foreground">
                      Continuous stream of diagnostic data and progress tracking via our hyper-responsive dashboard.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* System Architecture Section */}
      <section id="intelligence" className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-12">
            <div className="text-center space-y-4">
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                System Architecture
              </p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Module: Discovery
              </h2>
              <p className="text-muted-foreground md:text-lg">Precision Filtering</p>
            </div>

            {/* Proximity Radar Card */}
            <Card className="w-full max-w-2xl border-border/60">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                    <Radar className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">Proximity Radar</h3>
                    <p className="text-muted-foreground">
                      Visualize active nodes within your immediate perimeter. Spatial awareness technology for optimal service matching.
                    </p>
                  </div>
                </div>

                {/* Radar Visualization Placeholder */}
                <div className="mt-8 aspect-video rounded-lg border border-dashed border-border bg-muted/50 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Radar className="h-12 w-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">Radar visualization active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 border-y border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-4xl font-bold">142+</span>
              </div>
              <p className="text-muted-foreground">Specialists Online</p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
                <span className="text-4xl font-bold">99.8%</span>
              </div>
              <p className="text-muted-foreground">Resolution Rate</p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-4xl font-bold">&lt;12m</span>
              </div>
              <p className="text-muted-foreground">Avg ETA</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 hero-gradient">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Initialize Your Account
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                Join the network of optimized urban nodes. Secure your access to precision services today.
              </p>
            </div>
            <Link to="/signup/user">
              <Button size="lg" className="mt-4">
                Connect to Grid
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">UrbanFix</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2024 UrbanFix. Atmospheric Lab Precision.
              </p>
            </div>
            <Separator />
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <Link to="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="#" className="hover:text-foreground transition-colors">
                API Docs
              </Link>
              <Link to="#" className="hover:text-foreground transition-colors">
                Network Status
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
