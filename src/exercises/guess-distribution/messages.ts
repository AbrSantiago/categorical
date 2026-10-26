import { defineMessages } from "../../core/i18n";
import { getDist } from "../../distributions";

type D = { dist: string };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const es = (id: string) => getDist(id);

export const guessDistributionMessages = defineMessages(
  {
    "guess.prompt": "¿De qué distribución salieron estos datos?",
    "guess.name": (v: D) => es(v.dist).name.es,
    "guess.headline.right": (v: D) => `¡Sí, es ${es(v.dist).article.es}!`,
    "guess.headline.wrong": (v: D) => `Era ${es(v.dist).article.es}`,
    "guess.why.right": (v: D) => `La pista estaba en la forma: ${es(v.dist).trait.es}.`,
    "guess.use": (v: D) => `Se usa para: ${es(v.dist).use.es}.`,
    "guess.was": (v: D) => `${cap(es(v.dist).article.es)} ${es(v.dist).trait.es}.`,
    "guess.chosen": (v: D) => `En cambio, ${es(v.dist).article.es} ${es(v.dist).trait.es}.`,
    "guess.tip.exponential-lognormal":
      "Para distinguirlas, mirá el 0: la exponencial es máxima ahí; la log-normal arranca en 0 y sube.",
    "guess.tip.exponential-gamma":
      "Mirá el 0: la exponencial es máxima ahí; una Gamma con $\\alpha > 1$ arranca en 0, sube y después baja.",
    "guess.tip.normal-uniform": "Mirá los bordes: la uniforme corta de golpe; la normal se desvanece de a poco.",
    "guess.tip.normal-lognormal":
      "Fijate en la simetría: la normal tiene las dos colas iguales; la log-normal, la derecha más larga.",
    "guess.tip.normal-poisson": "Fijate si hay huecos entre barras: los datos discretos solo caen en enteros.",
    "guess.tip.exponential-poisson": "Fijate si hay huecos entre barras: los datos discretos solo caen en enteros.",
    "guess.tip.binomial-poisson":
      "La binomial forma una campana de barras con tope en $n$; la Poisson con $\\lambda$ chico se amontona cerca del 0 y tiene cola a la derecha.",
    "guess.tip.geometric-poisson":
      "La geométrica es máxima en el primer valor y solo baja; la Poisson con $\\lambda > 1$ sube primero y después baja.",
    "guess.tip.laplace-normal": "Mirá el pico: la Laplace termina en punta; la normal es redondeada.",
    "guess.tip.cauchy-normal":
      "La Cauchy tiene un pico angosto y, sobre todo, valores extremísimos que una normal casi nunca produce.",
    "guess.tip.student-t-cauchy":
      "Las dos tienen colas pesadas, pero la Cauchy muchísimo más: su pico se ve más angosto porque el eje tiene que abarcar extremos enormes.",
    "guess.tip.triangular-uniform": "La uniforme es plana; la triangular sube en línea recta hasta un pico.",
    "guess.tip.beta-normal": "Mirá el eje: la Beta vive entre 0 y 1 y nunca sale de ahí.",
    "guess.tip.pareto-gamma": "La Pareto arranca de golpe en su mínimo con el valor más alto; la Gamma sube desde 0.",
    "guess.tip.discrete-uniform-binomial":
      "En la uniforme discreta todas las barras tienen la misma altura; la binomial forma una campana.",
    "guess.chart": (v: { n: number }) => `Histograma de ${v.n} datos`,
    "guess.legend.sample": (v: { n: number }) => `Muestra (${v.n} datos)`,
    "guess.legend.theory": (v: D) => `${es(v.dist).name.es} teórica`,
    "guess.choices": "Distribución",
  },
  {
    "guess.prompt": "Which distribution did this data come from?",
    "guess.name": (v: D) => es(v.dist).name.en,
    "guess.headline.right": (v: D) => `Yes, it's ${es(v.dist).article.en}!`,
    "guess.headline.wrong": (v: D) => `It was ${es(v.dist).article.en}`,
    "guess.why.right": (v: D) => `The clue was in the shape: ${es(v.dist).article.en} ${es(v.dist).trait.en}.`,
    "guess.use": (v: D) => `It's used for: ${es(v.dist).use.en}.`,
    "guess.was": (v: D) => `${cap(es(v.dist).article.en)} ${es(v.dist).trait.en}.`,
    "guess.chosen": (v: D) => `${cap(es(v.dist).article.en)}, on the other hand, ${es(v.dist).trait.en}.`,
    "guess.tip.exponential-lognormal":
      "To tell them apart, look at 0: the exponential peaks there; the log-normal starts at 0 and rises.",
    "guess.tip.exponential-gamma":
      "Look at 0: the exponential peaks there; a Gamma with $\\alpha > 1$ starts at 0, rises and then falls.",
    "guess.tip.normal-uniform": "Look at the edges: the uniform stops sharply; the normal fades out gradually.",
    "guess.tip.normal-lognormal":
      "Check the symmetry: the normal has two matching tails; the log-normal's right tail is longer.",
    "guess.tip.normal-poisson": "Look for gaps between bars: discrete data only lands on whole numbers.",
    "guess.tip.exponential-poisson": "Look for gaps between bars: discrete data only lands on whole numbers.",
    "guess.tip.binomial-poisson":
      "The binomial makes a bell of bars capped at $n$; a Poisson with small $\\lambda$ piles up near 0 with a right tail.",
    "guess.tip.geometric-poisson":
      "The geometric peaks at its first value and only goes down; a Poisson with $\\lambda > 1$ rises first and then falls.",
    "guess.tip.laplace-normal": "Look at the peak: the Laplace is pointed; the normal is rounded.",
    "guess.tip.cauchy-normal":
      "The Cauchy has a narrow peak and, above all, wildly extreme values that a normal almost never produces.",
    "guess.tip.student-t-cauchy":
      "Both have heavy tails, but the Cauchy far more: its peak looks narrower because the axis has to cover huge extremes.",
    "guess.tip.triangular-uniform": "The uniform is flat; the triangular rises in a straight line to a peak.",
    "guess.tip.beta-normal": "Look at the axis: the Beta lives between 0 and 1 and never leaves it.",
    "guess.tip.pareto-gamma": "The Pareto starts abruptly at its minimum with its highest value; the Gamma rises from 0.",
    "guess.tip.discrete-uniform-binomial":
      "In the discrete uniform all bars have the same height; the binomial forms a bell.",
    "guess.chart": (v: { n: number }) => `Histogram of ${v.n} values`,
    "guess.legend.sample": (v: { n: number }) => `Sample (${v.n} values)`,
    "guess.legend.theory": (v: D) => `Theoretical ${es(v.dist).name.en}`,
    "guess.choices": "Distribution",
  },
);
