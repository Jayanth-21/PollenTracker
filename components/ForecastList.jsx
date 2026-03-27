import LevelBadge from "@/components/LevelBadge";

export default function ForecastList({ days }) {
  const list = Array.isArray(days) ? days.slice(0, 5) : [];

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="forecast-heading"
    >
      <h2
        id="forecast-heading"
        className="text-lg font-semibold text-slate-900"
      >
        3–5 day outlook
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Daily maximum pollen index across tree, grass, and weed
      </p>

      {list.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No forecast rows available.</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {list.map((day) => (
            <li
              key={day.dateKey || day.dateLabel}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-900">{day.dateLabel}</p>
                <p className="text-xs text-slate-500">
                  Max UPI:{" "}
                  <span className="font-medium text-slate-700">
                    {day.maxIndex}
                  </span>
                </p>
              </div>
              <LevelBadge level={day.dayLevel} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
