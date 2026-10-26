import { defineMessages, type Fmt } from "../../core/i18n";
import { getDist, type Params } from "../../distributions";
import { texCall } from "../../distributions/messages";

type P = { dist: string; key: string; dir: "high" | "low" };
const param = (v: P) => getDist(v.dist).params.find((p) => p.key === v.key)!;
const call = (v: { id: string } & Params, f: Fmt) => {
  const { id, ...params } = v;
  return `$${texCall(f.locale, f, id, params)}$`;
};

export const fitParamsMessages = defineMessages(
  {
    "fit.prompt": (v: { dist: string }) =>
      `Mové los parámetros hasta que tu curva tape la de ${getDist(v.dist).article.es}.`,
    "fit.headline.right": "¡Encaja!",
    "fit.headline.close": "Muy cerca",
    "fit.headline.off": "Todavía no encaja",
    "fit.headline.invalid": "Esos parámetros no son válidos",
    "fit.overlap": (v: { pct: number }) => `Tu curva y la objetivo comparten el ${v.pct}% del área.`,
    "fit.param": (v: P) =>
      `$${param(v).tex}$ quedó ${v.dir === "high" ? "alto, probá bajarlo" : "bajo, probá subirlo"}. Recordá: al aumentarlo, ${param(v).effect.es}.`,
    "fit.real": (v: { id: string } & Params, f: Fmt) => `La objetivo era ${call(v, f)}.`,
    "fit.invalid.uniform": "En una uniforme, $a$ tiene que ser menor que $b$.",
    "fit.invalid.triangular": "En una triangular hace falta $a < c < b$.",
    "fit.invalid.discrete-uniform": "En una uniforme discreta, $a$ tiene que ser menor que $b$.",
    "fit.chart": "Curva ajustable sobre la objetivo",
    "fit.legend.user": "Tu curva",
    "fit.legend.target": "Objetivo",
  },
  {
    "fit.prompt": (v: { dist: string }) => `Move the parameters until your curve covers ${getDist(v.dist).article.en}.`,
    "fit.headline.right": "It fits!",
    "fit.headline.close": "Very close",
    "fit.headline.off": "Not a fit yet",
    "fit.headline.invalid": "Those parameters aren't valid",
    "fit.overlap": (v: { pct: number }) => `Your curve and the target share ${v.pct}% of their area.`,
    "fit.param": (v: P) =>
      `$${param(v).tex}$ is too ${v.dir === "high" ? "high, try lowering it" : "low, try raising it"}. Remember: increasing it ${param(v).effect.en}.`,
    "fit.real": (v: { id: string } & Params, f: Fmt) => `The target was ${call(v, f)}.`,
    "fit.invalid.uniform": "In a uniform, $a$ has to be smaller than $b$.",
    "fit.invalid.triangular": "A triangular needs $a < c < b$.",
    "fit.invalid.discrete-uniform": "In a discrete uniform, $a$ has to be smaller than $b$.",
    "fit.chart": "Adjustable curve over the target",
    "fit.legend.user": "Your curve",
    "fit.legend.target": "Target",
  },
);
