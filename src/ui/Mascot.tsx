import { motion, useReducedMotion } from "motion/react";

export type Mood = "idle" | "happy" | "sad" | "thinking";

interface MascotProps {
  mood?: Mood;
  size?: number;
  className?: string;
  /** Hide from assistive tech when purely decorative (the default). */
  title?: string;
}

/** The Categorical cat: an orange tabby drawn from simple shapes. */
export function Mascot({ mood = "idle", size = 96, className, title }: MascotProps) {
  const reduced = useReducedMotion();
  return (
    <svg
      className={["mascot", className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <CatHead mood={mood} blink={!reduced && mood === "idle"} />
    </svg>
  );
}

/** Head only, positioned in a 120×120 box. Reused by the hero illustration. */
export function CatHead({ mood, blink = false }: { mood: Mood; blink?: boolean }) {
  return (
    <g className="cat">
      {/* ears */}
      <path className="cat-fur" d="M22 52 L26 12 Q28 8 32 11 L56 34 Z" />
      <path className="cat-fur" d="M98 52 L94 12 Q92 8 88 11 L64 34 Z" />
      <path className="cat-ear" d="M30 42 L31 20 L47 35 Z" />
      <path className="cat-ear" d="M90 42 L89 20 L73 35 Z" />
      {/* head */}
      <ellipse className="cat-fur" cx="60" cy="68" rx="46" ry="40" />
      {/* tabby stripes */}
      <path className="cat-stripe" d="M60 30 V44 M50 32 L53 44 M70 32 L67 44" />
      <path className="cat-stripe" d="M15 64 H27 M16 74 H28 M105 64 H93 M104 74 H92" />
      {/* muzzle */}
      <ellipse className="cat-muzzle" cx="60" cy="86" rx="22" ry="15" />
      <Eyes mood={mood} blink={blink} />
      {/* nose and mouth */}
      <path className="cat-nose" d="M55 78 H65 L60 84 Z" />
      {mood === "sad" ? (
        <path className="cat-line" d="M52 93 Q60 87 68 93" />
      ) : (
        <path className="cat-line" d="M60 84 V88 M60 88 Q55 94 50 89 M60 88 Q65 94 70 89" />
      )}
      {mood === "happy" && <path className="cat-tongue" d="M56 91 Q60 99 64 91 Z" />}
      {/* whiskers */}
      <path className="cat-whisker" d="M36 84 L8 80 M36 89 L10 92 M84 84 L112 80 M84 89 L110 92" />
    </g>
  );
}

function Eyes({ mood, blink }: { mood: Mood; blink: boolean }) {
  if (mood === "happy") {
    return <path className="cat-line thick" d="M34 64 Q42 54 50 64 M70 64 Q78 54 86 64" />;
  }
  if (mood === "sad") {
    return (
      <>
        <path className="cat-line" d="M33 57 L48 51 M87 57 L72 51" />
        <ellipse className="cat-eye" cx="42" cy="66" rx="5" ry="6" />
        <ellipse className="cat-eye" cx="78" cy="66" rx="5" ry="6" />
      </>
    );
  }
  if (mood === "thinking") {
    return (
      <>
        <ellipse className="cat-eye" cx="43" cy="62" rx="6" ry="8" />
        <circle className="cat-glint" cx="45" cy="58" r="2" />
        <path className="cat-line thick" d="M70 64 H86" />
      </>
    );
  }
  return (
    <motion.g
      style={{ transformOrigin: "60px 64px" }}
      animate={blink ? { scaleY: [1, 1, 0.1, 1] } : undefined}
      transition={blink ? { duration: 4.5, times: [0, 0.92, 0.96, 1], repeat: Infinity } : undefined}
    >
      <ellipse className="cat-eye" cx="42" cy="64" rx="6.5" ry="8.5" />
      <ellipse className="cat-eye" cx="78" cy="64" rx="6.5" ry="8.5" />
      <circle className="cat-glint" cx="44.5" cy="60" r="2.2" />
      <circle className="cat-glint" cx="80.5" cy="60" r="2.2" />
    </motion.g>
  );
}
