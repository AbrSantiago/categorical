import { defineMessages, type Fmt } from "../../core/i18n";
import { formulaTex } from "../../functions";
import { specFrom, texNum } from "../../functions/messages";

type V = Record<string, string | number>;
const f = (v: V, fmt: Fmt) => formulaTex(specFrom(v), texNum(fmt));

export const intervalQuizMessages = defineMessages(
  {
    "intervalQuiz.prompt.x": (v: V, fmt: Fmt) => `¿Cuál es el **dominio** de $f(x)=${f(v, fmt)}$?`,
    "intervalQuiz.prompt.y": (v: V, fmt: Fmt) => `¿Cuál es la **imagen** de $f(x)=${f(v, fmt)}$?`,
    "intervalQuiz.other.x": "Ese conjunto es la imagen, no el dominio: el dominio son los $x$ que podés poner, la imagen los $y$ que salen.",
    "intervalQuiz.other.y": "Ese conjunto es el dominio, no la imagen: la imagen son los $y$ que salen, el dominio los $x$ que podés poner.",
    "intervalQuiz.choices": "Conjuntos",
  },
  {
    "intervalQuiz.prompt.x": (v: V, fmt: Fmt) => `What is the **domain** of $f(x)=${f(v, fmt)}$?`,
    "intervalQuiz.prompt.y": (v: V, fmt: Fmt) => `What is the **range** of $f(x)=${f(v, fmt)}$?`,
    "intervalQuiz.other.x": "That set is the range, not the domain: the domain is the $x$ you can plug in, the range the $y$ that come out.",
    "intervalQuiz.other.y": "That set is the domain, not the range: the range is the $y$ that come out, the domain the $x$ you can plug in.",
    "intervalQuiz.choices": "Sets",
  },
);
