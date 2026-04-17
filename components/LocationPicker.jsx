"use client";

import { useCallback, useState } from "react";

async function fetchJson(url) {
  const res = await fetch(url);
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const msg =
      (body && (body.error || body.message)) ||
      `Request failed (${res.status})`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return body;
}

export default function LocationPicker({
  onUseMyLocation,
  onSelectPlace,
  disabled,
  geoLoading,
}) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState(null);

  const runSearch = useCallback(async () => {
    const q = query.trim();
    if (q.length < 2) {
      setSearchError("Enter at least 2 characters to search.");
      setResults([]);
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      const data = await fetchJson(
        `/api/geocode-search?q=${encodeURIComponent(q)}`,
      );
      setResults(Array.isArray(data.results) ? data.results : []);
      if (!data.results?.length) {
        setSearchError("No places matched. Try another spelling or city.");
      }
    } catch (e) {
      setResults([]);
      setSearchError(
        e instanceof Error ? e.message : "Search failed. Try again.",
      );
    } finally {
      setSearching(false);
    }
  }, [query]);

  const busy = Boolean(disabled) || searching;

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="location-picker-heading"
    >
      <h2
        id="location-picker-heading"
        className="text-lg font-semibold text-slate-900"
      >
        Set your location
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Use your device location, or search for a city to load pollen and
        weather for that area.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => onUseMyLocation()}
          disabled={busy || geoLoading}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {geoLoading ? "Getting location…" : "Use my current location"}
        </button>
      </div>

      <div
        className="mt-8 border-t border-slate-100 pt-6"
        role="search"
        aria-label="Search by place name"
      >
        <p className="text-sm font-medium text-slate-800">Or search by place</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runSearch();
              }
            }}
            placeholder="e.g. Dallas, London, Tokyo"
            disabled={busy}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-emerald-500/30 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 disabled:opacity-60"
            aria-label="City or place name"
          />
          <button
            type="button"
            onClick={() => runSearch()}
            disabled={busy}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
        {searchError ? (
          <p className="mt-2 text-sm text-amber-800" role="alert">
            {searchError}
          </p>
        ) : null}
        {results.length > 0 ? (
          <ul className="mt-4 max-h-60 space-y-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-2">
            {results.map((r, i) => {
              const key = `${r.latitude}-${r.longitude}-${i}`;
              return (
                <li key={key}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      onSelectPlace(r.latitude, r.longitude, r.label)
                    }
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-white disabled:opacity-60"
                  >
                    <span className="font-medium text-slate-900">
                      {r.label || r.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
