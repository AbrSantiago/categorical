import type { ExerciseViewProps } from "../../core/exercise";
import { useI18n } from "../../settings/SettingsContext";
import { ChoiceGrid } from "../../ui/ChoiceGrid";
import type { ParamQuizParams } from "./logic";

export function ParamQuizView({ params, answer, onAnswer, feedback }: ExerciseViewProps<ParamQuizParams, string>) {
  const { t } = useI18n();
  const label = (value: string): string => {
    switch (params.variant) {
      case "params-of":
        return t("quiz.signature", { dist: value });
      case "who-has":
        return t(`dist.${value}.name`);
      case "meaning": {
        const [dist, key] = value.split("|");
        return t(`dist.${dist}.param.${key}.role`);
      }
      case "mean":
        return value === "NONE" ? t("quiz.noMean") : `$${value}$`;
    }
  };
  return (
    <div className="exercise param-quiz">
      <ChoiceGrid
        label={t("quiz.choices")}
        stacked={params.variant === "meaning"}
        options={params.options.map((value) => ({ value, label: label(value) }))}
        answer={answer}
        correct={feedback ? params.answer : null}
        onAnswer={onAnswer}
      />
    </div>
  );
}
