import { levelBadgeClass } from "@/lib/level-styles";

export default function LevelBadge({ level, label }) {
  const text = label || level || "—";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${levelBadgeClass(level)}`}
    >
      {text}
    </span>
  );
}
