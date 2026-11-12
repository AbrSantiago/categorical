import { motion } from "motion/react";
import { useState } from "react";
import type { ExerciseViewProps } from "../../core/exercise";
import { texNum } from "../../functions/messages";
import { useI18n } from "../../settings/SettingsContext";
import { ChoiceGrid } from "../../ui/ChoiceGrid";
import { Tex } from "../../ui/Math";
import { applyOp, applyTex, productTex, X } from "./ops";
import type { CompositionOption, CompositionParams } from "./logic";

const show = (v: number, num: (v: number) => string) => (Number.isFinite(v) ? num(Math.round(v * 100) / 100) : "\\text{—}");

export function CompositionView({ params, answer, onAnswer, feedback }: ExerciseViewProps<CompositionParams, number>) {
  const { t, fmt } = useI18n();
  const num = texNum(fmt);
  const revealed = feedback !== null;
  const value = params.variant === "value";
  const [x, setX] = useState(value ? params.x0 : 1);
  const inner = applyOp(params.g, x);
  const outer = applyOp(params.f, inner);
  const hidden = value && !revealed;
  const fTex = applyTex(params.f, X, num);
  const gTex = applyTex(params.g, X, num);
  const symbolic = !value && revealed;
  const optionTex: Record<CompositionOption, string> = {
    fg: applyTex(params.f, gTex, num).tex,
    gf: applyTex(params.g, fTex, num).tex,
    product: productTex(fTex, gTex),
    sum: `${fTex.tex}+${gTex.tex}`,
  };

  return (
    <div className="exercise composition">
      <div className="machines" role="group" aria-label={t("comp.machines")}>
        <div className="machine-io">
          <span className="machine-tag">{t("comp.input")}</span>
          {value ? (
            <span className="machine-value">
              <Tex>{symbolic ? "x" : String(x)}</Tex>
            </span>
          ) : (
            <span className="stepper">
              <button type="button" aria-label={t("comp.more")} onClick={() => setX((v) => Math.min(4, v + 1))}>
                +
              </button>
              <span className="machine-value">
                <Tex>{String(x)}</Tex>
              </span>
              <button type="button" aria-label={t("comp.less")} onClick={() => setX((v) => Math.max(-3, v - 1))}>
                −
              </button>
            </span>
          )}
        </div>
        <span className="machine-arrow" aria-hidden="true" />
        <div className="machine is-g">
          <span className="machine-name">g</span>
          <Tex>{gTex.tex}</Tex>
        </div>
        <span className="machine-arrow" aria-hidden="true" />
        <motion.div key={`in-${x}-${hidden}`} className="machine-io" initial={{ opacity: 0.2, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <span className="machine-value">
            <Tex>{hidden ? "?" : show(inner, num)}</Tex>
          </span>
          {symbolic && (
            <span className="machine-symbolic">
              <Tex>{gTex.tex}</Tex>
            </span>
          )}
        </motion.div>
        <span className="machine-arrow" aria-hidden="true" />
        <div className="machine is-f">
          <span className="machine-name">f</span>
          <Tex>{fTex.tex}</Tex>
        </div>
        <span className="machine-arrow" aria-hidden="true" />
        <motion.div
          key={`out-${x}-${hidden}`}
          className="machine-io is-out"
          initial={{ opacity: 0.2, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <span className="machine-tag">{t("comp.output")}</span>
          <span className="machine-value">
            <Tex>{hidden ? "?" : show(outer, num)}</Tex>
          </span>
          {symbolic && (
            <span className="machine-symbolic">
              <Tex>{optionTex.fg}</Tex>
            </span>
          )}
        </motion.div>
      </div>

      <ChoiceGrid
        stacked={!value}
        label={t("comp.machines")}
        options={params.options.map((o, i) => ({
          value: String(i),
          label: value ? `$${num(params.values[i])}$` : `$${optionTex[o]}$`,
        }))}
        answer={answer === null ? null : String(answer)}
        correct={revealed ? String(params.options.indexOf("fg")) : null}
        onAnswer={(v) => onAnswer(Number(v))}
      />
    </div>
  );
}


