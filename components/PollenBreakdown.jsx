import LevelBadge from "@/components/LevelBadge";

const ORDER = [
  { key: "tree", label: "Tree" },
  { key: "grass", label: "Grass" },
  { key: "weed", label: "Weed" },
];

export default function PollenBreakdown({ types }) {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="breakdown-heading"
    >
      <h2
        id="breakdown-heading"
        className="text-lg font-semibold text-slate-900"
      >
        Pollen breakdown
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Universal Pollen Index (UPI) by type for today
      </p>

      <ul className="mt-4 divide-y divide-slate-100">
        {ORDER.map(({ key, label }) => {
          const row = types?.[key];
          return (
            <li
              key={key}
              className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-2"
            >
              <div>
                <p className="font-medium text-slate-900">{label}</p>
                {row?.category ? (
                  <p className="text-sm text-slate-500">{row.category}</p>
                ) : (
                  <p className="text-sm text-slate-500">No data</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {row ? (
                  <>
                    <span className="text-lg font-semibold tabular-nums text-slate-900">
                      {row.value}
                    </span>
                    <LevelBadge level={row.level} />
                  </>
                ) : (
                  <span className="text-sm text-slate-400">—</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
