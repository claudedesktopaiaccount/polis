export function PredikciaMini() {
  const bars = [
    { label: "PS", pct: 91, color: "#1a6eb5" },
    { label: "SMER", pct: 9, color: "#c0392b" },
    { label: "REP", pct: 0, color: "#2c3e50" },
  ];
  return (
    <div className="p-4 space-y-2">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-2">
          <span className="text-[11px] text-muted w-10 shrink-0">{b.label}</span>
          <div className="flex-1 h-2 bg-subtle overflow-hidden">
            <div
              className="h-full"
              style={{ width: `${b.pct}%`, background: b.color }}
            />
          </div>
          <span className="text-[11px] font-semibold text-ink w-8 text-right">
            {b.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function SimulatorMini() {
  const parties = [
    { color: "#1a6eb5", seats: 36 },
    { color: "#c0392b", seats: 31 },
    { color: "#2c3e50", seats: 20 },
    { color: "#16a085", seats: 16 },
    { color: "#e74c3c", seats: 14 },
    { color: "#27ae60", seats: 13 },
    { color: "#1a3a6b", seats: 10 },
    { color: "#d63384", seats: 10 },
  ];

  const dotColours: string[] = [];
  for (const p of parties) {
    for (let i = 0; i < p.seats; i++) dotColours.push(p.color);
  }
  while (dotColours.length < 150) dotColours.push("#e8e3db");

  const arcCounts = [15, 22, 28, 35, 50];
  const dots: { x: number; y: number; color: string }[] = [];
  let dotIndex = 0;
  arcCounts.forEach((count, arcIdx) => {
    const r = 48 + arcIdx * 12;
    for (let i = 0; i < count; i++) {
      const angle = Math.PI - (i / (count - 1)) * Math.PI;
      dots.push({
        x: 80 + r * Math.cos(angle),
        y: 72 - r * Math.sin(angle),
        color: dotColours[dotIndex++] ?? "#e8e3db",
      });
    }
  });

  return (
    <div className="flex items-center justify-center p-2">
      <svg viewBox="0 0 160 80" width="160" height="80">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={2.5} fill={d.color} />
        ))}
      </svg>
    </div>
  );
}

export function PrieskumyMini() {
  const ps = [19.5, 20.0, 19.8, 20.2, 19.9, 20.4, 20.2];
  const smer = [18.0, 17.8, 17.5, 17.3, 17.6, 17.4, 17.3];
  const w = 160,
    h = 60,
    pad = 8;
  const minV = 15,
    maxV = 23;
  const toX = (i: number) => pad + (i / (ps.length - 1)) * (w - pad * 2);
  const toY = (v: number) =>
    h - pad - ((v - minV) / (maxV - minV)) * (h - pad * 2);
  const path = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");

  return (
    <div className="flex items-center justify-center p-2">
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
        <path d={path(ps)} fill="none" stroke="#1a6eb5" strokeWidth={2} />
        <path d={path(smer)} fill="none" stroke="#c0392b" strokeWidth={2} />
      </svg>
    </div>
  );
}
