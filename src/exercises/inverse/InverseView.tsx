import { useState } from "react";
import type { ExerciseViewProps } from "../../core/exercise";
import { formulaTex, inverseTex, type FnSpec } from "../../functions";
import { texNum } from "../../functions/messages";
import { useI18n } from "../../settings/SettingsContext";
import { ChoiceGrid } from "../../ui/ChoiceGrid";
import { RichText } from "../../ui/Math";
import { FnPlot, type PlotScales } from "../../ui/plot/FnPlot";
import { mirror } from "../../ui/plot/geometry";
import { Dot, FnCurve } from "../../ui/plot/marks";
import { Slider } from "../../ui/Slider";
import { useTween } from "../../ui/useTween";
import { MIRRORS, type FormulaOption, type InverseParams } from "./logic";

const LETTERS = ["A", "B", "C", "D"];

function Diagonal({ s }: { s: PlotScales }) {
  return <line className="fn-diagonal" x1={s.x(-7)} y1={s.y(-7)} x2={s.x(7)} y2={s.y(7)} clipPath={s.clip} />;
}

function optionTex(spec: FnSpec, option: FormulaOption, num: (v: number) => string): string {
  switch (option) {
    case "inverse":
      return inverseTex(spec, num);
    case "flipped":
      return inverseTex({ ...spec, h: -spec.h, k: -spec.k }, num);
    case "recip":
      return `\\frac{1}{${formulaTex(spec, num)}}`;
    case "neg":
      return formulaTex({ ...spec, a: -spec.a, k: -spec.k }, num);
  }
}

export function InverseView({ params, answer, onAnswer, feedback }: ExerciseViewProps<InverseParams, number>) {
  const { t, fmt } = useI18n();
  const revealed = feedback !== null;
  // The slider's value belongs to a phase: after checking, the graph flips
  // over y = x on its own (until the slider is touched again).
  const [manual, setManualState] = useState<{ v: number; revealed: boolean } | null>(null);
  const setManual = (v: number) => setManualState({ v, revealed });
  const mirrorT = manual && manual.revealed === revealed ? manual.v : revealed ? 1 : 0;
  const tween = useTween(mirrorT, 1100);
  const showSlider = params.variant !== "graph" || revealed;
  const num = texNum(fmt);
  const spec = params.spec;
  // Vertical line through two mirrored points: x = f(h ± 1) = a + k.
  const vx = spec.a + spec.k;

  return (
    <div className="exercise inverse">
      <div className="chart-card plot-card">
        <FnPlot label={t("fn.chart")}>
          {(s) => (
            <>
              <Diagonal s={s} />
              {tween > 0 && <FnCurve spec={spec} s={s} className="fn-ghost" dots={false} />}
              <FnCurve spec={spec} s={s} m={mirror(tween)} far={60} className={tween > 0.5 ? "fn-user" : "fn-truth"} />
              {params.variant === "restrict" && tween > 0.98 && (
                <g className="fn-vtest">
                  <line x1={s.x(vx)} x2={s.x(vx)} y1={s.plot.top} y2={s.plot.bottom} />
                  <Dot x={vx} y={spec.h - 1} s={s} className="fn-hit" />
                  <Dot x={vx} y={spec.h + 1} s={s} className="fn-hit" />
                </g>
              )}
            </>
          )}
        </FnPlot>
        {showSlider && (
          <Slider
            symbol="t"
            name={t("inv.slider")}
            value={mirrorT}
            min={0}
            max={1}
            step={0.01}
            display={`${Math.round(mirrorT * 100)}%`}
            onChange={setManual}
          />
        )}
        {params.variant === "restrict" && tween > 0.98 && <p className="hint">
            <RichText text={t("inv.vertical")} />
          </p>}
      </div>

      {params.variant === "graph" && (
        <div className="curve-options plot-options" role="radiogroup" aria-label={t("inv.choices")}>
          {params.options.map((m, i) => {
            const right = m === "diagonal";
            const state = !revealed ? (answer === i ? "selected" : "") : right ? "right" : answer === i ? "wrong" : "dim";
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={answer === i}
                aria-label={t("inv.option", { n: i + 1 })}
                className={`curve-option ${state}`}
                disabled={revealed}
                onClick={() => onAnswer(i)}
              >
                <span className="curve-option-letter" aria-hidden="true">
                  {LETTERS[i]}
                </span>
                <FnPlot compact label={t("inv.option", { n: i + 1 })}>
                  {(s) => (
                    <>
                      <Diagonal s={s} />
                      <FnCurve spec={spec} s={s} m={MIRRORS[m]} far={60} className="fn-neutral" />
                    </>
                  )}
                </FnPlot>
              </button>
            );
          })}
        </div>
      )}

      {params.variant === "formula" && (
        <ChoiceGrid
          label={t("inv.choices")}
          options={params.options.map((o, i) => ({ value: String(i), label: `$f^{-1}(x)=${optionTex(spec, o, num)}$` }))}
          answer={answer === null ? null : String(answer)}
          correct={revealed ? String(params.options.indexOf("inverse")) : null}
          onAnswer={(v) => onAnswer(Number(v))}
          stacked
        />
      )}

      {params.variant === "restrict" && (
        <ChoiceGrid
          stacked
          label={t("inv.choices")}
          options={params.options.map((o, i) => ({
            value: String(i),
            label: t(`inv.opt.${o}`, { h: spec.h, side: params.side }),
          }))}
          answer={answer === null ? null : String(answer)}
          correct={revealed ? String(params.options.indexOf("domain")) : null}
          onAnswer={(v) => onAnswer(Number(v))}
        />
      )}
    </div>
  );
}
