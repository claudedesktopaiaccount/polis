const STATUS_MAP: Record<string, { label: string; color: string }> = {
  fulfilled:   { label: "Splnené",   color: "#00C853" },
  in_progress: { label: "Prebieha",  color: "#FFB300" },
  broken:      { label: "Nesplnené", color: "#D32F2F" },
  not_started: { label: "Nezačaté", color: "#757575" },
};

export default function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP["not_started"];
  return (
    <span
      className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 border"
      style={{ color: s.color, borderColor: s.color }}
    >
      {s.label}
    </span>
  );
}
