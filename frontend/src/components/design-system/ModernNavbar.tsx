import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HandHeart } from "lucide-react";
import { GradientButton } from "./GradientButton";

type ModernNavbarProps = {
  isAuthenticated?: boolean;
  onLogout?: () => void;
};

export function ModernNavbar({ isAuthenticated, onLogout }: ModernNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 right-0 top-0 z-50 px-4 py-4 sm:px-6"
    >
      <div className="mx-auto max-w-5xl">
        <div className="relative flex items-center justify-between">
          <motion.div
            className="absolute inset-0 -z-10 rounded-full bg-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl"
            initial={false}
            animate={{
              opacity: scrolled ? 1 : 0,
              scale: scrolled ? 1 : 0.95,
            }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              border: scrolled ? "1px solid rgba(255, 255, 255, 0.4)" : "none",
            }}
          />

          <motion.div
            className="pointer-events-none absolute inset-0 -z-20 rounded-full"
            initial={false}
            animate={{ opacity: scrolled ? 0.4 : 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              background:
                "linear-gradient(90deg, rgba(59,130,246,0.1) 0%, rgba(96,165,250,0.15) 50%, rgba(59,130,246,0.1) 100%)",
              filter: "blur(8px)",
            }}
          />

          <div className="relative z-10 flex w-full items-center justify-between px-6 py-3">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-lg font-semibold tracking-tight text-zinc-900 transition-opacity duration-300 hover:opacity-80"
            >
              <motion.div
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25"
                animate={{ scale: scrolled ? 0.9 : 1 }}
                transition={{ duration: 0.4 }}
              >
                <HandHeart className="h-4 w-4 text-white" fill="none" />
              </motion.div>
              <span className="hidden sm:inline">UrbanFix</span>
            </Link>

            <div className="flex items-center" style={{ gap: "12px" }}>
              {isAuthenticated ? (
                <button
                  onClick={onLogout}
                  className="text-sm font-medium text-zinc-600 transition-colors duration-300 hover:text-blue-600"
                >
                  Log out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-zinc-600 transition-colors duration-300 hover:text-blue-600"
                  >
                    Log in
                  </Link>
                  <motion.div
                    animate={{ scale: scrolled ? 0.9 : 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <GradientButton to="/signup/user" size="sm" showSparkles={false}>
                      Get Started
                    </GradientButton>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
