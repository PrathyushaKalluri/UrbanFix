import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/lib/animations";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  delay?: number;
};

export function AnimatedSection({
  children,
  className = "",
  stagger = true,
  delay = 0,
}: AnimatedSectionProps) {
  return (
    <motion.div
      variants={stagger ? staggerContainer : fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
