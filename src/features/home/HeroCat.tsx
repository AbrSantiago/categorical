import { motion, useReducedMotion } from "motion/react";
import { normalPdf } from "../../core/stats";
import { CatHead } from "../../ui/Mascot";

const W = 360;
const H = 210;
const BASE = 188;

// A bell curve drawn in the hero's own coordinates.
const curve = Array.from({ length: 81 }, (_, i) => {
  const t = -4 + (8 * i) / 80;
  const x = 20 + ((t + 4) / 8) * (W - 40);
  const y = BASE - normalPdf(t, 0, 1) * 300;
  return [x, y] as const;
});
const line = curve.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
const peakY = BASE - normalPdf(0, 0, 1) * 300;
// Fixed "sample" ticks under the curve, like a rug plot.
const rug = [-1.9, -1.3, -1.05, -0.7, -0.45, -0.2, 0, 0.12, 0.35, 0.6, 0.8, 1.1, 1.45, 2.1];

/** The cat peeking over the top of a normal curve. */
export function HeroCat() {
  const reduced = useReducedMotion();
  return (
    <svg className="hero-art" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <motion.path
        className="hero-area"
        d={`${line} L${W - 20},${BASE} L20,${BASE} Z`}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      />
      <motion.path
        className="hero-curve"
        d={line}
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
      <line className="hero-base" x1="12" x2={W - 12} y1={BASE} y2={BASE} />
      {rug.map((t) => {
        const x = 20 + ((t + 4) / 8) * (W - 40);
        return <line key={t} className="hero-rug" x1={x} x2={x} y1={BASE + 6} y2={BASE + 16} />;
      })}
      <motion.g
        initial={reduced ? false : { y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 180, damping: 14 }}
      >
        <g transform={`translate(${W / 2 - 45}, ${peakY - 74}) scale(0.75)`}>
          <CatHead mood="idle" blink={!reduced} />
        </g>
        {/* paws resting on the curve */}
        <ellipse className="cat-fur" cx={W / 2 - 22} cy={peakY + 6} rx="11" ry="7" />
        <ellipse className="cat-fur" cx={W / 2 + 22} cy={peakY + 6} rx="11" ry="7" />
        <path className="cat-stripe thin" d={`M${W / 2 - 25} ${peakY + 2} v6 M${W / 2 - 19} ${peakY + 2} v6 M${W / 2 + 19} ${peakY + 2} v6 M${W / 2 + 25} ${peakY + 2} v6`} />
      </motion.g>
    </svg>
  );
}
