export interface LinearScale {
  (value: number): number;
  invert(pixel: number): number;
  domain: [number, number];
  range: [number, number];
}

export function linearScale(domain: [number, number], range: [number, number]): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const k = (r1 - r0) / (d1 - d0);
  const scale = ((v: number) => r0 + (v - d0) * k) as LinearScale;
  scale.invert = (p: number) => d0 + (p - r0) / k;
  scale.domain = domain;
  scale.range = range;
  return scale;
}

/** Round tick values (1, 2, 5 × 10^n steps) covering [min, max]. */
export function niceTicks(min: number, max: number, target = 6): number[] {
  const span = max - min;
  if (span <= 0) return [min];
  const raw = span / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
  const ticks: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max + step * 1e-9; t += step) {
    ticks.push(Math.round(t / step) * step);
  }
  return ticks;
}
