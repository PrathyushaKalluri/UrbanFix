import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";

type GradientButtonProps = {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  showSparkles?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
};

export function GradientButton({
  children,
  to,
  onClick,
  size = "md",
  className = "",
  showSparkles = true,
  disabled = false,
  type = "button",
}: GradientButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const sizeClasses = {
    sm: "h-10 px-5 text-sm",
    md: "h-12 px-6 text-sm",
    lg: "h-14 px-8 text-base",
  };

  const glowSize = {
    sm: "blur-xl -inset-1 rounded-xl",
    md: "blur-xl -inset-1 rounded-xl",
    lg: "blur-2xl -inset-2 rounded-2xl",
  };

  const spotlightSize = {
    sm: "120px",
    md: "120px",
    lg: "180px",
  };

  const ButtonContent = (
    <motion.div
      ref={buttonRef}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className="relative"
    >
      <motion.div
        className={`absolute ${glowSize[size]}`}
        style={{ background: "oklch(65% 0.2 255 / 0.4)" }}
        initial={{ opacity: 0 }}
        animate={isHovered && !disabled ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />

      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`relative overflow-hidden rounded-xl border border-blue-300/30 bg-gradient-to-b from-blue-400 to-blue-500 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-blue-300 hover:to-blue-400 hover:shadow-blue-400/30 disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses[size]} ${className}`}
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(${spotlightSize[size]} circle at ${mousePos.x}px ${mousePos.y}px, rgba(191,219,254,0.5), transparent 50%)`,
          }}
        />

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

        <span className="relative z-10 flex items-center gap-1.5">
          {children}
          <motion.span
            animate={isHovered && !disabled ? { x: [0, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <ArrowRight className="h-4 w-4" />
          </motion.span>
        </span>
      </button>

      <AnimatePresence>
        {showSparkles && isHovered && !disabled && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                  x: [0, (i - 1) * 15],
                  y: [0, -15 - i * 4],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.12,
                  ease: "easeOut",
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                <Star className="h-2.5 w-2.5 fill-blue-200 text-blue-200" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (to) {
    return <Link to={to} className="relative group">{ButtonContent}</Link>;
  }

  return ButtonContent;
}
