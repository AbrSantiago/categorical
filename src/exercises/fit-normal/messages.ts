import { defineMessages } from "../../core/i18n";

type Real = { mu: number; sigma: number };

export const fitNormalMessages = defineMessages(
  {
    "fitNormal.prompt.curve": "Mové $\\mu$ y $\\sigma$ hasta que tu curva tape la punteada.",
    "fitNormal.prompt.sample": "Esta muestra viene de una normal. Ajustá $\\mu$ y $\\sigma$ para que tu curva la describa.",
    "fitNormal.headline.right": "¡Encaja!",
    "fitNormal.headline.almost": "Casi: te faltó un parámetro",
    "fitNormal.headline.off": "No encaja todavía",
    "fitNormal.real": (v: Real, f) => `Los valores reales eran $\\mu = ${f.tex(v.mu)}$, $\\sigma = ${f.tex(v.sigma, 2)}$.`,
    "fitNormal.tip.sample":
      "Leíste bien la muestra: el centro del histograma estima $\\mu$ y su ancho estima $\\sigma$.",
    "fitNormal.tip.curve":
      "Entre $\\mu - \\sigma$ y $\\mu + \\sigma$ cae cerca del 68% del área: es una buena forma de leer el ancho.",
    "fitNormal.wrong.mu": (v: { side: "left" | "right"; mu: number }, f) =>
      `Tu curva está corrida hacia la ${v.side === "right" ? "derecha" : "izquierda"}: pusiste $\\mu = ${f.tex(v.mu)}$. ` +
      "$\\mu$ es el centro de la campana: moverlo la desplaza sin cambiar su forma.",
    "fitNormal.wrong.sigma": (v: { shape: "wide" | "narrow"; sigma: number }, f) =>
      `Tu campana es demasiado ${v.shape === "wide" ? "ancha y baja" : "angosta y alta"}: pusiste $\\sigma = ${f.tex(v.sigma, 2)}$. ` +
      "La altura del pico es $\\frac{1}{\\sigma\\sqrt{2\\pi}}$, así que más $\\sigma$ significa una campana más baja y más ancha (el área siempre es 1).",
    "fitNormal.chart": "Curva normal ajustable sobre el objetivo",
    "fitNormal.legend.user": "Tu curva",
    "fitNormal.legend.target": "Objetivo",
    "fitNormal.legend.real": "Distribución real",
    "fitNormal.legend.sample": (v: { n: number }) => `Muestra (${v.n} datos)`,
    "fitNormal.slider.mu": "media",
    "fitNormal.slider.sigma": "desvío",
  },
  {
    "fitNormal.prompt.curve": "Move $\\mu$ and $\\sigma$ until your curve covers the dashed one.",
    "fitNormal.prompt.sample": "This sample comes from a normal distribution. Set $\\mu$ and $\\sigma$ so your curve describes it.",
    "fitNormal.headline.right": "It fits!",
    "fitNormal.headline.almost": "Close: one parameter is off",
    "fitNormal.headline.off": "Not a fit yet",
    "fitNormal.real": (v: Real, f) => `The real values were $\\mu = ${f.tex(v.mu)}$, $\\sigma = ${f.tex(v.sigma, 2)}$.`,
    "fitNormal.tip.sample":
      "Good reading of the sample: the center of the histogram estimates $\\mu$ and its width estimates $\\sigma$.",
    "fitNormal.tip.curve":
      "About 68% of the area falls between $\\mu - \\sigma$ and $\\mu + \\sigma$: a handy way to read the width.",
    "fitNormal.wrong.mu": (v: { side: "left" | "right"; mu: number }, f) =>
      `Your curve is shifted to the ${v.side}: you set $\\mu = ${f.tex(v.mu)}$. ` +
      "$\\mu$ is the center of the bell: changing it slides the curve without changing its shape.",
    "fitNormal.wrong.sigma": (v: { shape: "wide" | "narrow"; sigma: number }, f) =>
      `Your bell is too ${v.shape === "wide" ? "wide and flat" : "narrow and tall"}: you set $\\sigma = ${f.tex(v.sigma, 2)}$. ` +
      "The peak height is $\\frac{1}{\\sigma\\sqrt{2\\pi}}$, so a larger $\\sigma$ means a lower, wider bell (the area is always 1).",
    "fitNormal.chart": "Adjustable normal curve over the target",
    "fitNormal.legend.user": "Your curve",
    "fitNormal.legend.target": "Target",
    "fitNormal.legend.real": "True distribution",
    "fitNormal.legend.sample": (v: { n: number }) => `Sample (${v.n} values)`,
    "fitNormal.slider.mu": "mean",
    "fitNormal.slider.sigma": "std. dev.",
  },
);
