import { defineMessages, type Fmt } from "../../core/i18n";
import type { Target } from "./logic";

type Result = { target: Target; answer: number; mean: number; median: number };

const resultEs = (v: Result, f: Fmt) => {
  const [main, other] = v.target === "mean" ? ["media", "mediana"] : ["mediana", "media"];
  const [a, b] = v.target === "mean" ? [v.mean, v.median] : [v.median, v.mean];
  return `Marcaste ${f.num(v.answer)}; la ${main} es ${f.num(a)} (la ${other}, ${f.num(b)}).`;
};

const resultEn = (v: Result, f: Fmt) => {
  const [main, other] = v.target === "mean" ? ["mean", "median"] : ["median", "mean"];
  const [a, b] = v.target === "mean" ? [v.mean, v.median] : [v.median, v.mean];
  return `You marked ${f.num(v.answer)}; the ${main} is ${f.num(a)} (the ${other}, ${f.num(b)}).`;
};

export const dragMeanMessages = defineMessages(
  {
    "dragMean.prompt.mean": "Marcá dónde está la **media** de estos datos.",
    "dragMean.prompt.median": "Marcá dónde está la **mediana** de estos datos.",
    "dragMean.headline.right": "¡Bien centrado!",
    "dragMean.headline.close": "Cerca, pero no",
    "dragMean.headline.far": "Lejos del centro",
    "dragMean.result": resultEs,
    "dragMean.idea.mean": "La media es el punto de equilibrio: si el histograma fuera de cartón, se balancearía justo ahí.",
    "dragMean.idea.median": "La mediana deja la mitad de los datos a cada lado: misma área a izquierda y derecha.",
    "dragMean.shape.skew": (v: { side: "left" | "right" }) =>
      `La cola larga a la ${v.side === "right" ? "derecha" : "izquierda"} arrastra la media hacia ese lado: los valores extremos pesan en la media y no en la mediana.`,
    "dragMean.shape.bimodal":
      "Con dos jorobas, el centro puede caer en un valle donde casi no hay datos: la media no siempre es un valor típico.",
    "dragMean.shape.symmetric": "En una distribución simétrica, media y mediana coinciden (o casi).",
    "dragMean.chart": (v: { n: number }) => `Histograma de ${v.n} datos`,
    "dragMean.handle": (v: { target: Target }) => `Tu estimación de la ${v.target === "mean" ? "media" : "mediana"}`,
    "dragMean.legend.user": (v: { value: string }) => `Tu marca: ${v.value}`,
    "dragMean.legend.mean": (v: { value: string }) => `Media: ${v.value}`,
    "dragMean.legend.median": (v: { value: string }) => `Mediana: ${v.value}`,
    "dragMean.hint": "Tocá o arrastrá sobre el gráfico. Con el teclado: flechas (Shift para pasos grandes).",
  },
  {
    "dragMean.prompt.mean": "Mark where the **mean** of this data is.",
    "dragMean.prompt.median": "Mark where the **median** of this data is.",
    "dragMean.headline.right": "Right on center!",
    "dragMean.headline.close": "Close, but not quite",
    "dragMean.headline.far": "Far from the center",
    "dragMean.result": resultEn,
    "dragMean.idea.mean": "The mean is the balance point: if the histogram were cardboard, it would balance right there.",
    "dragMean.idea.median": "The median leaves half of the data on each side: equal area to the left and right.",
    "dragMean.shape.skew": (v: { side: "left" | "right" }) =>
      `The long tail to the ${v.side} drags the mean that way: extreme values pull on the mean but not on the median.`,
    "dragMean.shape.bimodal":
      "With two humps, the center can land in a valley with almost no data: the mean isn't always a typical value.",
    "dragMean.shape.symmetric": "In a symmetric distribution, the mean and median coincide (or nearly).",
    "dragMean.chart": (v: { n: number }) => `Histogram of ${v.n} values`,
    "dragMean.handle": (v: { target: Target }) => `Your estimate of the ${v.target}`,
    "dragMean.legend.user": (v: { value: string }) => `Your mark: ${v.value}`,
    "dragMean.legend.mean": (v: { value: string }) => `Mean: ${v.value}`,
    "dragMean.legend.median": (v: { value: string }) => `Median: ${v.value}`,
    "dragMean.hint": "Tap or drag on the chart. With a keyboard: arrow keys (Shift for bigger steps).",
  },
);
