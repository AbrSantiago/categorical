import { lchoose, lgamma } from "../core/special";
import type { Rng } from "../core/random";
import type { DistDef } from "./types";

const bernoulliDraw = (r: Rng, p: number) => (r.next() < p ? 1 : 0);

/** Number of trials up to and including the first success. */
const geometricDraw = (r: Rng, p: number) => {
  let u = 0;
  while (u === 0) u = r.next();
  return Math.max(1, Math.ceil(Math.log(u) / Math.log(1 - p)));
};

export const discrete: DistDef[] = [
  {
    id: "poisson",
    kind: "discrete",
    group: "d-skew",
    name: { es: "Poisson", en: "Poisson" },
    article: { es: "una Poisson", en: "a Poisson" },
    trait: {
      es: "es discreta: solo toma enteros desde 0, porque cuenta eventos, y es asimétrica a la derecha si $\\lambda$ es chico",
      en: "is discrete: it only takes whole numbers from 0, because it counts events, and is right-skewed for small $\\lambda$",
    },
    use: { es: "conteos: llamadas por hora, goles por partido, errores por página", en: "counts: calls per hour, goals per match, typos per page" },
    params: [
      {
        key: "lambda",
        tex: "\\lambda",
        role: { es: "promedio de eventos por intervalo", en: "average number of events per interval" },
        effect: {
          es: "corre la masa a la derecha y la vuelve más simétrica (la media y la varianza son $\\lambda$)",
          en: "moves the mass right and makes it more symmetric (mean and variance are both $\\lambda$)",
        },
      },
    ],
    shapeParams: (r) => ({ lambda: r.step(1.5, 4, 0.5) }),
    sample: (r, p) => r.poisson(p.lambda),
    density: (k, p) => (k < 0 || !Number.isInteger(k) ? 0 : Math.exp(-p.lambda + k * Math.log(p.lambda) - lgamma(k + 1))),
    mean: { right: "\\lambda", wrong: ["\\sqrt{\\lambda}", "\\frac{1}{\\lambda}", "\\lambda^2"] },
    facts: [
      {
        truth: true,
        text: { es: "En una Poisson, la media y la varianza son iguales.", en: "In a Poisson, the mean and the variance are equal." },
        why: { es: "Las dos valen $\\lambda$.", en: "Both equal $\\lambda$." },
      },
      {
        truth: false,
        text: { es: "Una Poisson puede tomar el valor $2{,}5$.", en: "A Poisson can take the value $2.5$." },
        why: { es: "Cuenta eventos: solo toma enteros 0, 1, 2, …", en: "It counts events: it only takes whole numbers 0, 1, 2, …" },
      },
      {
        truth: true,
        text: {
          es: "Una binomial con $n$ grande y $p$ chico se parece a una Poisson con $\\lambda = np$.",
          en: "A binomial with large $n$ and small $p$ looks like a Poisson with $\\lambda = np$.",
        },
        why: {
          es: "Es la aproximación de Poisson a la binomial: muchos intentos, cada uno poco probable.",
          en: "It's the Poisson approximation to the binomial: many attempts, each unlikely.",
        },
      },
    ],
    fit: {
      range: [0, 20],
      start: { lambda: 3 },
      grid: { lambda: [0.5, 15, 0.1] },
      target: { lambda: [1, 12] },
    },
  },
  {
    id: "binomial",
    kind: "discrete",
    group: "d-bell",
    name: { es: "Binomial", en: "Binomial" },
    article: { es: "una binomial", en: "a binomial" },
    trait: {
      es: "es discreta, va de 0 a $n$ y con $p$ cerca de $0{,}5$ forma una campana de barras",
      en: "is discrete, goes from 0 to $n$ and with $p$ near $0.5$ makes a bell of bars",
    },
    use: { es: "cantidad de éxitos en $n$ intentos: caras en 10 tiradas, aprobados en un curso", en: "number of successes in $n$ tries: heads in 10 flips, passes in a class" },
    params: [
      {
        key: "n",
        tex: "n",
        integer: true,
        role: { es: "cantidad de ensayos", en: "number of trials" },
        effect: { es: "agrega valores posibles y corre la masa a la derecha", en: "adds possible values and moves the mass right" },
      },
      {
        key: "p",
        tex: "p",
        role: { es: "probabilidad de éxito en cada ensayo", en: "probability of success in each trial" },
        effect: { es: "corre la masa hacia $n$; con $p = 0{,}5$ es simétrica", en: "moves the mass toward $n$; with $p = 0.5$ it's symmetric" },
      },
    ],
    shapeParams: (r) => ({ n: r.int(14, 20), p: r.step(0.4, 0.6, 0.05) }),
    sample: (r, p) => {
      let s = 0;
      for (let i = 0; i < p.n; i++) s += bernoulliDraw(r, p.p);
      return s;
    },
    density: (k, p) =>
      k < 0 || k > p.n || !Number.isInteger(k)
        ? 0
        : Math.exp(lchoose(p.n, k) + k * Math.log(p.p) + (p.n - k) * Math.log(1 - p.p)),
    mean: { right: "np", wrong: ["\\frac{n}{p}", "n(1-p)", "p"] },
    facts: [
      {
        truth: true,
        text: { es: "Una binomial con $p = 0{,}5$ es simétrica.", en: "A binomial with $p = 0.5$ is symmetric." },
        why: { es: "Éxitos y fracasos son igual de probables, así que $k$ y $n - k$ tienen la misma probabilidad.", en: "Successes and failures are equally likely, so $k$ and $n - k$ have the same probability." },
      },
      {
        truth: false,
        text: { es: "Una binomial puede tomar valores mayores que $n$.", en: "A binomial can take values greater than $n$." },
        why: { es: "No puede haber más éxitos que ensayos.", en: "There can't be more successes than trials." },
      },
      {
        truth: true,
        text: { es: "La varianza de una binomial es $np(1-p)$.", en: "The variance of a binomial is $np(1-p)$." },
        why: { es: "Es la suma de $n$ Bernoulli independientes, cada una con varianza $p(1-p)$.", en: "It's the sum of $n$ independent Bernoullis, each with variance $p(1-p)$." },
      },
    ],
    fit: {
      range: [0, 20],
      start: { n: 10, p: 0.5 },
      grid: { n: [1, 20, 1], p: [0.05, 0.95, 0.01] },
      target: { n: [5, 20], p: [0.15, 0.85] },
    },
  },
  {
    id: "bernoulli",
    kind: "discrete",
    group: "d-binary",
    name: { es: "Bernoulli", en: "Bernoulli" },
    article: { es: "una Bernoulli", en: "a Bernoulli" },
    trait: {
      es: "solo toma dos valores, 0 y 1: hay exactamente dos barras",
      en: "only takes two values, 0 and 1: there are exactly two bars",
    },
    use: { es: "un único intento con éxito o fracaso: una moneda, un clic", en: "a single try that succeeds or fails: a coin, a click" },
    params: [
      {
        key: "p",
        tex: "p",
        role: { es: "probabilidad de que salga 1 (éxito)", en: "probability of getting 1 (success)" },
        effect: { es: "sube la barra del 1 y baja la del 0", en: "raises the bar at 1 and lowers the one at 0" },
      },
    ],
    shapeParams: (r) => ({ p: r.step(0.2, 0.8, 0.05) }),
    sample: (r, p) => bernoulliDraw(r, p.p),
    density: (k, p) => (k === 1 ? p.p : k === 0 ? 1 - p.p : 0),
    mean: { right: "p", wrong: ["1 - p", "p(1-p)", "\\frac{1}{p}"] },
    facts: [
      {
        truth: true,
        text: { es: "Una Bernoulli es una binomial con $n = 1$.", en: "A Bernoulli is a binomial with $n = 1$." },
        why: { es: "Es un único ensayo: 1 si hay éxito y 0 si no.", en: "It's a single trial: 1 for success and 0 otherwise." },
      },
      {
        truth: false,
        text: { es: "Una Bernoulli puede tomar tres valores distintos.", en: "A Bernoulli can take three different values." },
        why: { es: "Solo toma 0 o 1.", en: "It only takes 0 or 1." },
      },
    ],
  },
  {
    id: "geometric",
    kind: "discrete",
    group: "d-decay",
    name: { es: "Geométrica", en: "Geometric" },
    article: { es: "una geométrica", en: "a geometric" },
    trait: {
      es: "es discreta y decrece desde el principio: el valor más probable es el primero",
      en: "is discrete and decreases from the start: the most likely value is the first",
    },
    use: {
      es: "cuántos intentos hacen falta hasta el primer éxito (acá contamos el intento exitoso)",
      en: "how many tries until the first success (here we count the successful try)",
    },
    params: [
      {
        key: "p",
        tex: "p",
        role: { es: "probabilidad de éxito en cada intento", en: "probability of success on each try" },
        effect: { es: "hace que el éxito llegue antes: la masa se concentra en 1", en: "makes success come sooner: the mass piles up at 1" },
      },
    ],
    shapeParams: (r) => ({ p: r.step(0.2, 0.4, 0.05) }),
    sample: (r, p) => geometricDraw(r, p.p),
    density: (k, p) => (k < 1 || !Number.isInteger(k) ? 0 : (1 - p.p) ** (k - 1) * p.p),
    mean: { right: "\\frac{1}{p}", wrong: ["p", "1 - p", "\\frac{1}{1 - p}"] },
    facts: [
      {
        truth: true,
        text: {
          es: "La geométrica no tiene memoria, como la exponencial pero en versión discreta.",
          en: "The geometric is memoryless, like the exponential but discrete.",
        },
        why: {
          es: "Haber fallado varias veces no cambia la probabilidad de los próximos intentos.",
          en: "Having failed several times doesn't change the odds of the next tries.",
        },
      },
      {
        truth: false,
        text: {
          es: "En una geométrica, el valor más probable está en el medio.",
          en: "In a geometric, the most likely value is in the middle.",
        },
        why: {
          es: "El más probable es el primero: lograrlo al primer intento tiene probabilidad $p$, y cada intento más multiplica por $1 - p$.",
          en: "The most likely is the first: succeeding on the first try has probability $p$, and each extra try multiplies by $1 - p$.",
        },
      },
    ],
    fit: {
      range: [1, 20],
      start: { p: 0.5 },
      grid: { p: [0.05, 0.95, 0.01] },
      target: { p: [0.1, 0.8] },
    },
  },
  {
    id: "negative-binomial",
    kind: "discrete",
    group: "d-skew",
    name: { es: "Binomial negativa", en: "Negative binomial" },
    article: { es: "una binomial negativa", en: "a negative binomial" },
    trait: {
      es: "es discreta y asimétrica a la derecha, parecida a una Poisson pero más dispersa",
      en: "is discrete and right-skewed, like a Poisson but more spread out",
    },
    use: {
      es: "cuántos fracasos hay antes de juntar $r$ éxitos; conteos con más variabilidad que una Poisson",
      en: "how many failures happen before collecting $r$ successes; counts noisier than a Poisson",
    },
    params: [
      {
        key: "r",
        tex: "r",
        integer: true,
        role: { es: "cantidad de éxitos que hay que juntar", en: "number of successes to collect" },
        effect: { es: "acumula más fracasos: corre la masa a la derecha y la vuelve más simétrica", en: "piles up more failures: moves the mass right and makes it more symmetric" },
      },
      {
        key: "p",
        tex: "p",
        role: { es: "probabilidad de éxito en cada intento", en: "probability of success on each try" },
        effect: { es: "hace que haya menos fracasos antes de llegar a $r$ éxitos", en: "means fewer failures before reaching $r$ successes" },
      },
    ],
    shapeParams: (r) => ({ r: r.int(2, 4), p: r.step(0.3, 0.45, 0.05) }),
    sample: (r, p) => {
      let failures = 0;
      for (let i = 0; i < p.r; i++) failures += geometricDraw(r, p.p) - 1;
      return failures;
    },
    density: (k, p) =>
      k < 0 || !Number.isInteger(k) ? 0 : Math.exp(lchoose(k + p.r - 1, k) + p.r * Math.log(p.p) + k * Math.log(1 - p.p)),
    mean: { right: "\\frac{r(1-p)}{p}", wrong: ["rp", "r(1-p)", "\\frac{r}{1-p}"] },
    facts: [
      {
        truth: true,
        text: {
          es: "Con $r = 1$, la binomial negativa cuenta los fracasos antes del primer éxito, como una geométrica.",
          en: "With $r = 1$, the negative binomial counts the failures before the first success, like a geometric.",
        },
        why: {
          es: "La geométrica es su caso particular; solo cambia si se cuenta o no el intento exitoso.",
          en: "The geometric is its special case; the only difference is whether the successful try is counted.",
        },
      },
      {
        truth: false,
        text: {
          es: "En la binomial negativa, la cantidad de intentos está fija de antemano.",
          en: "In the negative binomial, the number of tries is fixed in advance.",
        },
        why: {
          es: "Lo fijo es la cantidad de éxitos $r$; lo aleatorio es cuántos intentos hacen falta. En la binomial es al revés.",
          en: "What's fixed is the number of successes $r$; the number of tries is random. In the binomial it's the other way around.",
        },
      },
    ],
    fit: {
      range: [0, 30],
      start: { r: 3, p: 0.5 },
      grid: { r: [1, 15, 1], p: [0.1, 0.9, 0.01] },
      target: { r: [1, 10], p: [0.3, 0.8] },
    },
  },
  {
    id: "hypergeometric",
    kind: "discrete",
    group: "d-bell",
    name: { es: "Hipergeométrica", en: "Hypergeometric" },
    article: { es: "una hipergeométrica", en: "a hypergeometric" },
    trait: {
      es: "es discreta y con forma de campana de barras, parecida a una binomial pero algo más angosta",
      en: "is discrete and bell-shaped, like a binomial but a bit narrower",
    },
    use: {
      es: "éxitos al sacar sin reposición: cartas de corazones en una mano, piezas defectuosas en una muestra",
      en: "successes when drawing without replacement: hearts in a hand of cards, defective parts in a sample",
    },
    params: [
      {
        key: "N",
        tex: "N",
        integer: true,
        role: { es: "tamaño de la población", en: "population size" },
        effect: { es: "con $K$ y $n$ fijos, hace que haya menos éxitos esperados", en: "with $K$ and $n$ fixed, means fewer expected successes" },
      },
      {
        key: "K",
        tex: "K",
        integer: true,
        role: { es: "cantidad de éxitos en la población", en: "number of successes in the population" },
        effect: { es: "corre la masa a la derecha", en: "moves the mass right" },
      },
      {
        key: "n",
        tex: "n",
        integer: true,
        role: { es: "tamaño de la muestra, sin reposición", en: "sample size, without replacement" },
        effect: { es: "agrega valores posibles", en: "adds possible values" },
      },
    ],
    shapeParams: (r) => {
      const N = r.int(40, 60);
      return { N, K: Math.round(N * r.step(0.4, 0.6, 0.05)), n: r.int(14, 20) };
    },
    sample: (r, p) => {
      let successes = p.K;
      let total = p.N;
      let k = 0;
      for (let i = 0; i < p.n; i++) {
        if (r.next() < successes / total) {
          k++;
          successes--;
        }
        total--;
      }
      return k;
    },
    density: (k, p) => {
      if (!Number.isInteger(k) || k < Math.max(0, p.n - (p.N - p.K)) || k > Math.min(p.n, p.K)) return 0;
      return Math.exp(lchoose(p.K, k) + lchoose(p.N - p.K, p.n - k) - lchoose(p.N, p.n));
    },
    mean: { right: "\\frac{nK}{N}", wrong: ["\\frac{nN}{K}", "\\frac{K}{N}", "\\frac{n}{N}"] },
    facts: [
      {
        truth: true,
        text: { es: "La hipergeométrica modela extracciones sin reposición.", en: "The hypergeometric models draws without replacement." },
        why: {
          es: "Cada extracción cambia lo que queda en la población.",
          en: "Each draw changes what's left in the population.",
        },
      },
      {
        truth: false,
        text: {
          es: "En la hipergeométrica, la probabilidad de éxito es la misma en cada extracción.",
          en: "In the hypergeometric, the probability of success is the same on every draw.",
        },
        why: {
          es: "Cambia, porque no hay reposición. Si la población es muy grande, el cambio es chico y se parece a una binomial.",
          en: "It changes, because there's no replacement. With a very large population the change is small and it looks like a binomial.",
        },
      },
    ],
  },
  {
    id: "discrete-uniform",
    kind: "discrete",
    group: "d-flat",
    name: { es: "Uniforme discreta", en: "Discrete uniform" },
    article: { es: "una uniforme discreta", en: "a discrete uniform" },
    trait: {
      es: "tiene todas las barras de la misma altura, entre un mínimo y un máximo",
      en: "has all its bars at the same height, between a minimum and a maximum",
    },
    use: { es: "un dado justo; elegir un número entero al azar", en: "a fair die; picking a whole number at random" },
    params: [
      {
        key: "a",
        tex: "a",
        integer: true,
        role: { es: "menor valor posible", en: "smallest possible value" },
        effect: { es: "corre el primer valor y baja las barras", en: "moves the first value and lowers the bars" },
      },
      {
        key: "b",
        tex: "b",
        integer: true,
        role: { es: "mayor valor posible", en: "largest possible value" },
        effect: { es: "agrega valores a la derecha y baja las barras", en: "adds values on the right and lowers the bars" },
      },
    ],
    shapeParams: (r) => {
      const a = r.int(1, 3);
      return { a, b: a + r.int(5, 9) };
    },
    sample: (r, p) => r.int(p.a, p.b),
    density: (k, p) => (Number.isInteger(k) && k >= p.a && k <= p.b ? 1 / (p.b - p.a + 1) : 0),
    valid: (p) => p.b > p.a,
    mean: { right: "\\frac{a+b}{2}", wrong: ["b - a", "\\frac{b-a}{2}", "a + b"] },
    facts: [
      {
        truth: true,
        text: {
          es: "Un dado justo sigue una uniforme discreta en $\\{1, \\dots, 6\\}$.",
          en: "A fair die follows a discrete uniform on $\\{1, \\dots, 6\\}$.",
        },
        why: { es: "Cada cara tiene probabilidad $1/6$.", en: "Each face has probability $1/6$." },
      },
      {
        truth: false,
        text: {
          es: "En una uniforme discreta en $\\{1, \\dots, 6\\}$, el 3 es más probable que el 6.",
          en: "In a discrete uniform on $\\{1, \\dots, 6\\}$, 3 is more likely than 6.",
        },
        why: { es: "Todos los valores tienen la misma probabilidad.", en: "Every value has the same probability." },
      },
    ],
  },
];
