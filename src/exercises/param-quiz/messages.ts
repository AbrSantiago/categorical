import { defineMessages, type Fmt } from "../../core/i18n";
import { getDist } from "../../distributions";
import { texCall } from "../../distributions/messages";

type D = { dist: string };
type K = D & { key: string };
const param = (v: K) => getDist(v.dist).params.find((p) => p.key === v.key)!;
const symbolic = (id: string, f: Fmt) => `$${texCall(f.locale, f, id)}$`;
const meanTex = (id: string) => getDist(id).mean!.right;

const paramList = (id: string, lang: "es" | "en") =>
  getDist(id)
    .params.map((p) => `$${p.tex}$ (${p.role[lang]})`)
    .join(lang === "es" ? "; " : "; ");

export const paramQuizMessages = defineMessages(
  {
    "quiz.prompt.params-of": (v: D) => `¿Qué parámetros definen ${getDist(v.dist).article.es}?`,
    "quiz.prompt.who-has": (v: K) => `¿Cuál de estas distribuciones tiene un parámetro $${param(v).tex}$?`,
    "quiz.prompt.meaning": (v: K, f: Fmt) => `En ${symbolic(v.dist, f)}, ¿qué representa $${param(v).tex}$?`,
    "quiz.prompt.mean": (v: D, f: Fmt) => `¿Cuánto vale la media de ${symbolic(v.dist, f)}?`,
    "quiz.signature": (v: D) => `$${getDist(v.dist).params.map((p) => p.tex).join(",\\ ")}$`,
    "quiz.noMean": "No tiene media",
    "quiz.right": "¡Correcto!",
    "quiz.wrong": "No era esa",
    "quiz.explain.params": (v: D) => `La ${getDist(v.dist).name.es} usa ${paramList(v.dist, "es")}.`,
    "quiz.explain.who": (v: K) =>
      `La ${getDist(v.dist).name.es} usa $${param(v).tex}$ como «${param(v).role.es}».`,
    "quiz.explain.meaning": (v: K) =>
      `En ${getDist(v.dist).article.es}, $${param(v).tex}$ significa «${param(v).role.es}». Al aumentarlo, ${param(v).effect.es}.`,
    "quiz.explain.other": (v: K) =>
      `Lo que elegiste corresponde a $${param(v).tex}$ en ${getDist(v.dist).article.es}.`,
    "quiz.explain.mean": (v: D) =>
      meanTex(v.dist) === "NONE"
        ? `La ${getDist(v.dist).name.es} no tiene media: sus colas son tan pesadas que el promedio no converge.`
        : `La media de ${getDist(v.dist).article.es} es $${meanTex(v.dist)}$.`,
    "quiz.choices": "Opciones",
  },
  {
    "quiz.prompt.params-of": (v: D) => `Which parameters define ${getDist(v.dist).article.en}?`,
    "quiz.prompt.who-has": (v: K) => `Which of these distributions has a parameter $${param(v).tex}$?`,
    "quiz.prompt.meaning": (v: K, f: Fmt) => `In ${symbolic(v.dist, f)}, what does $${param(v).tex}$ represent?`,
    "quiz.prompt.mean": (v: D, f: Fmt) => `What is the mean of ${symbolic(v.dist, f)}?`,
    "quiz.signature": (v: D) => `$${getDist(v.dist).params.map((p) => p.tex).join(",\\ ")}$`,
    "quiz.noMean": "It has no mean",
    "quiz.right": "Correct!",
    "quiz.wrong": "Not that one",
    "quiz.explain.params": (v: D) => `The ${getDist(v.dist).name.en} uses ${paramList(v.dist, "en")}.`,
    "quiz.explain.who": (v: K) => `The ${getDist(v.dist).name.en} uses $${param(v).tex}$ as its ${param(v).role.en}.`,
    "quiz.explain.meaning": (v: K) =>
      `In ${getDist(v.dist).article.en}, $${param(v).tex}$ is the ${param(v).role.en}. Increasing it ${param(v).effect.en}.`,
    "quiz.explain.other": (v: K) => `What you picked belongs to $${param(v).tex}$ in ${getDist(v.dist).article.en}.`,
    "quiz.explain.mean": (v: D) =>
      meanTex(v.dist) === "NONE"
        ? `The ${getDist(v.dist).name.en} has no mean: its tails are so heavy that the average never converges.`
        : `The mean of ${getDist(v.dist).article.en} is $${meanTex(v.dist)}$.`,
    "quiz.choices": "Options",
  },
);
