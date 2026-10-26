import { lbeta, lgamma } from "../core/special";
import type { Rng } from "../core/random";
import type { DistDef } from "./types";

const SQRT_2PI = Math.sqrt(2 * Math.PI);

const chiSquare = (rng: Rng, k: number) => rng.gamma(k / 2, 2);

export const continuous: DistDef[] = [
  {
    id: "normal",
    kind: "continuous",
    group: "bell",
    name: { es: "Normal", en: "Normal" },
    article: { es: "una normal", en: "a normal" },
    trait: {
      es: "es simétrica, con forma de campana y colas que bajan rápido a ambos lados",
      en: "is symmetric and bell-shaped, with tails that drop quickly on both sides",
    },
    use: {
      es: "errores de medición, alturas, sumas de muchos efectos chicos",
      en: "measurement errors, heights, sums of many small effects",
    },
    params: [
      {
        key: "mu",
        tex: "\\mu",
        role: { es: "media: dónde está el centro", en: "mean: where the center is" },
        effect: { es: "mueve la campana sin cambiar su forma", en: "slides the bell without changing its shape" },
      },
      {
        key: "sigma",
        tex: "\\sigma",
        role: { es: "desvío estándar: cuánto se dispersan los datos", en: "standard deviation: how spread out the data is" },
        effect: { es: "la vuelve más ancha y más baja", en: "makes it wider and lower" },
      },
    ],
    shapeParams: (r) => ({ mu: r.step(4, 8, 0.5), sigma: r.step(1, 1.8, 0.1) }),
    sample: (r, p) => r.normal(p.mu, p.sigma),
    density: (x, p) => Math.exp(-0.5 * ((x - p.mu) / p.sigma) ** 2) / (p.sigma * SQRT_2PI),
    mean: { right: "\\mu", wrong: ["\\sigma", "\\mu + \\sigma", "\\mu / \\sigma"] },
    facts: [
      {
        truth: true,
        text: {
          es: "En una normal, cerca del 95% de los datos cae entre $\\mu - 2\\sigma$ y $\\mu + 2\\sigma$.",
          en: "In a normal, about 95% of the data falls between $\\mu - 2\\sigma$ and $\\mu + 2\\sigma$.",
        },
        why: {
          es: "Es la regla 68-95-99,7: 68% a un $\\sigma$, 95% a dos y 99,7% a tres.",
          en: "That's the 68-95-99.7 rule: 68% within one $\\sigma$, 95% within two, 99.7% within three.",
        },
      },
      {
        truth: false,
        text: {
          es: "Si duplicás $\\sigma$ en una normal, el pico se vuelve el doble de alto.",
          en: "If you double $\\sigma$ in a normal, the peak becomes twice as tall.",
        },
        why: {
          es: "Es al revés: la altura del pico es $\\frac{1}{\\sigma\\sqrt{2\\pi}}$, así que queda a la mitad. El área tiene que seguir siendo 1.",
          en: "It's the opposite: the peak height is $\\frac{1}{\\sigma\\sqrt{2\\pi}}$, so it halves. The area has to stay 1.",
        },
      },
    ],
  },
  {
    id: "uniform",
    kind: "continuous",
    group: "flat",
    name: { es: "Uniforme", en: "Uniform" },
    article: { es: "una uniforme", en: "a uniform" },
    trait: {
      es: "es plana: todos los valores del intervalo son igual de probables, y corta de golpe en los bordes",
      en: "is flat: every value in the interval is equally likely, and it stops sharply at the edges",
    },
    use: { es: "un número al azar entre dos límites", en: "a random number between two limits" },
    params: [
      {
        key: "a",
        tex: "a",
        role: { es: "límite inferior del intervalo", en: "lower end of the interval" },
        effect: { es: "corre el borde izquierdo; la altura se ajusta a $\\frac{1}{b-a}$", en: "moves the left edge; the height adjusts to $\\frac{1}{b-a}$" },
      },
      {
        key: "b",
        tex: "b",
        role: { es: "límite superior del intervalo", en: "upper end of the interval" },
        effect: { es: "corre el borde derecho; más ancho significa más bajo", en: "moves the right edge; wider means lower" },
      },
    ],
    shapeParams: (r) => {
      const a = r.step(1, 5, 0.5);
      return { a, b: a + r.step(4, 7, 0.5) };
    },
    sample: (r, p) => r.uniform(p.a, p.b),
    density: (x, p) => (x < p.a || x > p.b ? 0 : 1 / (p.b - p.a)),
    lower: (p) => p.a - (p.b - p.a) * 0.15,
    upper: (p) => p.b + (p.b - p.a) * 0.15,
    valid: (p) => p.b - p.a >= 0.5,
    mean: { right: "\\frac{a+b}{2}", wrong: ["b - a", "\\frac{b-a}{2}", "a + b"] },
    facts: [
      {
        truth: true,
        text: {
          es: "La densidad de una uniforme en $[a, b]$ vale $\\frac{1}{b-a}$ dentro del intervalo.",
          en: "The density of a uniform on $[a, b]$ equals $\\frac{1}{b-a}$ inside the interval.",
        },
        why: {
          es: "Es un rectángulo de base $b-a$, y el área tiene que dar 1.",
          en: "It's a rectangle of width $b-a$, and the area has to be 1.",
        },
      },
      {
        truth: false,
        text: {
          es: "En una uniforme, los valores cerca del centro son más probables que los de los bordes.",
          en: "In a uniform, values near the center are more likely than values near the edges.",
        },
        why: {
          es: "Todos los subintervalos del mismo ancho tienen la misma probabilidad: por eso es plana.",
          en: "Every subinterval of the same width has the same probability: that's why it's flat.",
        },
      },
    ],
    fit: {
      range: [0, 10],
      start: { a: 2, b: 6 },
      grid: { a: [0, 9.5, 0.1], b: [0.5, 10, 0.1] },
      target: { a: [0.5, 5], b: [3, 9.5] },
    },
  },
  {
    id: "exponential",
    kind: "continuous",
    group: "decay",
    name: { es: "Exponencial", en: "Exponential" },
    article: { es: "una exponencial", en: "an exponential" },
    trait: {
      es: "tiene su máximo pegado al 0 y cae rápido, con una cola larga a la derecha",
      en: "peaks right at 0 and falls fast, with a long tail to the right",
    },
    use: { es: "tiempos de espera hasta el próximo evento", en: "waiting times until the next event" },
    params: [
      {
        key: "lambda",
        tex: "\\lambda",
        role: { es: "tasa: eventos por unidad de tiempo", en: "rate: events per unit of time" },
        effect: {
          es: "hace que caiga más rápido: las esperas son más cortas (la media es $1/\\lambda$)",
          en: "makes it fall faster: waits get shorter (the mean is $1/\\lambda$)",
        },
      },
    ],
    shapeParams: (r) => ({ lambda: r.step(0.35, 0.8, 0.05) }),
    sample: (r, p) => r.exponential(p.lambda),
    density: (x, p) => (x < 0 ? 0 : p.lambda * Math.exp(-p.lambda * x)),
    lower: () => 0,
    mean: { right: "\\frac{1}{\\lambda}", wrong: ["\\lambda", "\\lambda^2", "\\frac{1}{\\lambda^2}"] },
    facts: [
      {
        truth: true,
        text: {
          es: "La exponencial no tiene memoria: haber esperado 5 minutos no cambia cuánto falta esperar.",
          en: "The exponential is memoryless: having waited 5 minutes doesn't change how much longer you'll wait.",
        },
        why: {
          es: "$P(X > s + t \\mid X > s) = P(X > t)$. Es la única continua con esta propiedad.",
          en: "$P(X > s + t \\mid X > s) = P(X > t)$. It's the only continuous distribution with this property.",
        },
      },
      {
        truth: false,
        text: {
          es: "En una exponencial, $\\lambda$ es el tiempo medio de espera.",
          en: "In an exponential, $\\lambda$ is the mean waiting time.",
        },
        why: {
          es: "$\\lambda$ es una tasa (eventos por unidad de tiempo); el tiempo medio es $1/\\lambda$.",
          en: "$\\lambda$ is a rate (events per unit of time); the mean time is $1/\\lambda$.",
        },
      },
    ],
    fit: {
      range: [0, 8],
      start: { lambda: 1 },
      grid: { lambda: [0.2, 3, 0.05] },
      target: { lambda: [0.3, 2.5] },
    },
  },
  {
    id: "lognormal",
    kind: "continuous",
    group: "hump",
    name: { es: "Log-normal", en: "Log-normal" },
    article: { es: "una log-normal", en: "a log-normal" },
    trait: {
      es: "arranca en 0, sube hasta un pico y después tiene una cola larga a la derecha",
      en: "starts at 0, rises to a peak and then has a long tail to the right",
    },
    use: { es: "ingresos, tamaños de archivos, precios: cosas que crecen multiplicando", en: "incomes, file sizes, prices: things that grow by multiplying" },
    params: [
      {
        key: "mu",
        tex: "\\mu",
        role: { es: "media del logaritmo de la variable", en: "mean of the variable's logarithm" },
        effect: { es: "estira todo hacia la derecha (multiplica los valores por $e^{\\mu}$)", en: "stretches everything to the right (multiplies values by $e^{\\mu}$)" },
      },
      {
        key: "sigma",
        tex: "\\sigma",
        role: { es: "desvío del logaritmo de la variable", en: "standard deviation of the variable's logarithm" },
        effect: { es: "alarga la cola derecha y la vuelve más asimétrica", en: "lengthens the right tail and makes it more skewed" },
      },
    ],
    shapeParams: (r) => ({ mu: r.step(1, 1.6, 0.1), sigma: r.step(0.35, 0.55, 0.05) }),
    sample: (r, p) => r.logNormal(p.mu, p.sigma),
    density: (x, p) => (x <= 0 ? 0 : Math.exp(-0.5 * ((Math.log(x) - p.mu) / p.sigma) ** 2) / (x * p.sigma * SQRT_2PI)),
    lower: () => 0,
    mean: { right: "e^{\\mu + \\sigma^2/2}", wrong: ["\\mu", "e^{\\mu}", "e^{\\mu + \\sigma}"] },
    facts: [
      {
        truth: true,
        text: { es: "Si $X$ es log-normal, $\\ln X$ es normal.", en: "If $X$ is log-normal, $\\ln X$ is normal." },
        why: {
          es: "Esa es la definición: el nombre viene de que su logaritmo es normal.",
          en: "That's the definition: the name comes from its logarithm being normal.",
        },
      },
      {
        truth: false,
        text: { es: "En una log-normal, $\\mu$ es la media de $X$.", en: "In a log-normal, $\\mu$ is the mean of $X$." },
        why: {
          es: "$\\mu$ es la media de $\\ln X$. La media de $X$ es $e^{\\mu + \\sigma^2/2}$.",
          en: "$\\mu$ is the mean of $\\ln X$. The mean of $X$ is $e^{\\mu + \\sigma^2/2}$.",
        },
      },
    ],
    fit: {
      range: [0, 12],
      start: { mu: 1, sigma: 0.5 },
      grid: { mu: [-0.5, 2.5, 0.05], sigma: [0.15, 1.2, 0.01] },
      target: { mu: [0, 1.8], sigma: [0.25, 0.9] },
    },
  },
  {
    id: "gamma",
    kind: "continuous",
    group: "hump",
    name: { es: "Gamma", en: "Gamma" },
    article: { es: "una Gamma", en: "a Gamma" },
    trait: {
      es: "es positiva y asimétrica a la derecha; según su forma puede ser decreciente o tener una joroba",
      en: "is positive and right-skewed; depending on its shape it decreases from 0 or has a hump",
    },
    use: {
      es: "tiempo hasta que ocurren varios eventos; montos de reclamos de seguros",
      en: "time until several events happen; insurance claim amounts",
    },
    params: [
      {
        key: "alpha",
        tex: "\\alpha",
        role: { es: "forma: cuántos eventos se esperan", en: "shape: how many events you wait for" },
        effect: {
          es: "con $\\alpha \\le 1$ es máxima en 0; al crecer aparece una joroba cada vez más simétrica",
          en: "with $\\alpha \\le 1$ it peaks at 0; as it grows a hump appears and becomes more symmetric",
        },
      },
      {
        key: "beta",
        tex: "\\beta",
        role: { es: "tasa: la inversa de la escala", en: "rate: the inverse of the scale" },
        effect: {
          es: "comprime todo hacia el 0 (la escala es $1/\\beta$; algunos libros usan la escala $\\theta$)",
          en: "squeezes everything toward 0 (the scale is $1/\\beta$; some books use the scale $\\theta$)",
        },
      },
    ],
    shapeParams: (r) => ({ alpha: r.step(2, 5, 0.5), beta: r.step(0.6, 1.2, 0.1) }),
    sample: (r, p) => r.gamma(p.alpha, 1 / p.beta),
    density: (x, p) =>
      x <= 0 ? 0 : Math.exp(p.alpha * Math.log(p.beta) + (p.alpha - 1) * Math.log(x) - p.beta * x - lgamma(p.alpha)),
    lower: () => 0,
    mean: { right: "\\frac{\\alpha}{\\beta}", wrong: ["\\alpha\\beta", "\\frac{\\beta}{\\alpha}", "\\frac{\\alpha}{\\beta^2}"] },
    facts: [
      {
        truth: true,
        text: {
          es: "Una exponencial de tasa $\\lambda$ es una Gamma con $\\alpha = 1$ y $\\beta = \\lambda$.",
          en: "An exponential with rate $\\lambda$ is a Gamma with $\\alpha = 1$ and $\\beta = \\lambda$.",
        },
        why: {
          es: "Con $\\alpha = 1$ la densidad queda $\\beta e^{-\\beta x}$: la de la exponencial.",
          en: "With $\\alpha = 1$ the density becomes $\\beta e^{-\\beta x}$: the exponential's.",
        },
      },
      {
        truth: true,
        text: {
          es: "La suma de $\\alpha$ exponenciales independientes de tasa $\\beta$ es una Gamma$(\\alpha, \\beta)$, si $\\alpha$ es entero.",
          en: "The sum of $\\alpha$ independent exponentials with rate $\\beta$ is a Gamma$(\\alpha, \\beta)$, if $\\alpha$ is an integer.",
        },
        why: {
          es: "Por eso modela el tiempo hasta el $\\alpha$-ésimo evento (con $\\alpha$ entero también se llama Erlang).",
          en: "That's why it models the time until the $\\alpha$-th event (with integer $\\alpha$ it's also called Erlang).",
        },
      },
      {
        truth: false,
        text: {
          es: "Si aumentás $\\beta$ en una Gamma, los valores típicos se hacen más grandes.",
          en: "If you increase $\\beta$ in a Gamma, typical values get larger.",
        },
        why: {
          es: "$\\beta$ es una tasa: al aumentarla todo se comprime hacia el 0. La media $\\alpha/\\beta$ baja.",
          en: "$\\beta$ is a rate: increasing it squeezes everything toward 0. The mean $\\alpha/\\beta$ drops.",
        },
      },
    ],
    fit: {
      range: [0, 12],
      start: { alpha: 2, beta: 1 },
      grid: { alpha: [0.5, 10, 0.1], beta: [0.2, 4, 0.05] },
      target: { alpha: [1, 8], beta: [0.5, 3] },
    },
  },
  {
    id: "beta",
    kind: "continuous",
    group: "unit",
    name: { es: "Beta", en: "Beta" },
    article: { es: "una Beta", en: "a Beta" },
    trait: {
      es: "vive entre 0 y 1, nunca se sale de ese intervalo, y puede tomar muchas formas",
      en: "lives between 0 and 1, never leaves that interval, and can take many shapes",
    },
    use: { es: "proporciones y probabilidades: tasa de conversión, porcentaje de aciertos", en: "proportions and probabilities: conversion rates, hit rates" },
    params: [
      {
        key: "alpha",
        tex: "\\alpha",
        role: { es: "peso hacia el 1 (como éxitos observados)", en: "pull toward 1 (like observed successes)" },
        effect: { es: "empuja la masa hacia la derecha, hacia el 1", en: "pushes the mass right, toward 1" },
      },
      {
        key: "beta",
        tex: "\\beta",
        role: { es: "peso hacia el 0 (como fracasos observados)", en: "pull toward 0 (like observed failures)" },
        effect: { es: "empuja la masa hacia la izquierda, hacia el 0", en: "pushes the mass left, toward 0" },
      },
    ],
    shapeParams: (r) => ({ alpha: r.step(1.5, 6, 0.5), beta: r.step(1.5, 6, 0.5) }),
    sample: (r, p) => {
      const x = r.gamma(p.alpha, 1);
      return x / (x + r.gamma(p.beta, 1));
    },
    density: (x, p) =>
      x <= 0 || x >= 1 ? 0 : Math.exp((p.alpha - 1) * Math.log(x) + (p.beta - 1) * Math.log(1 - x) - lbeta(p.alpha, p.beta)),
    lower: () => 0,
    upper: () => 1,
    mean: { right: "\\frac{\\alpha}{\\alpha + \\beta}", wrong: ["\\frac{\\beta}{\\alpha + \\beta}", "\\frac{\\alpha}{\\beta}", "\\alpha\\beta"] },
    facts: [
      {
        truth: true,
        text: { es: "Una Beta$(1, 1)$ es una uniforme en $[0, 1]$.", en: "A Beta$(1, 1)$ is a uniform on $[0, 1]$." },
        why: {
          es: "Con $\\alpha = \\beta = 1$ la densidad es constante e igual a 1 en todo el intervalo.",
          en: "With $\\alpha = \\beta = 1$ the density is constant and equal to 1 on the whole interval.",
        },
      },
      {
        truth: false,
        text: { es: "Una Beta puede tomar valores mayores que 1.", en: "A Beta can take values greater than 1." },
        why: {
          es: "Su soporte es $[0, 1]$: por eso sirve para modelar proporciones.",
          en: "Its support is $[0, 1]$: that's why it models proportions.",
        },
      },
      {
        truth: true,
        text: {
          es: "Si $\\alpha = \\beta$, la Beta es simétrica alrededor de $0{,}5$.",
          en: "If $\\alpha = \\beta$, the Beta is symmetric around $0.5$.",
        },
        why: {
          es: "Los dos parámetros tiran con la misma fuerza hacia cada lado.",
          en: "Both parameters pull equally hard toward each side.",
        },
      },
    ],
    fit: {
      range: [0, 1],
      start: { alpha: 2, beta: 2 },
      grid: { alpha: [0.5, 10, 0.1], beta: [0.5, 10, 0.1] },
      target: { alpha: [0.8, 8], beta: [0.8, 8] },
    },
  },
  {
    id: "chi-square",
    kind: "continuous",
    group: "hump",
    name: { es: "Chi-cuadrado", en: "Chi-square" },
    article: { es: "una chi-cuadrado", en: "a chi-square" },
    trait: {
      es: "es positiva, con una joroba cerca de $k - 2$ y cola a la derecha que se acorta al crecer $k$",
      en: "is positive, with a hump near $k - 2$ and a right tail that shortens as $k$ grows",
    },
    use: { es: "tests de bondad de ajuste e independencia; varianzas muestrales", en: "goodness-of-fit and independence tests; sample variances" },
    params: [
      {
        key: "k",
        tex: "k",
        integer: true,
        role: { es: "grados de libertad", en: "degrees of freedom" },
        effect: {
          es: "corre la joroba a la derecha y la vuelve más simétrica (la media es $k$)",
          en: "moves the hump right and makes it more symmetric (the mean is $k$)",
        },
      },
    ],
    shapeParams: (r) => ({ k: r.int(4, 9) }),
    sample: (r, p) => chiSquare(r, p.k),
    density: (x, p) =>
      x <= 0 ? 0 : Math.exp((p.k / 2 - 1) * Math.log(x) - x / 2 - (p.k / 2) * Math.LN2 - lgamma(p.k / 2)),
    lower: () => 0,
    mean: { right: "k", wrong: ["2k", "k^2", "\\sqrt{k}"] },
    facts: [
      {
        truth: true,
        text: {
          es: "Si sumás los cuadrados de $k$ normales estándar independientes, obtenés una $\\chi^2_k$.",
          en: "If you add up the squares of $k$ independent standard normals, you get a $\\chi^2_k$.",
        },
        why: { es: "Esa es su definición, y de ahí el nombre.", en: "That's its definition, and where the name comes from." },
      },
      {
        truth: false,
        text: { es: "Una chi-cuadrado puede tomar valores negativos.", en: "A chi-square can take negative values." },
        why: { es: "Es una suma de cuadrados: siempre es mayor o igual a 0.", en: "It's a sum of squares: always 0 or more." },
      },
      {
        truth: true,
        text: {
          es: "Una $\\chi^2_k$ es una Gamma con $\\alpha = k/2$ y $\\beta = 1/2$.",
          en: "A $\\chi^2_k$ is a Gamma with $\\alpha = k/2$ and $\\beta = 1/2$.",
        },
        why: { es: "Es un caso particular de la Gamma.", en: "It's a special case of the Gamma." },
      },
    ],
    fit: {
      range: [0, 25],
      start: { k: 3 },
      grid: { k: [1, 15, 1] },
      target: { k: [2, 12] },
    },
  },
  {
    id: "student-t",
    kind: "continuous",
    group: "bell",
    name: { es: "t de Student", en: "Student's t" },
    article: { es: "una t de Student", en: "a Student's t" },
    trait: {
      es: "es simétrica como la normal, pero con colas más pesadas: aparecen más valores extremos",
      en: "is symmetric like the normal, but with heavier tails: extreme values show up more often",
    },
    use: { es: "intervalos y tests para la media cuando no se conoce $\\sigma$", en: "intervals and tests for the mean when $\\sigma$ is unknown" },
    params: [
      {
        key: "nu",
        tex: "\\nu",
        integer: true,
        role: { es: "grados de libertad", en: "degrees of freedom" },
        effect: {
          es: "adelgaza las colas: con $\\nu$ grande se parece a una normal estándar",
          en: "thins the tails: with large $\\nu$ it looks like a standard normal",
        },
      },
    ],
    shapeParams: (r) => ({ nu: r.int(2, 4) }),
    sample: (r, p) => r.normal() / Math.sqrt(chiSquare(r, p.nu) / p.nu),
    density: (x, p) =>
      Math.exp(lgamma((p.nu + 1) / 2) - lgamma(p.nu / 2) - 0.5 * Math.log(p.nu * Math.PI) - ((p.nu + 1) / 2) * Math.log(1 + (x * x) / p.nu)),
    view: [0.01, 0.99],
    mean: { right: "0", wrong: ["\\nu", "1", "\\frac{\\nu}{\\nu - 2}"] },
    facts: [
      {
        truth: true,
        text: {
          es: "Con muchos grados de libertad, la t de Student se parece a una normal estándar.",
          en: "With many degrees of freedom, Student's t looks like a standard normal.",
        },
        why: {
          es: "Al crecer $\\nu$ las colas se adelgazan; con $\\nu \\to \\infty$ es exactamente la normal estándar.",
          en: "As $\\nu$ grows the tails thin out; as $\\nu \\to \\infty$ it's exactly the standard normal.",
        },
      },
      {
        truth: false,
        text: {
          es: "La t de Student tiene colas más livianas que la normal.",
          en: "Student's t has lighter tails than the normal.",
        },
        why: {
          es: "Son más pesadas: refleja la incertidumbre extra de estimar $\\sigma$ con la muestra.",
          en: "They're heavier: it reflects the extra uncertainty of estimating $\\sigma$ from the sample.",
        },
      },
    ],
  },
  {
    id: "f",
    kind: "continuous",
    group: "hump",
    name: { es: "F de Fisher", en: "Fisher's F" },
    article: { es: "una F de Fisher", en: "a Fisher's F" },
    trait: {
      es: "es positiva y asimétrica a la derecha, con la joroba cerca de 1",
      en: "is positive and right-skewed, with its hump near 1",
    },
    use: { es: "comparar varianzas; ANOVA", en: "comparing variances; ANOVA" },
    params: [
      {
        key: "d1",
        tex: "d_1",
        integer: true,
        role: { es: "grados de libertad del numerador", en: "numerator degrees of freedom" },
        effect: { es: "aleja la joroba del 0 y la vuelve más definida", en: "moves the hump away from 0 and sharpens it" },
      },
      {
        key: "d2",
        tex: "d_2",
        integer: true,
        role: { es: "grados de libertad del denominador", en: "denominator degrees of freedom" },
        effect: { es: "acorta la cola derecha", en: "shortens the right tail" },
      },
    ],
    shapeParams: (r) => ({ d1: r.int(5, 12), d2: r.int(10, 25) }),
    sample: (r, p) => chiSquare(r, p.d1) / p.d1 / (chiSquare(r, p.d2) / p.d2),
    density: (x, p) => {
      if (x <= 0) return 0;
      const { d1, d2 } = p;
      return Math.exp(
        0.5 * (d1 * Math.log(d1 * x) + d2 * Math.log(d2) - (d1 + d2) * Math.log(d1 * x + d2)) - Math.log(x) - lbeta(d1 / 2, d2 / 2),
      );
    },
    lower: () => 0,
    mean: { right: "\\frac{d_2}{d_2 - 2}", wrong: ["\\frac{d_1}{d_1 - 2}", "\\frac{d_1}{d_2}", "\\frac{d_2}{d_1}"] },
    facts: [
      {
        truth: true,
        text: {
          es: "La F es el cociente de dos chi-cuadrado independientes, cada una dividida por sus grados de libertad.",
          en: "The F is the ratio of two independent chi-squares, each divided by its degrees of freedom.",
        },
        why: {
          es: "$F = \\frac{\\chi^2_{d_1}/d_1}{\\chi^2_{d_2}/d_2}$: por eso compara varianzas.",
          en: "$F = \\frac{\\chi^2_{d_1}/d_1}{\\chi^2_{d_2}/d_2}$: that's why it compares variances.",
        },
      },
      {
        truth: false,
        text: { es: "La F puede tomar valores negativos.", en: "The F can take negative values." },
        why: { es: "Es un cociente de cantidades positivas.", en: "It's a ratio of positive quantities." },
      },
    ],
  },
  {
    id: "weibull",
    kind: "continuous",
    group: "hump",
    name: { es: "Weibull", en: "Weibull" },
    article: { es: "una Weibull", en: "a Weibull" },
    trait: {
      es: "es positiva y muy flexible: según $k$ decrece desde 0, es exponencial o tiene una joroba",
      en: "is positive and very flexible: depending on $k$ it decreases from 0, is exponential, or has a hump",
    },
    use: { es: "vida útil de componentes y tiempos hasta una falla", en: "component lifetimes and time to failure" },
    params: [
      {
        key: "k",
        tex: "k",
        role: { es: "forma: si las fallas se aceleran o no con el tiempo", en: "shape: whether failures speed up over time" },
        effect: {
          es: "con $k < 1$ es máxima en 0, con $k = 1$ es exponencial y con $k > 1$ tiene joroba",
          en: "with $k < 1$ it peaks at 0, with $k = 1$ it's exponential and with $k > 1$ it has a hump",
        },
      },
      {
        key: "lambda",
        tex: "\\lambda",
        role: { es: "escala: vida característica", en: "scale: characteristic life" },
        effect: { es: "estira la distribución hacia la derecha", en: "stretches the distribution to the right" },
      },
    ],
    shapeParams: (r) => ({ k: r.step(1.6, 3, 0.2), lambda: r.step(2, 4, 0.5) }),
    sample: (r, p) => {
      let u = 0;
      while (u === 0) u = r.next();
      return p.lambda * Math.pow(-Math.log(u), 1 / p.k);
    },
    // x = 0 is excluded: with k < 1 the density is infinite there (a single point, no area).
    density: (x, p) => (x <= 0 ? 0 : (p.k / p.lambda) * Math.pow(x / p.lambda, p.k - 1) * Math.exp(-Math.pow(x / p.lambda, p.k))),
    lower: () => 0,
    mean: { right: "\\lambda\\,\\Gamma(1 + 1/k)", wrong: ["\\lambda / k", "k\\lambda", "\\frac{1}{\\lambda}"] },
    facts: [
      {
        truth: true,
        text: {
          es: "Una Weibull con $k = 1$ es una exponencial de tasa $1/\\lambda$.",
          en: "A Weibull with $k = 1$ is an exponential with rate $1/\\lambda$.",
        },
        why: {
          es: "Con $k = 1$ la densidad queda $\\frac{1}{\\lambda}e^{-x/\\lambda}$.",
          en: "With $k = 1$ the density becomes $\\frac{1}{\\lambda}e^{-x/\\lambda}$.",
        },
      },
      {
        truth: false,
        text: {
          es: "En la Weibull, $\\lambda$ es una tasa, igual que en la exponencial.",
          en: "In the Weibull, $\\lambda$ is a rate, just like in the exponential.",
        },
        why: {
          es: "Acá $\\lambda$ es una escala: cuanto más grande, más largos los tiempos. Misma letra, otro significado.",
          en: "Here $\\lambda$ is a scale: the larger it is, the longer the times. Same letter, different meaning.",
        },
      },
    ],
    fit: {
      range: [0, 8],
      start: { k: 1.5, lambda: 2 },
      grid: { k: [0.5, 6, 0.05], lambda: [0.5, 5, 0.05] },
      target: { k: [0.8, 5], lambda: [1, 4] },
    },
  },
  {
    id: "pareto",
    kind: "continuous",
    group: "decay",
    name: { es: "Pareto", en: "Pareto" },
    article: { es: "una Pareto", en: "a Pareto" },
    trait: {
      es: "empieza de golpe en un mínimo $x_m$ y cae con una cola muy larga a la derecha",
      en: "starts abruptly at a minimum $x_m$ and falls with a very long right tail",
    },
    use: { es: "ingresos y riqueza, tamaños de ciudades: pocos casos concentran mucho", en: "income and wealth, city sizes: a few cases hold a lot" },
    params: [
      {
        key: "xm",
        tex: "x_m",
        role: { es: "valor mínimo posible", en: "smallest possible value" },
        effect: { es: "corre el punto de arranque hacia la derecha", en: "moves the starting point to the right" },
      },
      {
        key: "alpha",
        tex: "\\alpha",
        role: { es: "índice de cola: qué tan rápido caen los extremos", en: "tail index: how fast extremes die out" },
        effect: { es: "hace que la cola caiga más rápido: menos valores extremos", en: "makes the tail fall faster: fewer extreme values" },
      },
    ],
    shapeParams: (r) => ({ xm: r.step(1, 3, 0.5), alpha: r.step(2.5, 4, 0.5) }),
    sample: (r, p) => {
      let u = 0;
      while (u === 0) u = r.next();
      return p.xm * Math.pow(u, -1 / p.alpha);
    },
    density: (x, p) => (x < p.xm ? 0 : (p.alpha * Math.pow(p.xm, p.alpha)) / Math.pow(x, p.alpha + 1)),
    lower: (p) => Math.max(0, p.xm - 0.5),
    view: [0, 0.97],
    mean: { right: "\\frac{\\alpha\\, x_m}{\\alpha - 1}", wrong: ["\\frac{x_m}{\\alpha}", "\\alpha\\, x_m", "\\frac{x_m}{\\alpha - 1}"] },
    facts: [
      {
        truth: true,
        text: {
          es: "La Pareto modela situaciones donde pocos casos concentran gran parte del total, como la riqueza.",
          en: "The Pareto models situations where a few cases hold much of the total, like wealth.",
        },
        why: { es: "De ahí viene la idea del 80/20.", en: "That's where the 80/20 idea comes from." },
      },
      {
        truth: false,
        text: { es: "Una Pareto puede tomar valores menores que $x_m$.", en: "A Pareto can take values smaller than $x_m$." },
        why: { es: "$x_m$ es justamente el mínimo: la densidad es 0 antes.", en: "$x_m$ is exactly the minimum: the density is 0 before it." },
      },
      {
        truth: true,
        text: { es: "Si $\\alpha \\le 1$, la Pareto no tiene media finita.", en: "If $\\alpha \\le 1$, the Pareto has no finite mean." },
        why: {
          es: "La cola es tan pesada que el promedio no converge.",
          en: "The tail is so heavy that the average doesn't converge.",
        },
      },
    ],
  },
  {
    id: "cauchy",
    kind: "continuous",
    group: "peak",
    name: { es: "Cauchy", en: "Cauchy" },
    article: { es: "una Cauchy", en: "a Cauchy" },
    trait: {
      es: "tiene un pico angosto y colas tan pesadas que aparecen valores extremísimos",
      en: "has a narrow peak and tails so heavy that wildly extreme values appear",
    },
    use: { es: "resonancias en física; el ejemplo clásico de que el promedio no siempre funciona", en: "resonances in physics; the classic example of averaging failing" },
    params: [
      {
        key: "x0",
        tex: "x_0",
        role: { es: "ubicación: la mediana y el pico", en: "location: the median and the peak" },
        effect: { es: "mueve el pico", en: "moves the peak" },
      },
      {
        key: "gamma",
        tex: "\\gamma",
        role: { es: "escala: la mitad del ancho a media altura", en: "scale: half the width at half height" },
        effect: { es: "baja el pico y ensancha las colas", en: "lowers the peak and widens the tails" },
      },
    ],
    shapeParams: (r) => ({ x0: r.step(-1, 1, 0.5), gamma: r.step(0.5, 1, 0.1) }),
    sample: (r, p) => p.x0 + p.gamma * Math.tan(Math.PI * (r.next() - 0.5)),
    density: (x, p) => 1 / (Math.PI * p.gamma * (1 + ((x - p.x0) / p.gamma) ** 2)),
    view: [0.04, 0.96],
    mean: { right: "NONE", wrong: ["x_0", "\\gamma", "x_0 + \\gamma"] },
    facts: [
      {
        truth: true,
        text: {
          es: "La Cauchy no tiene media: el promedio de muchas observaciones no se estabiliza.",
          en: "The Cauchy has no mean: the average of many observations never settles.",
        },
        why: {
          es: "Sus colas son tan pesadas que la integral que define la media no converge.",
          en: "Its tails are so heavy that the integral defining the mean doesn't converge.",
        },
      },
      {
        truth: false,
        text: {
          es: "Por el teorema central del límite, el promedio de muchas Cauchy se vuelve normal.",
          en: "By the central limit theorem, the average of many Cauchys becomes normal.",
        },
        why: {
          es: "El TCL necesita varianza finita. El promedio de Cauchy sigue siendo Cauchy, con la misma escala.",
          en: "The CLT needs finite variance. The average of Cauchys is still Cauchy, with the same scale.",
        },
      },
      {
        truth: true,
        text: { es: "Una t de Student con $\\nu = 1$ es una Cauchy.", en: "A Student's t with $\\nu = 1$ is a Cauchy." },
        why: { es: "Es la t con colas más pesadas posible.", en: "It's the heaviest-tailed t." },
      },
    ],
  },
  {
    id: "laplace",
    kind: "continuous",
    group: "peak",
    name: { es: "Laplace", en: "Laplace" },
    article: { es: "una Laplace", en: "a Laplace" },
    trait: {
      es: "es simétrica pero con el pico en punta, como dos exponenciales espalda con espalda",
      en: "is symmetric but with a pointed peak, like two exponentials back to back",
    },
    use: { es: "errores con saltos bruscos; ruido en privacidad diferencial", en: "errors with sudden jumps; noise in differential privacy" },
    params: [
      {
        key: "mu",
        tex: "\\mu",
        role: { es: "centro: media, mediana y moda", en: "center: mean, median and mode" },
        effect: { es: "mueve el pico", en: "moves the peak" },
      },
      {
        key: "b",
        tex: "b",
        role: { es: "escala: qué tan anchas son las colas", en: "scale: how wide the tails are" },
        effect: { es: "baja el pico y alarga las colas", en: "lowers the peak and lengthens the tails" },
      },
    ],
    shapeParams: (r) => ({ mu: r.step(-1, 1, 0.5), b: r.step(0.8, 1.4, 0.1) }),
    sample: (r, p) => {
      const u = r.next() - 0.5;
      return p.mu - p.b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u) || Number.MIN_VALUE);
    },
    density: (x, p) => Math.exp(-Math.abs(x - p.mu) / p.b) / (2 * p.b),
    mean: { right: "\\mu", wrong: ["b", "\\mu + b", "2b"] },
    facts: [
      {
        truth: true,
        text: {
          es: "La Laplace tiene el pico en punta, a diferencia de la campana redondeada de la normal.",
          en: "The Laplace has a pointed peak, unlike the rounded bell of the normal.",
        },
        why: {
          es: "Su densidad usa $|x - \\mu|$, que tiene un quiebre en $\\mu$.",
          en: "Its density uses $|x - \\mu|$, which has a kink at $\\mu$.",
        },
      },
      {
        truth: false,
        text: { es: "La Laplace es asimétrica.", en: "The Laplace is skewed." },
        why: { es: "Es simétrica alrededor de $\\mu$.", en: "It's symmetric around $\\mu$." },
      },
    ],
    fit: {
      range: [-6, 6],
      start: { mu: 0, b: 1 },
      grid: { mu: [-4, 4, 0.1], b: [0.3, 3, 0.05] },
      target: { mu: [-3, 3], b: [0.4, 2] },
    },
  },
  {
    id: "logistic",
    kind: "continuous",
    group: "bell",
    name: { es: "Logística", en: "Logistic" },
    article: { es: "una logística", en: "a logistic" },
    trait: {
      es: "es una campana simétrica muy parecida a la normal, con colas apenas más pesadas",
      en: "is a symmetric bell very much like the normal, with slightly heavier tails",
    },
    use: { es: "crecimiento con saturación; la base de la regresión logística", en: "growth with saturation; the basis of logistic regression" },
    params: [
      {
        key: "mu",
        tex: "\\mu",
        role: { es: "centro: media, mediana y moda", en: "center: mean, median and mode" },
        effect: { es: "mueve la campana", en: "moves the bell" },
      },
      {
        key: "s",
        tex: "s",
        role: { es: "escala: qué tan dispersa es", en: "scale: how spread out it is" },
        effect: { es: "la vuelve más ancha y baja", en: "makes it wider and lower" },
      },
    ],
    shapeParams: (r) => ({ mu: r.step(3, 6, 0.5), s: r.step(0.6, 1, 0.1) }),
    sample: (r, p) => {
      let u = 0;
      while (u === 0 || u === 1) u = r.next();
      return p.mu + p.s * Math.log(u / (1 - u));
    },
    density: (x, p) => {
      const z = Math.exp(-(x - p.mu) / p.s);
      return z / (p.s * (1 + z) ** 2);
    },
    mean: { right: "\\mu", wrong: ["s", "\\mu + s", "\\mu / s"] },
    facts: [
      {
        truth: true,
        text: {
          es: "La función de distribución de la logística es la curva sigmoide.",
          en: "The logistic's cumulative distribution function is the sigmoid curve.",
        },
        why: {
          es: "$F(x) = \\frac{1}{1 + e^{-(x-\\mu)/s}}$: la misma curva de la regresión logística.",
          en: "$F(x) = \\frac{1}{1 + e^{-(x-\\mu)/s}}$: the same curve as in logistic regression.",
        },
      },
      {
        truth: false,
        text: { es: "La logística solo toma valores positivos.", en: "The logistic only takes positive values." },
        why: { es: "Su soporte son todos los reales, como la normal.", en: "Its support is all real numbers, like the normal." },
      },
    ],
  },
  {
    id: "triangular",
    kind: "continuous",
    group: "triangle",
    name: { es: "Triangular", en: "Triangular" },
    article: { es: "una triangular", en: "a triangular" },
    trait: {
      es: "sube en línea recta hasta un pico y baja en línea recta: tiene forma de triángulo",
      en: "rises in a straight line to a peak and falls in a straight line: a triangle",
    },
    use: { es: "estimaciones con mínimo, valor más probable y máximo (por ejemplo, plazos de proyectos)", en: "estimates with a minimum, a most likely value and a maximum (e.g. project durations)" },
    params: [
      {
        key: "a",
        tex: "a",
        role: { es: "valor mínimo", en: "minimum value" },
        effect: { es: "corre el extremo izquierdo", en: "moves the left end" },
      },
      {
        key: "c",
        tex: "c",
        role: { es: "moda: el valor más probable", en: "mode: the most likely value" },
        effect: { es: "mueve el pico del triángulo", en: "moves the triangle's peak" },
      },
      {
        key: "b",
        tex: "b",
        role: { es: "valor máximo", en: "maximum value" },
        effect: { es: "corre el extremo derecho", en: "moves the right end" },
      },
    ],
    shapeParams: (r) => {
      const a = r.step(1, 3, 0.5);
      const b = a + r.step(5, 7, 0.5);
      return { a, b, c: a + (b - a) * r.step(0.25, 0.75, 0.05) };
    },
    sample: (r, p) => {
      const u = r.next();
      const f = (p.c - p.a) / (p.b - p.a);
      return u < f ? p.a + Math.sqrt(u * (p.b - p.a) * (p.c - p.a)) : p.b - Math.sqrt((1 - u) * (p.b - p.a) * (p.b - p.c));
    },
    density: (x, p) => {
      if (x < p.a || x > p.b) return 0;
      return x < p.c ? (2 * (x - p.a)) / ((p.b - p.a) * (p.c - p.a)) : (2 * (p.b - x)) / ((p.b - p.a) * (p.b - p.c));
    },
    lower: (p) => p.a - 0.5,
    upper: (p) => p.b + 0.5,
    valid: (p) => p.a < p.c && p.c < p.b,
    mean: { right: "\\frac{a + b + c}{3}", wrong: ["\\frac{a + b}{2}", "c", "\\frac{a + b + c}{2}"] },
    facts: [
      {
        truth: true,
        text: { es: "En una triangular, la moda es $c$.", en: "In a triangular, the mode is $c$." },
        why: { es: "$c$ es la punta del triángulo: el valor con mayor densidad.", en: "$c$ is the tip of the triangle: the value with the highest density." },
      },
      {
        truth: false,
        text: { es: "Una triangular siempre es simétrica.", en: "A triangular is always symmetric." },
        why: {
          es: "Solo es simétrica si $c$ está justo en el medio de $a$ y $b$.",
          en: "It's only symmetric if $c$ is right between $a$ and $b$.",
        },
      },
    ],
  },
  {
    id: "gumbel",
    kind: "continuous",
    group: "hump",
    name: { es: "Gumbel", en: "Gumbel" },
    article: { es: "una Gumbel", en: "a Gumbel" },
    trait: {
      es: "es una joroba levemente asimétrica, con la cola derecha más larga que la izquierda",
      en: "is a slightly skewed hump, with a longer right tail than left",
    },
    use: { es: "máximos: la crecida anual más alta de un río, la peor tormenta del año", en: "maxima: a river's highest yearly flood, the worst storm of the year" },
    params: [
      {
        key: "mu",
        tex: "\\mu",
        role: { es: "ubicación: la moda", en: "location: the mode" },
        effect: { es: "mueve la joroba", en: "moves the hump" },
      },
      {
        key: "beta",
        tex: "\\beta",
        role: { es: "escala: qué tan dispersa es", en: "scale: how spread out it is" },
        effect: { es: "la ensancha y alarga la cola derecha", en: "widens it and lengthens the right tail" },
      },
    ],
    shapeParams: (r) => ({ mu: r.step(2, 4, 0.5), beta: r.step(1, 1.6, 0.1) }),
    sample: (r, p) => {
      let u = 0;
      while (u === 0) u = r.next();
      return p.mu - p.beta * Math.log(-Math.log(u));
    },
    density: (x, p) => {
      const z = (x - p.mu) / p.beta;
      return Math.exp(-(z + Math.exp(-z))) / p.beta;
    },
    facts: [
      {
        truth: true,
        text: {
          es: "La Gumbel se usa para modelar máximos, como la crecida más alta del año de un río.",
          en: "The Gumbel is used to model maxima, like a river's highest flood of the year.",
        },
        why: {
          es: "Es una de las distribuciones de valores extremos: aparece como límite del máximo de muchas variables.",
          en: "It's one of the extreme value distributions: it shows up as the limit of the maximum of many variables.",
        },
      },
      {
        truth: false,
        text: { es: "La Gumbel es simétrica.", en: "The Gumbel is symmetric." },
        why: { es: "Tiene la cola derecha más larga: es asimétrica a la derecha.", en: "Its right tail is longer: it's right-skewed." },
      },
    ],
  },
  {
    id: "rayleigh",
    kind: "continuous",
    group: "hump",
    name: { es: "Rayleigh", en: "Rayleigh" },
    article: { es: "una Rayleigh", en: "a Rayleigh" },
    trait: {
      es: "arranca en 0, sube rápido a una joroba y tiene una cola derecha moderada",
      en: "starts at 0, rises quickly to a hump and has a moderate right tail",
    },
    use: { es: "velocidad del viento; distancia de un disparo al centro del blanco", en: "wind speed; distance of a shot from the bullseye" },
    params: [
      {
        key: "sigma",
        tex: "\\sigma",
        role: { es: "escala: el valor más probable (la moda)", en: "scale: the most likely value (the mode)" },
        effect: { es: "estira todo hacia la derecha", en: "stretches everything to the right" },
      },
    ],
    shapeParams: (r) => ({ sigma: r.step(1, 2.5, 0.25) }),
    sample: (r, p) => {
      let u = 0;
      while (u === 0) u = r.next();
      return p.sigma * Math.sqrt(-2 * Math.log(u));
    },
    density: (x, p) => (x < 0 ? 0 : (x / p.sigma ** 2) * Math.exp(-(x * x) / (2 * p.sigma ** 2))),
    lower: () => 0,
    mean: { right: "\\sigma\\sqrt{\\pi/2}", wrong: ["\\sigma", "\\sigma^2", "\\sqrt{\\sigma}"] },
    facts: [
      {
        truth: true,
        text: {
          es: "Si $X$ e $Y$ son normales independientes con media 0 y el mismo $\\sigma$, $\\sqrt{X^2 + Y^2}$ es Rayleigh.",
          en: "If $X$ and $Y$ are independent normals with mean 0 and the same $\\sigma$, $\\sqrt{X^2 + Y^2}$ is Rayleigh.",
        },
        why: {
          es: "Es la distancia al origen de un punto con coordenadas normales: por eso modela el error de un disparo.",
          en: "It's the distance from the origin of a point with normal coordinates: that's why it models a shot's error.",
        },
      },
      {
        truth: false,
        text: { es: "La Rayleigh puede tomar valores negativos.", en: "The Rayleigh can take negative values." },
        why: { es: "Es una distancia: siempre es mayor o igual a 0.", en: "It's a distance: always 0 or more." },
      },
    ],
    fit: {
      range: [0, 8],
      start: { sigma: 1 },
      grid: { sigma: [0.3, 3, 0.05] },
      target: { sigma: [0.6, 2.6] },
    },
  },
];
