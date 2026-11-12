import { defineMessages, type Fmt } from "../../core/i18n";
import { formulaTex } from "../../functions";
import { specFrom, texNum } from "../../functions/messages";

type V = Record<string, string | number>;
const list = (xs: string | number, sep: string) => String(xs).split(";").map((x) => `$x=${x}$`).join(sep);
const g = (v: V, fmt: Fmt) => formulaTex(specFrom(v), texNum(fmt));

export const evaluateMessages = defineMessages(
  {
    "evaluate.prompt.value": (v: V, fmt: Fmt) => `Tocá el punto $(${v.x0},\\, f(${v.x0}))$ del gráfico de $f(x)=${g(v, fmt)}$.`,
    "evaluate.prompt.solve": (v: V) => `Tocá en el eje $x$ todos los $x$ donde $f(x)=${v.c}$. Si no hay ninguno, decilo.`,
    "evaluate.right": "¡Bien leído!",
    "evaluate.wrong": "No es ese",
    "evaluate.value": (v: V) => `$f(${v.x})=${v.y}$: el punto es $(${v.x},\\,${v.y})$.`,
    "evaluate.wrongX": (v: V) => `Tu punto está en $x=${v.px}$. Primero ubicá $x=${v.x}$ en el eje horizontal, después subí o bajá hasta tocar la curva.`,
    "evaluate.wrongY": (v: V) => `Bien el $x$, pero en $x=${v.x}$ la curva pasa por altura $${v.y}$: ese es $f(${v.x})$.`,
    "evaluate.solutions": (v: V) => `La recta $y=${v.c}$ corta la curva en ${list(v.xs, " y ")}.`,
    "evaluate.noSolution": (v: V) => `La recta $y=${v.c}$ no corta nunca la curva: el $${v.c}$ no está en la imagen.`,
    "evaluate.notNone": (v: V) => `Sí hay: la recta $y=${v.c}$ corta la curva ${v.n === 1 ? "una vez" : `${v.n} veces`}.`,
    "evaluate.missing": (v: V) => `Te faltó ${list(v.xs, " y ")}.`,
    "evaluate.extra": (v: V) => `En ${list(v.xs, " y ")} la curva no está a altura $${v.c}$.`,
    "evaluate.none": "No hay ninguno",
    "evaluate.chart": "Gráfico: tocá para marcar",
  },
  {
    "evaluate.prompt.value": (v: V, fmt: Fmt) => `Tap the point $(${v.x0},\\, f(${v.x0}))$ on the graph of $f(x)=${g(v, fmt)}$.`,
    "evaluate.prompt.solve": (v: V) => `Tap every $x$ on the $x$ axis where $f(x)=${v.c}$. If there are none, say so.`,
    "evaluate.right": "Well read!",
    "evaluate.wrong": "Not that one",
    "evaluate.value": (v: V) => `$f(${v.x})=${v.y}$: the point is $(${v.x},\\,${v.y})$.`,
    "evaluate.wrongX": (v: V) => `Your point is at $x=${v.px}$. First find $x=${v.x}$ on the horizontal axis, then go up or down until you hit the curve.`,
    "evaluate.wrongY": (v: V) => `Right $x$, but at $x=${v.x}$ the curve is at height $${v.y}$: that's $f(${v.x})$.`,
    "evaluate.solutions": (v: V) => `The line $y=${v.c}$ meets the curve at ${list(v.xs, " and ")}.`,
    "evaluate.noSolution": (v: V) => `The line $y=${v.c}$ never meets the curve: $${v.c}$ isn't in the range.`,
    "evaluate.notNone": (v: V) => `There are some: the line $y=${v.c}$ meets the curve ${v.n === 1 ? "once" : `${v.n} times`}.`,
    "evaluate.missing": (v: V) => `You missed ${list(v.xs, " and ")}.`,
    "evaluate.extra": (v: V) => `At ${list(v.xs, " and ")} the curve isn't at height $${v.c}$.`,
    "evaluate.none": "There are none",
    "evaluate.chart": "Graph: tap to mark",
  },
);
