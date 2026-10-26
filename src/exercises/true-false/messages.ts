import { defineMessages, type Fmt } from "../../core/i18n";
import { getDist } from "../../distributions";
import { texCall } from "../../distributions/messages";

type M = { dist: string; formula: string };

export const trueFalseMessages = defineMessages(
  {
    "tf.prompt": "¿Verdadero o falso?",
    "tf.true": "Verdadero",
    "tf.false": "Falso",
    "tf.right": "¡Exacto!",
    "tf.wasTrue": "Era verdadero",
    "tf.wasFalse": "Era falso",
    "tf.mean.statement": (v: M, f: Fmt) => `La media de $${texCall(f.locale, f, v.dist)}$ es $${v.formula}$.`,
    "tf.mean.why": (v: { dist: string }, f: Fmt) =>
      `La media de $${texCall(f.locale, f, v.dist)}$ es $${getDist(v.dist).mean!.right}$.`,
    "tf.choices": "Respuesta",
  },
  {
    "tf.prompt": "True or false?",
    "tf.true": "True",
    "tf.false": "False",
    "tf.right": "Exactly!",
    "tf.wasTrue": "It was true",
    "tf.wasFalse": "It was false",
    "tf.mean.statement": (v: M, f: Fmt) => `The mean of $${texCall(f.locale, f, v.dist)}$ is $${v.formula}$.`,
    "tf.mean.why": (v: { dist: string }, f: Fmt) =>
      `The mean of $${texCall(f.locale, f, v.dist)}$ is $${getDist(v.dist).mean!.right}$.`,
    "tf.choices": "Answer",
  },
);
