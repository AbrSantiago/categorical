import { useState } from "react";
import type { ExerciseViewProps } from "../../core/exercise";
import { useI18n } from "../../settings/SettingsContext";
import { RichText } from "../../ui/Math";
import type { MatchAnswer, MatchPairsParams } from "./logic";

export function MatchPairsView({ params, answer, onAnswer, feedback }: ExerciseViewProps<MatchPairsParams, MatchAnswer>) {
  const { t } = useI18n();
  const pairs = answer ?? params.items.map(() => -1);
  const [leftSel, setLeftSel] = useState<number | null>(null);
  const [rightSel, setRightSel] = useState<number | null>(null);
  const revealed = feedback !== null;

  const leftOf = (j: number) => pairs.indexOf(j);
  const commit = (i: number, j: number) => {
    const next = pairs.map((v) => (v === j ? -1 : v));
    next[i] = j;
    onAnswer(next);
    setLeftSel(null);
    setRightSel(null);
  };

  const tapLeft = (i: number) => {
    if (pairs[i] >= 0) {
      onAnswer(pairs.map((v, k) => (k === i ? -1 : v)));
      return;
    }
    if (rightSel !== null) commit(i, rightSel);
    else setLeftSel(leftSel === i ? null : i);
  };

  const tapRight = (j: number) => {
    const owner = leftOf(j);
    if (owner >= 0) {
      onAnswer(pairs.map((v, k) => (k === owner ? -1 : v)));
      return;
    }
    if (leftSel !== null) commit(leftSel, j);
    else setRightSel(rightSel === j ? null : j);
  };

  const status = (i: number) => (!revealed ? "" : params.right[pairs[i]] === i ? "right" : "wrong");

  return (
    <div className="exercise match-pairs">
      <div className="match-columns">
        <div className="match-col" role="group" aria-label={t("match.params")}>
          {params.items.map((item, i) => {
            const paired = pairs[i] >= 0;
            return (
              <button
                key={`l${i}`}
                type="button"
                className={`match-item ${leftSel === i ? "selected" : ""} ${paired ? `paired pair-${i}` : ""} ${status(i)}`}
                aria-pressed={leftSel === i || paired}
                disabled={revealed}
                onClick={() => tapLeft(i)}
              >
                {paired && <span className="pair-badge">{i + 1}</span>}
                <RichText text={t({ id: "match.left", values: { dist: item.dist, key: item.key } })} />
              </button>
            );
          })}
        </div>
        <div className="match-col" role="group" aria-label={t("match.meanings")}>
          {params.right.map((itemIndex, j) => {
            const owner = leftOf(j);
            const item = params.items[itemIndex];
            return (
              <button
                key={`r${j}`}
                type="button"
                className={`match-item meaning ${rightSel === j ? "selected" : ""} ${owner >= 0 ? `paired pair-${owner}` : ""} ${owner >= 0 ? status(owner) : ""}`}
                aria-pressed={rightSel === j || owner >= 0}
                disabled={revealed}
                onClick={() => tapRight(j)}
              >
                {owner >= 0 && <span className="pair-badge">{owner + 1}</span>}
                <RichText text={t({ id: "match.role", values: { dist: item.dist, key: item.key } })} />
              </button>
            );
          })}
        </div>
      </div>
      <p className="hint">{revealed ? " " : t("match.hint")}</p>
    </div>
  );
}
