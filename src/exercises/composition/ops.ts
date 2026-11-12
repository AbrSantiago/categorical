import { plusTex, type NumTex } from "../../functions";

/**
 * One-step functions to chain: f(x) and g(x) are each a single operation on
 * x, so f(g(x)) is a substitution you can see, not algebra to grind.
 */
export type OpId = "add" | "mul" | "square" | "sqrt" | "abs" | "recip" | "exp";
export interface Op {
  id: OpId;
  c: number;
}

export interface Expr {
  tex: string;
  kind: "atom" | "sum" | "product" | "power" | "fn" | "frac" | "exp";
}

export const X: Expr = { tex: "x", kind: "atom" };

export function applyTex(op: Op, u: Expr, num: NumTex): Expr {
  const wrapped = u.kind === "atom" ? u.tex : `(${u.tex})`;
  switch (op.id) {
    case "add":
      return { tex: `${u.tex}${plusTex(op.c, num)}`, kind: "sum" };
    case "mul":
      return {
        tex: u.kind === "sum" || u.kind === "frac" ? `${num(op.c)}(${u.tex})` : u.kind === "exp" || u.kind === "product" ? `${num(op.c)}\\cdot ${u.tex}` : `${num(op.c)}${u.tex}`,
        kind: "product",
      };
    case "square":
      return { tex: u.kind === "fn" ? `${u.tex}^2` : `${wrapped}^2`, kind: "power" };
    case "sqrt":
      return { tex: `\\sqrt{${u.tex}}`, kind: "fn" };
    case "abs":
      return { tex: `\\lvert ${u.tex}\\rvert`, kind: "fn" };
    case "recip":
      return { tex: `\\frac{1}{${u.tex}}`, kind: "frac" };
    case "exp":
      return { tex: `2^{${u.tex}}`, kind: "exp" };
  }
}

export function applyOp(op: Op, u: number): number {
  switch (op.id) {
    case "add":
      return u + op.c;
    case "mul":
      return op.c * u;
    case "square":
      return u * u;
    case "sqrt":
      return u >= 0 ? Math.sqrt(u) : NaN;
    case "abs":
      return Math.abs(u);
    case "recip":
      return u === 0 ? NaN : 1 / u;
    case "exp":
      return 2 ** u;
  }
}

/** The product f(x)·g(x), with parentheses where they're needed. */
export function productTex(a: Expr, b: Expr): string {
  const wrap = (e: Expr) => (e.kind === "sum" ? `(${e.tex})` : e.tex);
  return `${wrap(a)}\\cdot ${wrap(b)}`;
}
