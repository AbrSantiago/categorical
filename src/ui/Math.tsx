import katex from "katex";
import { Fragment, useMemo } from "react";

/** Renders a TeX expression inline. Only used with strings written in our code. */
export function Tex({ children }: { children: string }) {
  const html = useMemo(
    () => katex.renderToString(children, { throwOnError: false, output: "html" }),
    [children],
  );
  return <span className="tex" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Plain text with inline math between `$...$` and emphasis between `**...**`. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("$") && part.endsWith("$")) return <Tex key={i}>{part.slice(1, -1)}</Tex>;
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
