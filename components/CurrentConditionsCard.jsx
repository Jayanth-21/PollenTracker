import LevelBadge from "@/components/LevelBadge";

function formatTemp(value, unit) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return `${Math.round(Number(value))}${unit || "°F"}`;
}

function formatWind(value, unit) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return `${Math.round(Number(value))} ${unit || "mph"}`;
}

export default function CurrentConditionsCard({ pollenToday, weather, regionCode }) {
  const level = pollenToday?.dayLevel || "LOW";
  const maxIndex =
    typeof pollenToday?.maxIndex === "number" ? pollenToday.maxIndex : "—";

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="current-heading"
    >
      <h2
        id="current-heading"
        className="text-lg font-semibold text-slate-900"
      >
        Current conditions
      </h2>
      {regionCode ? (
        <p className="mt-1 text-xs text-slate-500">Region: {regionCode}</p>
      ) : null}

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Pollen level
          </dt>
          <dd className="mt-2 flex flex-wrap items-center gap-2">
            <LevelBadge level={level} />
            <span className="text-sm text-slate-600">
              Index (max UPI today):{" "}
              <span className="font-medium text-slate-900">{maxIndex}</span>
            </span>
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Wind speed
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-slate-900">
            {formatWind(weather?.windSpeedMph, weather?.units?.windSpeed)}
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Temperature
          </dt>
          <dd className="mt-2 text-2xl font-semibold text-slate-900">
            {formatTemp(weather?.temperatureF, weather?.units?.temperature)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
