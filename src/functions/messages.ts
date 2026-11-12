import { defineMessages, type Fmt } from "../core/i18n";
import { formulaTex, shiftTex, type FnSpec } from ".";
import type { FamilyId } from "./families";
import { decodeSet, encodeSet, setTex } from "./intervals";

/** Numbers inside TeX: integers as they are, decimals with the locale's comma. */
export const texNum = (f: Fmt) => (v: number) => (Number.isInteger(v) ? String(v) : f.tex(v, Math.abs(v * 10) % 1 === 0 ? 1 : 2));

/** A function as message values (values can only be strings and numbers). */
export function specValues(s: FnSpec): Record<string, string | number> {
  return { family: s.family, a: s.a, h: s.h, k: s.k, ...(s.restrict ? { restrict: encodeSet(s.restrict) } : {}) };
}

export function specFrom(v: Record<string, unknown>): FnSpec {
  return {
    family: v.family as FamilyId,
    a: Number(v.a),
    h: Number(v.h),
    k: Number(v.k),
    ...(v.restrict ? { restrict: decodeSet(String(v.restrict)) } : {}),
  };
}

const formula = (v: Record<string, unknown>, f: Fmt, name = "f") => `${name}(x)=${formulaTex(specFrom(v), texNum(f))}`;
const set = (v: { set: string }, f: Fmt) => setTex(decodeSet(v.set), texNum(f));

const NAMES_ES: Record<FamilyId, string> = {
  constant: "constante",
  linear: "lineal",
  quadratic: "cuadrática",
  cubic: "cúbica",
  sqrt: "raíz cuadrada",
  abs: "valor absoluto",
  rational: "racional",
  exponential: "exponencial",
  log: "logarítmica",
};
const NAMES_EN: Record<FamilyId, string> = {
  constant: "constant",
  linear: "linear",
  quadratic: "quadratic",
  cubic: "cubic",
  sqrt: "square root",
  abs: "absolute value",
  rational: "rational",
  exponential: "exponential",
  log: "logarithmic",
};
const TRAIT_ES: Record<FamilyId, string> = {
  constant: "Una recta horizontal: vale lo mismo para todo $x$.",
  linear: "Una recta inclinada: sube (o baja) siempre al mismo ritmo.",
  quadratic: "Una parábola: baja hasta un vértice y vuelve a subir (o al revés), curvada y simétrica.",
  cubic: "Una S: sube, se aplana en un punto y sigue subiendo (o al revés).",
  sqrt: "Media parábola acostada: arranca en un punto y crece cada vez más despacio.",
  abs: "Una V con punta: dos rectas que se juntan en un vértice.",
  rational: "Dos ramas separadas por asíntotas: una vertical y una horizontal.",
  exponential: "Pegada a una asíntota horizontal de un lado y disparada del otro.",
  log: "Pegada a una asíntota vertical y creciendo cada vez más despacio.",
};
const TRAIT_EN: Record<FamilyId, string> = {
  constant: "A horizontal line: the same value for every $x$.",
  linear: "A slanted line: it rises (or falls) at a steady rate.",
  quadratic: "A parabola: down to a vertex and back up (or the other way), curved and symmetric.",
  cubic: "An S: rises, flattens at one point and keeps rising (or the other way).",
  sqrt: "Half a parabola lying down: it starts at a point and grows more and more slowly.",
  abs: "A sharp V: two lines meeting at a vertex.",
  rational: "Two separate branches split by asymptotes, one vertical and one horizontal.",
  exponential: "Hugging a horizontal asymptote on one side and shooting off on the other.",
  log: "Hugging a vertical asymptote and growing more and more slowly.",
};

type S = Record<string, number | string>;
const n = (f: Fmt, v: unknown) => texNum(f)(Number(v));

/** Where to look on the graph of each family (vertex, start, asymptotes…). */
function featureEs(v: S, f: Fmt): string {
  const s = specFrom(v);
  const h = n(f, s.h);
  const k = n(f, s.k);
  switch (s.family) {
    case "constant":
      return `Es la recta horizontal $y=${k}$.`;
    case "linear":
      return `Corta el eje $y$ en $${k}$ y tiene pendiente $${n(f, s.a)}$.`;
    case "quadratic":
    case "abs":
      return `El vértice está en $(${h},\\,${k})$ y ${s.a > 0 ? "abre hacia arriba" : "abre hacia abajo"}.`;
    case "cubic":
      return `El punto donde se aplana es $(${h},\\,${k})$.`;
    case "sqrt":
      return `Arranca en $(${h},\\,${k})$ y ${s.a > 0 ? "sube" : "baja"}.`;
    case "rational":
      return `Las asíntotas son $x=${h}$ e $y=${k}$.`;
    case "exponential":
      return `La asíntota es $y=${k}$ y pasa por $(${h},\\,${n(f, s.a + s.k)})$.`;
    case "log":
      return `La asíntota es $x=${h}$ y pasa por $(${n(f, s.h + 1)},\\,${k})$.`;
  }
}

function featureEn(v: S, f: Fmt): string {
  const s = specFrom(v);
  const h = n(f, s.h);
  const k = n(f, s.k);
  switch (s.family) {
    case "constant":
      return `It's the horizontal line $y=${k}$.`;
    case "linear":
      return `It crosses the $y$ axis at $${k}$ with slope $${n(f, s.a)}$.`;
    case "quadratic":
    case "abs":
      return `The vertex is at $(${h},\\,${k})$ and it ${s.a > 0 ? "opens up" : "opens down"}.`;
    case "cubic":
      return `It flattens out at $(${h},\\,${k})$.`;
    case "sqrt":
      return `It starts at $(${h},\\,${k})$ and goes ${s.a > 0 ? "up" : "down"}.`;
    case "rational":
      return `The asymptotes are $x=${h}$ and $y=${k}$.`;
    case "exponential":
      return `The asymptote is $y=${k}$ and it goes through $(${h},\\,${n(f, s.a + s.k)})$.`;
    case "log":
      return `The asymptote is $x=${h}$ and it goes through $(${n(f, s.h + 1)},\\,${k})$.`;
  }
}

