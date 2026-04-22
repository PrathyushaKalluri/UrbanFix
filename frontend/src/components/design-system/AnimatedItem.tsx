import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

type AnimatedItemProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function AnimatedItem({ children, className = "", delay = 0 }: AnimatedItemProps) {
  return (
    <motion.div variants={fadeInUp} transition={{ delay }} className={className}>
      {children}
    </motion.div>
  );
}
