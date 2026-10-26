import type { ReactNode } from "react";
import { RichText } from "./Math";

interface ChoiceGridProps {
  label: string;
  options: { value: string; label: string; content?: ReactNode }[];
  answer: string | null;
  /** The right value, once the answer has been checked. */
  correct: string | null;
  onAnswer: (value: string) => void;
  /** One option per row (for long texts). */
  stacked?: boolean;
}

/** Multiple-choice buttons that show right/wrong after checking. */
export function ChoiceGrid({ label, options, answer, correct, onAnswer, stacked }: ChoiceGridProps) {
  const revealed = correct !== null;
  return (
    <div className={`choices${stacked ? " is-stacked" : ""}`} role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const state = !revealed
          ? answer === o.value
            ? "selected"
            : ""
          : o.value === correct
            ? "right"
            : o.value === answer
              ? "wrong"
              : "dim";
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={answer === o.value}
            className={`choice ${state}`}
            disabled={revealed}
            onClick={() => onAnswer(o.value)}
          >
            {o.content ?? <RichText text={o.label} />}
          </button>
        );
      })}
    </div>
  );
}
