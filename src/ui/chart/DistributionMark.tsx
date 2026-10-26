import type { DistDef, Params } from "../../distributions";
import type { ChartScales } from "./Chart";
import { Curve, MassBars, Stems } from "./marks";

interface Props {
  def: DistDef;
  params: Params;
  scales: ChartScales;
  range: [number, number];
  /** "target" draws a dashed curve or soft bars; "user" a solid curve or lollipops. */
  role: "target" | "user";
}

/** One distribution drawn the right way for its kind (curve or bars). */
export function DistributionMark({ def, params, scales, range, role }: Props) {
  if (def.valid && !def.valid(params)) return null;
  const fn = (x: number) => def.density(x, params);
  if (def.kind === "discrete") {
    return role === "target" ? (
      <MassBars fn={fn} scales={scales} className="series-target" from={range[0]} to={range[1]} />
    ) : (
      <Stems fn={fn} scales={scales} className="series-user" from={range[0]} to={range[1]} />
    );
  }
  return role === "target" ? (
    <Curve fn={fn} scales={scales} className="series-target" dashed samples={240} />
  ) : (
    <Curve fn={fn} scales={scales} className="series-user" area samples={240} />
  );
}
