import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeInUp, hoverLift } from "@/lib/animations";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
};

export function GlassCard({
  children,
  className = "",
  delay = 0,
  hover = true,
}: GlassCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={hover ? hoverLift : undefined}
      className={`group relative overflow-hidden rounded-2xl border border-white/50 bg-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-transparent" />
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
