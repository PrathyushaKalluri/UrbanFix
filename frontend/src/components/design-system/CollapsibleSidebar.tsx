import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HandHeart,
  Search,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string;
};

type CollapsibleSidebarProps = {
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
};

const navItems: NavItem[] = [
  { label: "Find Experts", icon: Search, href: "/dashboard" },
  { label: "Messages", icon: MessageSquare, href: "/messages/1" },
  { label: "Settings", icon: Settings, href: "/profile" },
];

function SidebarContent({
  userName,
  userRole,
  onLogout,
  isMobile = false,
  onNavigate,
}: {
  userName: string;
  userRole: string;
  onLogout?: () => void;
  isMobile?: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  return (
    <div className={`flex h-full flex-col ${isMobile ? "" : "w-[240px]"}`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
          <HandHeart className="h-4 w-4 text-white" fill="none" />
        </div>
        <span className="text-base font-semibold tracking-tight text-zinc-900">
          UrbanFix
        </span>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-zinc-200/40" />

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <Link
                  to={item.href}
                  onClick={onNavigate}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-zinc-100/80 text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-50/60 hover:text-zinc-700"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                      isActive
                        ? "text-zinc-700"
                        : "text-zinc-400 group-hover:text-zinc-500"
                    }`}
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: User Info + Logout */}
      <div className="border-t border-zinc-200/40 px-3 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-zinc-50/60 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-[11px] font-semibold text-white shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-zinc-900">
              {userName}
            </p>
            <p className="truncate text-[11px] text-zinc-500">{userRole}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="group mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 transition-all hover:bg-rose-50/60 hover:text-rose-600"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0 transition-colors group-hover:text-rose-500" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}

export function CollapsibleSidebar({
  userName = "User",
  userRole = "Resident",
  onLogout,
}: CollapsibleSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar — always visible, non-collapsible */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-white/40 bg-white/70 shadow-[4px_0_32px_rgba(0,0,0,0.04)] backdrop-blur-2xl md:flex"
      >
        <SidebarContent
          userName={userName}
          userRole={userRole}
          onLogout={onLogout}
        />
      </motion.aside>

      {/* Mobile hamburger trigger + Sheet */}
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/60 bg-white/80 text-zinc-600 shadow-sm backdrop-blur-xl transition-all hover:border-zinc-300 hover:text-zinc-900"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] border-r border-white/40 bg-white/90 p-0 backdrop-blur-2xl">
            <SidebarContent
              userName={userName}
              userRole={userRole}
              onLogout={() => {
                setMobileOpen(false);
                onLogout?.();
              }}
              isMobile
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
