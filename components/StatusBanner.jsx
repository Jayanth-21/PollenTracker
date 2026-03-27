export default function StatusBanner({ loading, locationError, apiError }) {
  if (loading) {
    return (
      <div
        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
        role="status"
        aria-live="polite"
      >
        <span className="inline-flex items-center gap-2">
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"
            aria-hidden
          />
          Locating you and loading pollen plus weather…
        </span>
      </div>
    );
  }

  if (locationError) {
    return (
      <div
        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm"
        role="alert"
      >
        <p className="font-medium">Location unavailable</p>
        <p className="mt-1 text-amber-900/90">{locationError}</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950 shadow-sm"
        role="alert"
      >
        <p className="font-medium">Could not load data</p>
        <p className="mt-1 text-red-900/90">{apiError}</p>
      </div>
    );
  }

  return null;
}
