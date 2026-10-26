import { defineMessages, type Fmt } from "../../core/i18n";
import { getDist, type Params } from "../../distributions";
import { texCall } from "../../distributions/messages";

type K = { dist: string; key: string };
const param = (v: K) => getDist(v.dist).params.find((p) => p.key === v.key)!;
const call = (v: { id: string } & Params, f: Fmt) => {
  const { id, ...params } = v;
  return `$${texCall(f.locale, f, id, params)}$`;
};

export const pickCurveMessages = defineMessages(
  {
    "pick.prompt": (v: { id: string } & Params, f: Fmt) => `¿Cuál de estas curvas es ${call(v, f)}?`,
    "pick.headline.right": "¡Esa es!",
    "pick.headline.wrong": "Esa no era",
    "pick.chosen": (v: { id: string } & Params, f: Fmt) => `La que elegiste es ${call(v, f)}.`,
    "pick.diff": (v: K & { dir: "more" | "less" }) =>
      `Tiene ${v.dir === "more" ? "más" : "menos"} $${param(v).tex}$ que la pedida. Al aumentar $${param(v).tex}$, ${param(v).effect.es}.`,
    "pick.effect": (v: K) => `$${param(v).tex}$ (${param(v).role.es}): al aumentarlo, ${param(v).effect.es}.`,
    "pick.option": (v: { n: number }) => `Opción ${v.n}`,
    "pick.choices": "Curvas",
  },
  {
    "pick.prompt": (v: { id: string } & Params, f: Fmt) => `Which of these curves is ${call(v, f)}?`,
    "pick.headline.right": "That's the one!",
    "pick.headline.wrong": "Not that one",
    "pick.chosen": (v: { id: string } & Params, f: Fmt) => `The one you picked is ${call(v, f)}.`,
    "pick.diff": (v: K & { dir: "more" | "less" }) =>
      `It has ${v.dir === "more" ? "a larger" : "a smaller"} $${param(v).tex}$ than requested. Increasing $${param(v).tex}$ ${param(v).effect.en}.`,
    "pick.effect": (v: K) => `$${param(v).tex}$ (${param(v).role.en}): increasing it ${param(v).effect.en}.`,
    "pick.option": (v: { n: number }) => `Option ${v.n}`,
    "pick.choices": "Curves",
  },
);
