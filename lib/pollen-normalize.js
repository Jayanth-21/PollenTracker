/** Map Google Pollen UPI numeric value (0–5) to coarse levels for the UI. */
export function valueToLevel(value) {
  const v = Number(value);
  if (Number.isNaN(v)) return "LOW";
  if (v <= 2) return "LOW";
  if (v === 3) return "MEDIUM";
  return "HIGH";
}

function formatDateKey(date) {
  if (!date || typeof date !== "object") return "";
  const { year, month, day } = date;
  if (!year || !month || !day) return "";
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function labelDate(date) {
  const key = formatDateKey(date);
  if (!key) return "—";
  const parsed = new Date(`${key}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return key;
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Normalize Google Pollen `forecast:lookup` JSON for the client.
 * @param {Record<string, unknown>} raw
 */
export function normalizePollenResponse(raw) {
  const dailyInfo = Array.isArray(raw.dailyInfo) ? raw.dailyInfo : [];

  const days = dailyInfo.map((day) => {
    const pollenTypeInfo = Array.isArray(day.pollenTypeInfo)
      ? day.pollenTypeInfo
      : [];

    /** @type {Record<string, { code: string, displayName: string, value: number, category: string, level: string }>} */
    const types = {};

    for (const pt of pollenTypeInfo) {
      const code = String(pt.code || "").toUpperCase();
      if (!["TREE", "GRASS", "WEED"].includes(code)) continue;
      const ii = pt.indexInfo || {};
      const value =
        typeof ii.value === "number" ? ii.value : Number(ii.value) || 0;
      const category = typeof ii.category === "string" ? ii.category : "";
      types[code.toLowerCase()] = {
        code,
        displayName:
          typeof pt.displayName === "string" ? pt.displayName : code,
        value,
        category,
        level: valueToLevel(value),
      };
    }

    const values = Object.values(types).map((t) => t.value);
    const maxIndex = values.length ? Math.max(...values) : 0;

    return {
      date: day.date || null,
      dateKey: formatDateKey(day.date),
      dateLabel: labelDate(day.date),
      types,
      maxIndex,
      dayLevel: valueToLevel(maxIndex),
    };
  });

  const today = days[0] || null;

  return {
    regionCode: typeof raw.regionCode === "string" ? raw.regionCode : null,
    days,
    today,
  };
}
