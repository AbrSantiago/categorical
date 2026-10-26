import { defineMessages } from "../../core/i18n";
import { getDist } from "../../distributions";

type K = { dist: string; key: string };
const param = (v: K) => getDist(v.dist).params.find((p) => p.key === v.key)!;

export const matchPairsMessages = defineMessages(
  {
    "match.prompt": "Uní cada parámetro con lo que significa.",
    "match.left": (v: K) => `$${param(v).tex}$ en ${getDist(v.dist).article.es}`,
    "match.role": (v: K) => param(v).role.es,
    "match.headline.right": "¡Todos bien!",
    "match.headline.wrong": (v: { n: number }) => (v.n === 1 ? "Un par quedó mal" : `${v.n} pares quedaron mal`),
    "match.fix": (v: K) => `$${param(v).tex}$ en ${getDist(v.dist).article.es}: ${param(v).role.es}.`,
    "match.right.why": "Ojo con las letras repetidas: el mismo símbolo puede significar cosas distintas según la distribución.",
    "match.params": "Parámetros",
    "match.meanings": "Significados",
    "match.hint": "Tocá un parámetro y después su significado. Tocá un par para deshacerlo.",
  },
  {
    "match.prompt": "Match each parameter with what it means.",
    "match.left": (v: K) => `$${param(v).tex}$ in ${getDist(v.dist).article.en}`,
    "match.role": (v: K) => param(v).role.en,
    "match.headline.right": "All correct!",
    "match.headline.wrong": (v: { n: number }) => (v.n === 1 ? "One pair is wrong" : `${v.n} pairs are wrong`),
    "match.fix": (v: K) => `$${param(v).tex}$ in ${getDist(v.dist).article.en}: ${param(v).role.en}.`,
    "match.right.why": "Watch out for repeated letters: the same symbol can mean different things in different distributions.",
    "match.params": "Parameters",
    "match.meanings": "Meanings",
    "match.hint": "Tap a parameter and then its meaning. Tap a pair to undo it.",
  },
);
