import { motion } from "framer-motion";

export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        className="pointer-events-none absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-blue-300/20 blur-[120px]"
        animate={{
          x: [0, 50, 20, -30, 0],
          y: [0, -30, 20, 40, 0],
          scale: [1, 1.1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 20,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
      <motion.div
        className="pointer-events-none absolute right-0 top-40 h-[800px] w-[800px] rounded-full bg-blue-200/15 blur-[120px]"
        animate={{
          x: [0, -30, 20, 50, 0],
          y: [0, 20, -30, 40, 0],
          scale: [1, 1.05, 0.95, 1.1, 1],
        }}
        transition={{
          duration: 20,
          delay: 5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-200/10 blur-[120px]"
        animate={{
          x: [0, 30, -20, 40, 0],
          y: [0, -20, 30, -40, 0],
          scale: [1, 0.95, 1.05, 0.95, 1],
        }}
        transition={{
          duration: 20,
          delay: 10,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
