import type { ExerciseViewProps } from "../../core/exercise";
import { useI18n } from "../../settings/SettingsContext";
import { ChoiceGrid } from "../../ui/ChoiceGrid";
import { RichText } from "../../ui/Math";
import { statementOf, type TrueFalseAnswer, type TrueFalseParams } from "./logic";

export function TrueFalseView({ params, answer, onAnswer, feedback }: ExerciseViewProps<TrueFalseParams, TrueFalseAnswer>) {
  const { t } = useI18n();
  return (
    <div className="exercise true-false">
      <blockquote className="statement">
        <RichText text={t(statementOf(params))} />
      </blockquote>
      <ChoiceGrid
        label={t("tf.choices")}
        options={[
          { value: "true", label: t("tf.true") },
          { value: "false", label: t("tf.false") },
        ]}
        answer={answer}
        correct={feedback ? (params.truth ? "true" : "false") : null}
        onAnswer={(v) => onAnswer(v as TrueFalseAnswer)}
      />
    </div>
  );
}
