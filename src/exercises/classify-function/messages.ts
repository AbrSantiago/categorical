import { defineMessages, type Fmt } from "../../core/i18n";
import { formulaTex } from "../../functions";
import { specFrom, texNum } from "../../functions/messages";

type F = { family: string };
const NAME_ES: Record<string, string> = {
  constant: "una constante",
  linear: "una lineal",
  quadratic: "una cuadrática",
  cubic: "una cúbica",
  sqrt: "una raíz cuadrada",
  abs: "un valor absoluto",
  rational: "una racional",
  exponential: "una exponencial",
  log: "una logarítmica",
};
const NAME_EN: Record<string, string> = {
  constant: "a constant",
  linear: "a linear function",
  quadratic: "a quadratic",
  cubic: "a cubic",
  sqrt: "a square root",
  abs: "an absolute value",
  rational: "a rational function",
  exponential: "an exponential",
  log: "a logarithm",
};

export const classifyMessages = defineMessages(
  {
    "classify.prompt.graph": "¿Qué tipo de función es esta?",
    "classify.prompt.formula": (v: Record<string, string | number>, f: Fmt) =>
      `¿Qué tipo de función es $f(x)=${formulaTex(specFrom(v), texNum(f))}$?`,
    "classify.right": (v: F) => `¡Sí, es ${NAME_ES[v.family]}!`,
    "classify.wrong": (v: F) => `Era ${NAME_ES[v.family]}`,
    "classify.was": (v: F) => `Es **${NAME_ES[v.family]}**.`,
    "classify.chosen": (v: F) => `Elegiste ${NAME_ES[v.family]}, que se ve distinta: ${TRAIT_SHORT_ES[v.family]}`,
    "classify.choices": "Tipos de función",
  },
  {
    "classify.prompt.graph": "What kind of function is this?",
    "classify.prompt.formula": (v: Record<string, string | number>, f: Fmt) =>
      `What kind of function is $f(x)=${formulaTex(specFrom(v), texNum(f))}$?`,
    "classify.right": (v: F) => `Yes, it's ${NAME_EN[v.family]}!`,
    "classify.wrong": (v: F) => `It was ${NAME_EN[v.family]}`,
    "classify.was": (v: F) => `It's **${NAME_EN[v.family]}**.`,
    "classify.chosen": (v: F) => `You picked ${NAME_EN[v.family]}, which looks different: ${TRAIT_SHORT_EN[v.family]}`,
    "classify.choices": "Kinds of function",
  },
);

const TRAIT_SHORT_ES: Record<string, string> = {
  constant: "es plana.",
  linear: "es una recta.",
  quadratic: "es una parábola simétrica.",
  cubic: "tiene forma de S.",
  sqrt: "arranca en un punto, sin asíntota.",
  abs: "es una V con punta.",
  rational: "tiene dos ramas separadas.",
  exponential: "tiene una asíntota horizontal.",
  log: "tiene una asíntota vertical.",
};
const TRAIT_SHORT_EN: Record<string, string> = {
  constant: "it's flat.",
  linear: "it's a straight line.",
  quadratic: "it's a symmetric parabola.",
  cubic: "it's S-shaped.",
  sqrt: "it starts at a point, no asymptote.",
  abs: "it's a sharp V.",
  rational: "it has two separate branches.",
  exponential: "it has a horizontal asymptote.",
  log: "it has a vertical asymptote.",
};
