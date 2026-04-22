import { Link } from "react-router-dom";
import { HandHeart } from "lucide-react";

type SiteFooterProps = {
  className?: string;
};

const productLinks = [
  "Features",
  "Integrations",
  "Pricing",
  "Changelog",
  "Roadmap",
];

const resourceLinks = [
  "Documentation",
  "API Reference",
  "Guides",
  "Community",
  "Support",
];

const companyLinks = ["About", "Blog", "Careers", "Press", "Contact"];

const policyLinks = ["Privacy", "Terms", "Cookies", "Security"];

export function SiteFooter({ className = "" }: SiteFooterProps) {
  return (
    <footer
      className={`border-t border-zinc-200/50 bg-zinc-50/50 px-6 py-16 backdrop-blur-sm ${className}`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-4 lg:grid-cols-5">
          <div className="md:col-span-2 lg:col-span-2">
            <Link
              to="/"
              className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
                <HandHeart className="h-4 w-4 text-white" fill="none" />
              </div>
              <span>UrbanFix</span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-zinc-500">
              High-precision service routing and intelligent telemetry for the
              modern metropolis.
            </p>
            <div className="flex w-fit items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/50 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                All Systems Operational
              </span>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 transition-colors hover:text-blue-600"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Resources
            </h4>
            <ul className="space-y-3">
              {resourceLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 transition-colors hover:text-blue-600"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-zinc-500 transition-colors hover:text-blue-600"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200/50 pt-8 md:flex-row">
          <p className="text-sm text-zinc-400">
            &copy; {new Date().getFullYear()} UrbanFix. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {policyLinks.map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm text-zinc-400 transition-colors hover:text-blue-600"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
