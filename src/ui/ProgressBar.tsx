import { motion } from "motion/react";

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
    >
      <motion.div className="progress-fill" animate={{ width: `${value * 100}%` }} transition={{ type: "spring", stiffness: 140, damping: 22 }} />
    </div>
  );
}
