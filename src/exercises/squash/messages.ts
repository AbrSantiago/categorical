import { defineMessages, type Fmt } from "../../core/i18n";
import { decodeSet, formulaTex, setTex } from "../../functions";
import { specFrom, texNum } from "../../functions/messages";

type V = Record<string, string | number>;
const f = (v: V, fmt: Fmt) => formulaTex(specFrom(v), texNum(fmt));
const set = (v: { set: string }, fmt: Fmt) => setTex(decodeSet(v.set), texNum(fmt));

export const squashMessages = defineMessages(
  {
    "squash.prompt.y": (v: V, fmt: Fmt) => `Aplastá $f(x)=${f(v, fmt)}$ contra el eje $y$ y marcá su imagen.`,
    "squash.prompt.x": (v: V, fmt: Fmt) => `Aplastá $f(x)=${f(v, fmt)}$ contra el eje $x$ y marcá su dominio.`,
    "squash.right": "¡Exacto!",
    "squash.wrong": "No es ese conjunto",
    "squash.yours": (v: { set: string }, fmt: Fmt) => `Marcaste $${set(v, fmt)}$.`,
    "squash.truth.y": (v: { set: string }, fmt: Fmt) => `La imagen es $\\operatorname{Im} f=${set(v, fmt)}$.`,
    "squash.truth.x": (v: { set: string }, fmt: Fmt) => `El dominio es $\\operatorname{Dom} f=${set(v, fmt)}$.`,
    "squash.slider": "aplastar",
    "squash.notation.y": "Tu imagen",
    "squash.notation.x": "Tu dominio",
    "squash.lo": "Extremo izquierdo",
    "squash.hi": "Extremo derecho",
    "squash.hole": "Punto excluido",
    "squash.addHole": "Excluir un punto",
    "squash.removeHole": "Sacar el hueco",
    "squash.line": "Recta para marcar el conjunto",
    "squash.toggle": "Arrastrá los extremos. Tocalos para incluirlos o no.",
  },
  {
    "squash.prompt.y": (v: V, fmt: Fmt) => `Squash $f(x)=${f(v, fmt)}$ onto the $y$ axis and mark its range.`,
    "squash.prompt.x": (v: V, fmt: Fmt) => `Squash $f(x)=${f(v, fmt)}$ onto the $x$ axis and mark its domain.`,
    "squash.right": "Exactly!",
    "squash.wrong": "Not that set",
    "squash.yours": (v: { set: string }, fmt: Fmt) => `You marked $${set(v, fmt)}$.`,
    "squash.truth.y": (v: { set: string }, fmt: Fmt) => `The range is $\\operatorname{Im} f=${set(v, fmt)}$.`,
    "squash.truth.x": (v: { set: string }, fmt: Fmt) => `The domain is $\\operatorname{Dom} f=${set(v, fmt)}$.`,
    "squash.slider": "squash",
    "squash.notation.y": "Your range",
    "squash.notation.x": "Your domain",
    "squash.lo": "Left end",
    "squash.hi": "Right end",
    "squash.hole": "Excluded point",
    "squash.addHole": "Exclude a point",
    "squash.removeHole": "Remove the hole",
    "squash.line": "Number line to mark the set",
    "squash.toggle": "Drag the ends. Tap them to include them or not.",
  },
);