/** Why a domain or range is what it is, per family. */
function whyEs(v: S & { axis: string }, f: Fmt): string {
  const s = specFrom(v);
  const h = n(f, s.h);
  const k = n(f, s.k);
  if (v.axis === "x") {
    switch (s.family) {
      case "sqrt":
        return `Adentro de la raíz no puede haber negativos: $${shiftTex(s.h, texNum(f))}\\ge 0$, o sea $x\\ge ${h}$. El ${h} entra: va con corchete.`;
      case "log":
        return `El logaritmo solo acepta positivos: $x>${h}$. El ${h} no entra (ahí está la asíntota): va con paréntesis.`;
      case "rational":
        return `No se puede dividir por cero: $x\\ne ${h}$. Queda todo $\\mathbb{R}$ menos ese punto.`;
      default:
        return "No hay raíces, logaritmos ni divisiones: se puede calcular para cualquier $x$. El dominio es $\\mathbb{R}$.";
    }
  }
  switch (s.family) {
    case "constant":
      return `Es constante: la imagen es un solo número, $\\{${k}\\}$.`;
    case "quadratic":
    case "abs":
      return `El vértice está a altura $${k}$ y la curva ${s.a > 0 ? "sube" : "baja"} sin límite desde ahí. El ${k} se alcanza: corchete.`;
    case "sqrt":
      return `Arranca a altura $${k}$ y ${s.a > 0 ? "sube" : "baja"} sin límite. El ${k} se alcanza en el punto de partida: corchete.`;
    case "exponential":
      return `$y=${k}$ es una asíntota: la curva se acerca pero nunca llega, así que el ${k} va con paréntesis.`;
    case "rational":
      return `La asíntota $y=${k}$ deja un hueco: la curva toma todos los valores menos el $${k}$.`;
    default:
      return "Sube y baja sin límite: la imagen es todo $\\mathbb{R}$.";
  }
}

function whyEn(v: S & { axis: string }, f: Fmt): string {
  const s = specFrom(v);
  const h = n(f, s.h);
  const k = n(f, s.k);
  if (v.axis === "x") {
    switch (s.family) {
      case "sqrt":
        return `No negatives under the square root: $${shiftTex(s.h, texNum(f))}\\ge 0$, so $x\\ge ${h}$. The ${h} is included: square bracket.`;
      case "log":
        return `Logarithms only take positives: $x>${h}$. The ${h} is out (the asymptote is there): round bracket.`;
      case "rational":
        return `You can't divide by zero: $x\\ne ${h}$. All of $\\mathbb{R}$ except that point.`;
      default:
        return "No roots, logs or divisions: it can be computed for any $x$. The domain is $\\mathbb{R}$.";
    }
  }
  switch (s.family) {
    case "constant":
      return `It's constant: the range is a single number, $\\{${k}\\}$.`;
    case "quadratic":
    case "abs":
      return `The vertex is at height $${k}$ and the curve goes ${s.a > 0 ? "up" : "down"} without bound from there. The ${k} is reached: square bracket.`;
    case "sqrt":
      return `It starts at height $${k}$ and goes ${s.a > 0 ? "up" : "down"} without bound. The ${k} is reached at the start: square bracket.`;
    case "exponential":
      return `$y=${k}$ is an asymptote: the curve gets close but never arrives, so the ${k} gets a round bracket.`;
    case "rational":
      return `The asymptote $y=${k}$ leaves a gap: the curve takes every value except $${k}$.`;
    default:
      return "It rises and falls without bound: the range is all of $\\mathbb{R}$.";
  }
}

export const functionMessages = defineMessages(
  {
    "fn.name": (v: { family: FamilyId }) => NAMES_ES[v.family],
    "fn.Name": (v: { family: FamilyId }) => NAMES_ES[v.family][0].toUpperCase() + NAMES_ES[v.family].slice(1),
    "fn.trait": (v: { family: FamilyId }) => TRAIT_ES[v.family],
    "fn.formula": (v: S, f: Fmt) => `$${formula(v, f)}$`,
    "fn.set": (v: { set: string }, f: Fmt) => `$${set(v, f)}$`,
    "fn.feature": featureEs,
    "fn.why": whyEs,
    "fn.domain": "Dominio",
    "fn.image": "Imagen",
    "fn.chart": "Gráfico de la función",
  },
  {
    "fn.name": (v: { family: FamilyId }) => NAMES_EN[v.family],
    "fn.Name": (v: { family: FamilyId }) => NAMES_EN[v.family][0].toUpperCase() + NAMES_EN[v.family].slice(1),
    "fn.trait": (v: { family: FamilyId }) => TRAIT_EN[v.family],
    "fn.formula": (v: S, f: Fmt) => `$${formula(v, f)}$`,
    "fn.set": (v: { set: string }, f: Fmt) => `$${set(v, f)}$`,
    "fn.feature": featureEn,
    "fn.why": whyEn,
    "fn.domain": "Domain",
    "fn.image": "Range",
    "fn.chart": "Graph of the function",
  },
);
