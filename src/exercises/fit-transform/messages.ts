import { defineMessages, type Fmt } from "../../core/i18n";
import { formulaTex } from "../../functions";
import { specFrom, texNum } from "../../functions/messages";

type V = Record<string, string | number>;
const f = (v: V, fmt: Fmt) => formulaTex(specFrom(v), texNum(fmt));
const PARENT: Record<string, string> = {
  quadratic: "x^2",
  cubic: "x^3",
  sqrt: "\\sqrt{x}",
  abs: "\\lvert x\\rvert",
  rational: "\\frac{1}{x}",
  exponential: "2^{x}",
  log: "\\ln(x)",
};

export const fitTransformMessages = defineMessages(
  {
    "fitFn.prompt": (v: { family: string }) => `Mové $g(x)=${PARENT[v.family]}$ hasta tapar la curva punteada.`,
    "fitFn.right": "¡Clavada!",
    "fitFn.close": "Casi",
    "fitFn.wrong": "Todavía no",
    "fitFn.h": (v: { dir: string; by: number }) =>
      v.dir === "right"
        ? `Te falta correrla ${v.by} a la derecha: eso es **subir** $h$. En $x-h$, un $h$ positivo corre a la derecha.`
        : `Te falta correrla ${v.by} a la izquierda: eso es **bajar** $h$ (en $x-h$, un $h$ negativo queda como $x+\\ldots$).`,
    "fitFn.k": (v: { dir: string; by: number }) =>
      `Te falta ${v.dir === "up" ? "subirla" : "bajarla"} ${v.by}: eso es ${v.dir === "up" ? "subir" : "bajar"} $k$.`,
    "fitFn.flip": "Está dada vuelta: cambiá el signo de $a$.",
    "fitFn.stretch": (v: { dir: string }) =>
      v.dir === "more" ? "Le falta estirarse: agrandá $|a|$." : "Está demasiado estirada: achicá $|a|$.",
    "fitFn.zero": "Con $a=0$ todo se aplasta en una recta horizontal: ya no es la misma familia.",
    "fitFn.was": (v: V, fmt: Fmt) => `La curva era $f(x)=${f(v, fmt)}$.`,
    "fitFn.chart": "Tu curva y la curva a tapar",
    "fitFn.legend.user": "Tu curva",
    "fitFn.legend.target": "A tapar",
    "fitFn.a": "estira y da vuelta",
    "fitFn.hName": "corre a los costados",
    "fitFn.kName": "sube y baja",
  },
  {
    "fitFn.prompt": (v: { family: string }) => `Move $g(x)=${PARENT[v.family]}$ until it covers the dashed curve.`,
    "fitFn.right": "Nailed it!",
    "fitFn.close": "Almost",
    "fitFn.wrong": "Not yet",
    "fitFn.h": (v: { dir: string; by: number }) =>
      v.dir === "right"
        ? `Move it ${v.by} more to the right: that's **raising** $h$. In $x-h$, a positive $h$ moves right.`
        : `Move it ${v.by} more to the left: that's **lowering** $h$ (in $x-h$, a negative $h$ shows up as $x+\\ldots$).`,
    "fitFn.k": (v: { dir: string; by: number }) => `Move it ${v.dir} by ${v.by}: that's ${v.dir === "up" ? "raising" : "lowering"} $k$.`,
    "fitFn.flip": "It's upside down: change the sign of $a$.",
    "fitFn.stretch": (v: { dir: string }) => (v.dir === "more" ? "It needs more stretch: make $|a|$ bigger." : "It's stretched too much: make $|a|$ smaller."),
    "fitFn.zero": "With $a=0$ everything flattens into a horizontal line: not the same family anymore.",
    "fitFn.was": (v: V, fmt: Fmt) => `The curve was $f(x)=${f(v, fmt)}$.`,
    "fitFn.chart": "Your curve and the curve to cover",
    "fitFn.legend.user": "Your curve",
    "fitFn.legend.target": "To cover",
    "fitFn.a": "stretches and flips",
    "fitFn.hName": "moves sideways",
    "fitFn.kName": "moves up and down",
  },
);
