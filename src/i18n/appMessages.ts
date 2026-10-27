import { defineMessages } from "../core/i18n";

type N = { n: number };
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const appMessages = defineMessages(
  {
    "home.progress": "Tu progreso",
    "home.streak.title": "Días seguidos practicando",
    "home.streak": (v: N) => plural(v.n, "día", "días"),
    "home.xp.title": "Experiencia total",
    "home.hero.title": "Estadística a ojo.",
    "home.hero.body": "Mirá un gráfico, estimá, ajustá. Si le errás, te mostramos por qué.",
    "home.cta.start": (v: { lesson: string }) => `Empezar con ${v.lesson}`,
    "home.cta.continue": (v: { lesson: string }) => `Seguir con ${v.lesson}`,
    "home.cta.review": "Practicar el repaso",
    "home.path": "El camino",
    "home.map": "Tu mapa",
    "home.mapCount": (v: { done: number; total: number }) => `${v.done} de ${v.total} lecciones completadas`,
    "home.start": "Empezar",
    "home.again": "Repetir",
    "home.status.done": "Completada",
    "home.status.open": "Disponible",
    "home.status.locked": "Bloqueada",
    "home.requires": (v: { list: string }) => `Se desbloquea al terminar ${v.list}.`,
    "home.lesson.done": (v: { pct: number }) => `Completada. Mejor resultado: ${v.pct}% a la primera.`,
    "home.lesson.count": (v: N) => plural(v.n, "ejercicio", "ejercicios"),
    "home.lesson.locked": (v: { lesson: string }) => `Se desbloquea al terminar ${v.lesson}`,

    "lesson.exit": "Salir de la lección",
    "lesson.progress": "Progreso de la lección",
    "lesson.check": "Comprobar",
    "lesson.continue": "Continuar",
    "lesson.reviewTag": "Repaso",
    "lesson.review.title": "Volvamos a lo que se escapó",
    "lesson.review.body": (v: N) =>
      v.n === 1
        ? "Te espera 1 ejercicio parecido al que fallaste. Es una variante nueva, no el mismo."
        : `Te esperan ${v.n} ejercicios parecidos a los que fallaste. Son variantes nuevas, no los mismos.`,
    "lesson.review.start": "Empezar el repaso",

    "summary.title": (v: { lesson: string }) => `${v.lesson}: terminada`,
    "summary.perfect": "Sin errores. Impecable.",
    "summary.good": "Buen trabajo. Lo que fallaste ya lo repasaste.",
    "summary.hard": "Costó, pero la repetición es lo que hace que quede.",
    "summary.firstTry": "Primera vez",
    "summary.xp": "Experiencia",
    "summary.streak": "Racha",
    "summary.home": "Volver al camino",
    "summary.again": "Repetir con ejercicios nuevos",

    "chart.tooltip": (v: { count: number; total: number; pct: number }) => `${v.count} de ${v.total} (${v.pct}%)`,

    "settings.open": "Ajustes",
    "settings.title": "Ajustes",
    "settings.close": "Cerrar ajustes",
    "settings.language": "Idioma",
    "settings.theme": "Tema",
    "settings.theme.system": "Sistema",
    "settings.theme.light": "Claro",
    "settings.theme.dark": "Oscuro",
  },
  {
    "home.progress": "Your progress",
    "home.streak.title": "Days in a row",
    "home.streak": (v: N) => plural(v.n, "day", "days"),
    "home.xp.title": "Total experience",
    "home.hero.title": "Statistics by eye.",
    "home.hero.body": "Look at a chart, estimate, adjust. If you miss, we'll show you why.",
    "home.cta.start": (v: { lesson: string }) => `Start with ${v.lesson}`,
    "home.cta.continue": (v: { lesson: string }) => `Continue with ${v.lesson}`,
    "home.cta.review": "Practice the review",
    "home.path": "The path",
    "home.map": "Your map",
    "home.mapCount": (v: { done: number; total: number }) => `${v.done} of ${v.total} lessons completed`,
    "home.start": "Start",
    "home.again": "Practice again",
    "home.status.done": "Completed",
    "home.status.open": "Available",
    "home.status.locked": "Locked",
    "home.requires": (v: { list: string }) => `Unlocks after ${v.list}.`,
    "home.lesson.done": (v: { pct: number }) => `Completed. Best: ${v.pct}% on the first try.`,
    "home.lesson.count": (v: N) => plural(v.n, "exercise", "exercises"),
    "home.lesson.locked": (v: { lesson: string }) => `Unlocks after ${v.lesson}`,

    "lesson.exit": "Leave lesson",
    "lesson.progress": "Lesson progress",
    "lesson.check": "Check",
    "lesson.continue": "Continue",
    "lesson.reviewTag": "Review",
    "lesson.review.title": "Let's revisit what slipped",
    "lesson.review.body": (v: N) =>
      v.n === 1
        ? "1 exercise like the one you missed is coming up. It's a new variant, not the same one."
        : `${v.n} exercises like the ones you missed are coming up. They're new variants, not the same ones.`,
    "lesson.review.start": "Start the review",

    "summary.title": (v: { lesson: string }) => `${v.lesson}: done`,
    "summary.perfect": "No mistakes. Flawless.",
    "summary.good": "Nice work. You already reviewed what you missed.",
    "summary.hard": "That was tough, but repetition is what makes it stick.",
    "summary.firstTry": "First try",
    "summary.xp": "Experience",
    "summary.streak": "Streak",
    "summary.home": "Back to the path",
    "summary.again": "Retry with new exercises",

    "chart.tooltip": (v: { count: number; total: number; pct: number }) => `${v.count} of ${v.total} (${v.pct}%)`,

    "settings.open": "Settings",
    "settings.title": "Settings",
    "settings.close": "Close settings",
    "settings.language": "Language",
    "settings.theme": "Theme",
    "settings.theme.system": "System",
    "settings.theme.light": "Light",
    "settings.theme.dark": "Dark",
  },
);
