import katex from "katex";
import { Fragment, useMemo, type ReactNode } from "react";

/** Renders a TeX expression inline. Only used with strings written in our code. */
export function Tex({ children, className }: { children: string; className?: string }) {
  const html = useMemo(
    () => katex.renderToString(children, { throwOnError: false, output: "html" }),
    [children],
  );
  return <span className={className ? `tex ${className}` : "tex"} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Plain text with inline math between `$...$` and emphasis between `**...**`.
 * Punctuation right after a short formula sticks to it, so a line never
 * starts with a lone "?" or ",". Long formulas can't wrap, so they get their
 * own box that scrolls sideways on its own instead of widening the page.
 */
const LONG_TEX = 36;

export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g).filter(Boolean);
  const out: ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith("$") && part.endsWith("$")) {
      const tex = part.slice(1, -1);
      if (tex.length > LONG_TEX) {
        out.push(<Tex key={i} className="is-long">{tex}</Tex>);
        continue;
      }
      const next = parts[i + 1] ?? "";
      const glued = /^[.,;:?!)]+/.exec(next)?.[0] ?? "";
      if (glued) parts[i + 1] = next.slice(glued.length);
      out.push(
        glued ? (
          <span key={i} className="nowrap">
            <Tex>{part.slice(1, -1)}</Tex>
            {glued}
          </span>
        ) : (
          <Tex key={i}>{part.slice(1, -1)}</Tex>
        ),
      );
    } else if (part.startsWith("**") && part.endsWith("**")) out.push(<strong key={i}>{part.slice(2, -2)}</strong>);
    else if (part) out.push(<Fragment key={i}>{part}</Fragment>);
  }
  return <>{out}</>;
}
