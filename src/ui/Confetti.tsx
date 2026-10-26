import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { Rng } from "../core/random";

const COLORS = ["var(--tabby)", "var(--pen)", "var(--good)", "var(--highlight)"];

/** One celebratory burst. Renders nothing when the user prefers reduced motion. */
export function Confetti({ pieces = 40, seed = 7 }: { pieces?: number; seed?: number }) {
  const reduced = useReducedMotion();
  const bits = useMemo(
    () => {
      const rng = new Rng(seed);
      return Array.from({ length: pieces }, (_, i) => ({
        id: i,
        x: rng.uniform(-260, 260),
        y: rng.uniform(-380, -160),
        rotate: rng.uniform(-360, 360),
        delay: rng.uniform(0, 0.15),
        color: COLORS[i % COLORS.length],
        w: rng.uniform(6, 12),
        round: i % 3 === 0,
      }));
    },
    [pieces, seed],
  );
  if (reduced) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b) => (
        <motion.span
          key={b.id}
          style={{ background: b.color, width: b.w, height: b.round ? b.w : b.w * 0.45, borderRadius: b.round ? "50%" : 2 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 420], opacity: [1, 1, 0], rotate: b.rotate }}
          transition={{ duration: 1.8, delay: b.delay, ease: "easeOut", times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  );
}
