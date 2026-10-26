import type { Locale } from "../core/i18n";

/**
 * Small inline SVG flags. Flag emoji don't render on every system
 * (Windows shows the letters "AR"/"US"), so we draw them.
 */
export function Flag({ locale }: { locale: Locale }) {
  return (
    <svg className="flag" viewBox="0 0 30 20" width="24" height="16" aria-hidden="true">
      {locale === "es" ? <Argentina /> : <Usa />}
    </svg>
  );
}

function Argentina() {
  const rays = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
  return (
    <>
      <rect width="30" height="20" fill="#74ACDF" />
      <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
      <g transform="translate(15 10)" fill="#F6B40E">
        {rays.map((deg) => (
          <rect key={deg} x="-0.45" y="-3.3" width="0.9" height="1.6" transform={`rotate(${deg})`} />
        ))}
        <circle r="1.55" stroke="#85340A" strokeWidth="0.3" />
      </g>
    </>
  );
}

function Usa() {
  const stripe = 20 / 13;
  const stars: [number, number][] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < (row % 2 ? 5 : 6); col++) {
      stars.push([1.15 + col * 2 + (row % 2 ? 1 : 0), 1.25 + row * 1.85]);
    }
  }
  return (
    <>
      <rect width="30" height="20" fill="#FFFFFF" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * 2 * stripe} width="30" height={stripe} fill="#B22234" />
      ))}
      <rect width="12.5" height={stripe * 7} fill="#3C3B6E" />
      {stars.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="0.42" fill="#FFFFFF" />
      ))}
    </>
  );
}
