import { useState } from "react";
import type { ExerciseViewProps } from "../../core/exercise";
import { setTex } from "../../functions";
import { texNum } from "../../functions/messages";
import { useI18n } from "../../settings/SettingsContext";
import { Tex } from "../../ui/Math";
import { FnPlot } from "../../ui/plot/FnPlot";
import { squashX, squashY } from "../../ui/plot/geometry";
import { INITIAL_LINE, lineToSet, type LineAnswer } from "../../ui/plot/lineAnswer";
import { FnCurve, SetOnAxis } from "../../ui/plot/marks";
import { NumberLine } from "../../ui/plot/NumberLine";
import { Slider } from "../../ui/Slider";
import { exactSet, type SquashParams } from "./logic";

export function SquashView({ params, answer, onAnswer, feedback }: ExerciseViewProps<SquashParams, LineAnswer>) {
  const { t, fmt } = useI18n();
  const [squash, setSquash] = useState(0);
  const revealed = feedback !== null;
  const value = answer ?? INITIAL_LINE;
  const m = params.axis === "y" ? squashX(squash) : squashY(squash);
  const shadow = Math.max(0, (squash - 0.55) / 0.45);
  const sym = params.axis === "y" ? "\\operatorname{Im} f" : "\\operatorname{Dom} f";
  // Squashing far-away parts of the graph matters: sample far beyond the window.
  return (
    <div className="exercise squash">
      <div className="chart-card plot-card">
        <FnPlot label={t("fn.chart")}>
          {(s) => (
            <>
              <FnCurve spec={params.spec} s={s} m={m} far={1e4} asymptotes={squash === 0} className="fn-truth" opacity={Math.max(0.12, 1 - Math.max(0, squash - 0.75) * 3.5)} />
              {(shadow > 0 || revealed) && (
                <SetOnAxis
                  set={exactSet(params)}
                  axis={params.axis}
                  s={s}
                  opacity={revealed ? 1 : shadow}
                  markers={params.markers || revealed}
                />
              )}
            </>
          )}
        </FnPlot>
        <Slider
          symbol="t"
          name={t("squash.slider")}
          value={squash}
          min={0}
          max={1}
          step={0.01}
          display={`${Math.round(squash * 100)}%`}
          onChange={setSquash}
        />
      </div>
      <div className="answer-card">
        <NumberLine
          value={value}
          onChange={onAnswer}
          disabled={revealed}
          axisName={params.axis}
          labels={{
            lo: t("squash.lo"),
            hi: t("squash.hi"),
            hole: t("squash.hole"),
            addHole: t("squash.addHole"),
            removeHole: t("squash.removeHole"),
            line: t("squash.line"),
            toggle: t("squash.toggle"),
          }}
        />
        <p className="formula-live" aria-live="polite">
          <span className="formula-live-label">{t(`squash.notation.${params.axis}`)}:</span>{" "}
          <Tex>{`${sym}=${setTex(lineToSet(value), texNum(fmt))}`}</Tex>
        </p>
      </div>
    </div>
  );
}
