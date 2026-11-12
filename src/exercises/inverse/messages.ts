import { defineMessages, type Fmt } from "../../core/i18n";
import { formulaTex, inverseTex } from "../../functions";
import { specFrom, texNum } from "../../functions/messages";

type V = Record<string, string | number>;
const f = (v: V, fmt: Fmt) => formulaTex(specFrom(v), texNum(fmt));
const inv = (v: V, fmt: Fmt) => inverseTex(specFrom(v), texNum(fmt));
const branch = (v: V, fmt: Fmt) => (v.side === "right" ? `x\\ge ${texNum(fmt)(Number(v.h))}` : `x\\le ${texNum(fmt)(Number(v.h))}`);

export const inverseMessages = defineMessages(
  {
    "inv.prompt.graph": (v: V, fmt: Fmt) => `¿Cuál es el gráfico de la inversa de $f(x)=${f(v, fmt)}$?`,
    "inv.prompt.formula": (v: V, fmt: Fmt) => `¿Cuál es la inversa de $f(x)=${f(v, fmt)}$?`,
    "inv.prompt.restrict": (v: V, fmt: Fmt) => `$f(x)=${f(v, fmt)}$ no tiene inversa. Reflejala en $y=x$: ¿qué hay que hacer para que la tenga?`,
    "inv.right": "¡Eso!",
    "inv.wrong": "No es esa",
    "inv.mirror": "La inversa es el reflejo en la recta $y=x$: cada punto $(a,\\,b)$ del gráfico pasa a ser $(b,\\,a)$.",
    "inv.point": (v: V) => `Por ejemplo, $(${v.x},\\,${v.y})$ está en $f$, así que $(${v.y},\\,${v.x})$ está en $f^{-1}$.`,
    "inv.formula": (v: V, fmt: Fmt) => `Deshaciendo los pasos de $f$ en orden inverso: $f^{-1}(x)=${inv(v, fmt)}$.`,
    "inv.trap.y-axis": "Ese es el reflejo en el eje $y$: es $f(-x)$, no la inversa.",
    "inv.trap.x-axis": "Ese es el reflejo en el eje $x$: es $-f(x)$, no la inversa.",
    "inv.trap.anti": "Ese está reflejado en la otra diagonal, $y=-x$.",
    "inv.trap.recip": "$\\frac{1}{f(x)}$ es el inverso **multiplicativo**. El $-1$ de $f^{-1}$ no es un exponente: es deshacer lo que hace $f$.",
    "inv.trap.neg": "$-f(x)$ es el reflejo en el eje $x$, no en $y=x$.",
    "inv.trap.flipped": "Cuidado con los signos: para deshacer un $+k$ hay que restar, y el corrimiento horizontal de $f$ pasa a ser vertical en $f^{-1}$.",
    "inv.restrictWrong.codomain": "Achicar el codominio la vuelve sobreyectiva, pero el problema es otro: dos $x$ distintos dan el mismo $y$.",
    "inv.restrictWrong.recip": "$\\frac{1}{f}$ no deshace lo que hace $f$: no es la inversa.",
    "inv.restrictWrong.never": "Sí se puede, quedándote con un pedazo donde sea inyectiva.",
    "inv.restrictWhy": (v: V, fmt: Fmt) =>
      `Reflejada, la curva tiene dos puntos con el mismo $x$ (no pasa la prueba de la recta vertical), porque $f$ no es inyectiva. Si te quedás con una sola rama, por ejemplo $${branch(v, fmt)}$, ya es inyectiva y su reflejo es una función.`,
    "inv.opt.domain": (v: V, fmt: Fmt) => `Restringir el dominio a $${branch(v, fmt)}$`,
    "inv.opt.codomain": "Restringir el codominio a la imagen",
    "inv.opt.recip": "Usar $\\frac{1}{f(x)}$ como inversa",
    "inv.opt.never": "Nada: una función así nunca tiene inversa",
    "inv.slider": "reflejar",
    "inv.vertical": "2 puntos con el mismo $x$",
    "inv.choices": "Opciones",
    "inv.option": (v: { n: number }) => `Gráfico ${v.n}`,
  },
  {
    "inv.prompt.graph": (v: V, fmt: Fmt) => `Which one is the graph of the inverse of $f(x)=${f(v, fmt)}$?`,
    "inv.prompt.formula": (v: V, fmt: Fmt) => `What is the inverse of $f(x)=${f(v, fmt)}$?`,
    "inv.prompt.restrict": (v: V, fmt: Fmt) => `$f(x)=${f(v, fmt)}$ has no inverse. Mirror it across $y=x$: what would give it one?`,
    "inv.right": "That's it!",
    "inv.wrong": "Not that one",
    "inv.mirror": "The inverse is the mirror image across the line $y=x$: every point $(a,\\,b)$ of the graph becomes $(b,\\,a)$.",
    "inv.point": (v: V) => `For example, $(${v.x},\\,${v.y})$ is on $f$, so $(${v.y},\\,${v.x})$ is on $f^{-1}$.`,
    "inv.formula": (v: V, fmt: Fmt) => `Undoing the steps of $f$ in reverse order: $f^{-1}(x)=${inv(v, fmt)}$.`,
    "inv.trap.y-axis": "That's the mirror across the $y$ axis: it's $f(-x)$, not the inverse.",
    "inv.trap.x-axis": "That's the mirror across the $x$ axis: it's $-f(x)$, not the inverse.",
    "inv.trap.anti": "That one is mirrored across the other diagonal, $y=-x$.",
    "inv.trap.recip": "$\\frac{1}{f(x)}$ is the **multiplicative** inverse. The $-1$ in $f^{-1}$ isn't an exponent: it means undoing what $f$ does.",
    "inv.trap.neg": "$-f(x)$ is the mirror across the $x$ axis, not across $y=x$.",
    "inv.trap.flipped": "Watch the signs: undoing a $+k$ means subtracting, and the horizontal shift of $f$ becomes vertical in $f^{-1}$.",
    "inv.restrictWrong.codomain": "Shrinking the codomain makes it surjective, but the problem is another one: two different $x$ give the same $y$.",
    "inv.restrictWrong.recip": "$\\frac{1}{f}$ doesn't undo what $f$ does: it isn't the inverse.",
    "inv.restrictWrong.never": "It can work, if you keep a piece where it's injective.",
    "inv.restrictWhy": (v: V, fmt: Fmt) =>
      `Mirrored, the curve has two points with the same $x$ (it fails the vertical line test), because $f$ isn't injective. Keep a single branch, say $${branch(v, fmt)}$, and it becomes injective with a mirror image that is a function.`,
    "inv.opt.domain": (v: V, fmt: Fmt) => `Restrict the domain to $${branch(v, fmt)}$`,
    "inv.opt.codomain": "Restrict the codomain to the range",
    "inv.opt.recip": "Use $\\frac{1}{f(x)}$ as the inverse",
    "inv.opt.never": "Nothing: a function like this never has an inverse",
    "inv.slider": "mirror",
    "inv.vertical": "2 points with the same $x$",
    "inv.choices": "Options",
    "inv.option": (v: { n: number }) => `Graph ${v.n}`,
  },
);
