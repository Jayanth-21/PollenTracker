/** Tailwind class bundles for LOW / MEDIUM / HIGH pollen levels. */

export function levelBadgeClass(level) {
  switch (level) {
    case "HIGH":
      return "bg-red-100 text-red-800 border-red-200";
    case "MEDIUM":
      return "bg-amber-100 text-amber-900 border-amber-200";
    default:
      return "bg-emerald-100 text-emerald-900 border-emerald-200";
  }
}

export function levelDotClass(level) {
  switch (level) {
    case "HIGH":
      return "bg-red-500";
    case "MEDIUM":
      return "bg-amber-400";
    default:
      return "bg-emerald-500";
  }
}

export function chartStrokeForLevel(level) {
  switch (level) {
    case "HIGH":
      return "#dc2626";
    case "MEDIUM":
      return "#d97706";
    default:
      return "#059669";
  }
}
