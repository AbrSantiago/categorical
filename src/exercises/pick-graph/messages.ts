import { defineMessages, type Fmt } from "../../core/i18n";
import { formulaTex, shiftTex } from "../../functions";
import { functionMessages, specFrom, texNum } from "../../functions/messages";

type V = Record<string, string | number>;
const f = (v: V, fmt: Fmt) => formulaTex(specFrom(v), texNum(fmt));
const name = (locale: "es" | "en", family: string) => (functionMessages[locale]["fn.name"] as (v: { family: string }) => string)({ family });

export const pickGraphMessages = defineMessages(
  {
    "pickGraph.prompt": (v: V, fmt: Fmt) => `¿Cuál es el gráfico de $f(x)=${f(v, fmt)}$?`,
    "pickGraph.right": "¡Ese es!",
    "pickGraph.wrong": "Ese no era",
    "pickGraph.slip.h-sign": (v: V, fmt: Fmt) => {
      const h = Number(v.h);
      return `Ese está corrido para el otro lado. En $${shiftTex(h, texNum(fmt))}$ la curva se corre ${Math.abs(h)} a la **${h > 0 ? "derecha" : "izquierda"}**: el punto clave está donde $${shiftTex(h, texNum(fmt))}=0$.`;
    },
    "pickGraph.slip.a-sign": "Ese está dado vuelta: el signo del número de adelante decide si la curva va hacia arriba o hacia abajo.",
    "pickGraph.slip.k-sign": "Ese está corrido en vertical para el otro lado: sumar al final sube la curva, restar la baja.",
    "pickGraph.slip.swap": "Ese confunde el corrimiento horizontal con el vertical: lo de adentro (junto a la $x$) mueve a los costados, lo de afuera mueve arriba y abajo.",
    "pickGraph.slip.family": (v: V) => `Ese tiene la forma de otra familia: es ${name("es", String(v.other))}.`,
    "pickGraph.slip.other": "Ese tiene otros números: compará el punto clave de cada gráfico con la fórmula.",
    "pickGraph.choices": "Gráficos",
    "pickGraph.option": (v: { n: number }) => `Gráfico ${v.n}`,
  },
  {
    "pickGraph.prompt": (v: V, fmt: Fmt) => `Which one is the graph of $f(x)=${f(v, fmt)}$?`,
    "pickGraph.right": "That's the one!",
    "pickGraph.wrong": "Not that one",
    "pickGraph.slip.h-sign": (v: V, fmt: Fmt) => {
      const h = Number(v.h);
      return `That one is shifted the other way. With $${shiftTex(h, texNum(fmt))}$ the curve moves ${Math.abs(h)} to the **${h > 0 ? "right" : "left"}**: the key point is where $${shiftTex(h, texNum(fmt))}=0$.`;
    },
    "pickGraph.slip.a-sign": "That one is upside down: the sign of the number in front decides whether the curve goes up or down.",
    "pickGraph.slip.k-sign": "That one is shifted vertically the other way: adding at the end moves it up, subtracting moves it down.",
    "pickGraph.slip.swap": "That one mixes up the horizontal and vertical shifts: what's inside (next to $x$) moves sideways, what's outside moves up and down.",
    "pickGraph.slip.family": (v: V) => `That one has the shape of another family: it's ${name("en", String(v.other))}.`,
    "pickGraph.slip.other": "That one has other numbers: compare each graph's key point with the formula.",
    "pickGraph.choices": "Graphs",
    "pickGraph.option": (v: { n: number }) => `Graph ${v.n}`,
  },
);
