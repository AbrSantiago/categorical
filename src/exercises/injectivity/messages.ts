import { defineMessages, type Fmt } from "../../core/i18n";
import { decodeSet, domainOf, formulaTex, setTex } from "../../functions";
import { specFrom, texNum } from "../../functions/messages";

type V = Record<string, string | number>;
const set = (text: string | number, fmt: Fmt) => setTex(decodeSet(String(text)), texNum(fmt));
const head = (v: V, fmt: Fmt) => {
  const s = specFrom(v);
  return `$f\\colon ${setTex(domainOf(s), texNum(fmt))}\\to ${set(v.codomain, fmt)}$, $f(x)=${formulaTex(s, texNum(fmt))}$`;
};
const KIND_ES: Record<string, string> = {
  bijective: "Biyectiva (inyectiva y sobreyectiva)",
  injective: "Inyectiva, pero no sobreyectiva",
  surjective: "Sobreyectiva, pero no inyectiva",
  neither: "Ni inyectiva ni sobreyectiva",
};
const KIND_EN: Record<string, string> = {
  bijective: "Bijective (injective and surjective)",
  injective: "Injective, but not surjective",
  surjective: "Surjective, but not injective",
  neither: "Neither injective nor surjective",
};

export const injectivityMessages = defineMessages(
  {
    "inj.prompt": (v: V, fmt: Fmt) => `¿Cómo es ${head(v, fmt)}?`,
    "inj.kind": (v: { kind: string }) => KIND_ES[v.kind],
    "inj.right": "¡Bien clasificada!",
    "inj.wrong": (v: { kind: string }) => `Era: ${KIND_ES[v.kind].toLowerCase()}`,
    "inj.yes": "**Inyectiva**: cualquier recta horizontal la corta a lo sumo una vez. Cada $y$ viene de un solo $x$.",
    "inj.no": (v: V) => `**No es inyectiva**: la recta $y=${v.c}$ la corta dos veces, en $x=${v.x1}$ y en $x=${v.x2}$. Al aplastar, ahí la pintura queda doble.`,
    "inj.sur": (v: { image: string }, fmt: Fmt) => `**Sobreyectiva**: la imagen, $${set(v.image, fmt)}$, cubre todo el codominio.`,
    "inj.notSur": (v: { image: string; codomain: string }, fmt: Fmt) =>
      `**No es sobreyectiva**: la imagen es $${set(v.image, fmt)}$ y no llega a cubrir todo el codominio $${set(v.codomain, fmt)}$.`,
    "inj.choices": "Clasificación",
    "inj.line": (v: { n: number }) => (v.n === 0 ? "no la corta" : v.n === 1 ? "1 corte" : `${v.n} cortes`),
    "inj.lineHelp": "Arrastrá sobre el gráfico para mover la recta horizontal.",
    "inj.codomain": "codominio",
    "inj.paint": "pintado",
  },
  {
    "inj.prompt": (v: V, fmt: Fmt) => `What is ${head(v, fmt)}?`,
    "inj.kind": (v: { kind: string }) => KIND_EN[v.kind],
    "inj.right": "Well classified!",
    "inj.wrong": (v: { kind: string }) => `It was: ${KIND_EN[v.kind].toLowerCase()}`,
    "inj.yes": "**Injective**: every horizontal line meets it at most once. Each $y$ comes from a single $x$.",
    "inj.no": (v: V) => `**Not injective**: the line $y=${v.c}$ meets it twice, at $x=${v.x1}$ and at $x=${v.x2}$. When squashed, the paint there is doubled.`,
    "inj.sur": (v: { image: string }, fmt: Fmt) => `**Surjective**: the range, $${set(v.image, fmt)}$, covers the whole codomain.`,
    "inj.notSur": (v: { image: string; codomain: string }, fmt: Fmt) =>
      `**Not surjective**: the range is $${set(v.image, fmt)}$, which doesn't cover the whole codomain $${set(v.codomain, fmt)}$.`,
    "inj.choices": "Classification",
    "inj.line": (v: { n: number }) => (v.n === 0 ? "no hits" : v.n === 1 ? "1 hit" : `${v.n} hits`),
    "inj.lineHelp": "Drag on the graph to move the horizontal line.",
    "inj.codomain": "codomain",
    "inj.paint": "painted",
  },
);
