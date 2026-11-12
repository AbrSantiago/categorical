import { defineMessages, type Fmt } from "../../core/i18n";
import { texNum } from "../../functions/messages";
import { applyTex, X, type Op, type OpId } from "./ops";

type V = Record<string, string | number>;
const op = (id: unknown, c: unknown): Op => ({ id: id as OpId, c: Number(c) });
const fx = (v: V, fmt: Fmt) => applyTex(op(v.fid, v.fc), X, texNum(fmt)).tex;
const gx = (v: V, fmt: Fmt) => applyTex(op(v.gid, v.gc), X, texNum(fmt)).tex;
const fgx = (v: V, fmt: Fmt) => applyTex(op(v.fid, v.fc), applyTex(op(v.gid, v.gc), X, texNum(fmt)), texNum(fmt)).tex;
const pair = (v: V, fmt: Fmt) => `$f(x)=${fx(v, fmt)}$ y $g(x)=${gx(v, fmt)}$`;
const pairEn = (v: V, fmt: Fmt) => `$f(x)=${fx(v, fmt)}$ and $g(x)=${gx(v, fmt)}$`;

export const compositionMessages = defineMessages(
  {
    "comp.prompt.formula": (v: V, fmt: Fmt) => `Con ${pair(v, fmt)}, ¿cuánto es $(f\\circ g)(x)$?`,
    "comp.prompt.value": (v: V, fmt: Fmt) => `Con ${pair(v, fmt)}, ¿cuánto es $(f\\circ g)(${v.x0})$?`,
    "comp.right": "¡Bien encadenado!",
    "comp.wrong": "No es esa",
    "comp.order": "$f\\circ g$ se lee de derecha a izquierda: primero entra a $g$ y lo que sale entra a $f$. O sea, $(f\\circ g)(x)=f(g(x))$.",
    "comp.steps": (v: V) => `$g(${v.x})=${v.inner}$ y después $f(${v.inner})=${v.outer}$.`,
    "comp.formula": (v: V, fmt: Fmt) => `Donde $f$ tiene una $x$, va $g(x)=${gx(v, fmt)}$ entera: $f(g(x))=${fgx(v, fmt)}$.`,
    "comp.trap.gf.formula": "Ese es $g\\circ f$: el orden al revés. Primero va $g$, después $f$.",
    "comp.trap.gf.value": "Ese es $(g\\circ f)$: pasaste primero por $f$. En $f\\circ g$, la que actúa primero es $g$.",
    "comp.trap.product.formula": "Ese es el producto $f(x)\\cdot g(x)$: multiplicar no es componer.",
    "comp.trap.product.value": "Ese es $f\\cdot g$: multiplicaste los resultados en vez de encadenar las máquinas.",
    "comp.trap.sum.formula": "Esa es la suma $f(x)+g(x)$: sumar no es componer.",
    "comp.trap.sum.value": "Ese es solo $g$: te faltó pasar el resultado por $f$.",
    "comp.machines": "Máquinas en cadena",
    "comp.input": "entra",
    "comp.output": "sale",
    "comp.less": "Menos",
    "comp.more": "Más",
  },
  {
    "comp.prompt.formula": (v: V, fmt: Fmt) => `With ${pairEn(v, fmt)}, what is $(f\\circ g)(x)$?`,
    "comp.prompt.value": (v: V, fmt: Fmt) => `With ${pairEn(v, fmt)}, what is $(f\\circ g)(${v.x0})$?`,
    "comp.right": "Well chained!",
    "comp.wrong": "Not that one",
    "comp.order": "$f\\circ g$ reads right to left: first into $g$, and what comes out goes into $f$. So $(f\\circ g)(x)=f(g(x))$.",
    "comp.steps": (v: V) => `$g(${v.x})=${v.inner}$ and then $f(${v.inner})=${v.outer}$.`,
    "comp.formula": (v: V, fmt: Fmt) => `Wherever $f$ has an $x$, put all of $g(x)=${gx(v, fmt)}$: $f(g(x))=${fgx(v, fmt)}$.`,
    "comp.trap.gf.formula": "That's $g\\circ f$: the order reversed. First $g$, then $f$.",
    "comp.trap.gf.value": "That's $(g\\circ f)$: you went through $f$ first. In $f\\circ g$, $g$ acts first.",
    "comp.trap.product.formula": "That's the product $f(x)\\cdot g(x)$: multiplying isn't composing.",
    "comp.trap.product.value": "That's $f\\cdot g$: you multiplied the outputs instead of chaining the machines.",
    "comp.trap.sum.formula": "That's the sum $f(x)+g(x)$: adding isn't composing.",
    "comp.trap.sum.value": "That's only $g$: you still had to put the result through $f$.",
    "comp.machines": "Machines in a chain",
    "comp.input": "in",
    "comp.output": "out",
    "comp.less": "Less",
    "comp.more": "More",
  },
);
