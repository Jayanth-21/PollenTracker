"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import StatusBanner from "@/components/StatusBanner";
import CurrentConditionsCard from "@/components/CurrentConditionsCard";
import PollenBreakdown from "@/components/PollenBreakdown";
import PollenChart from "@/components/PollenChart";
import ForecastList from "@/components/ForecastList";
import FaqSection from "@/components/FaqSection";

function geolocationErrorMessage(code) {
  switch (code) {
    case 1:
      return "Permission was denied. Enable location access in your browser settings to load a local forecast.";
    case 2:
      return "Your position could not be determined. Try again or check device location services.";
    case 3:
      return "The location request timed out. Please retry.";
    default:
      return "Unable to read your location.";
  }
}

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

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [pollen, setPollen] = useState(null);
  const [weather, setWeather] = useState(null);

  const loadForPosition = useCallback(async (lat, lon) => {
    setApiError(null);
    const q = `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const [pollenJson, weatherJson] = await Promise.all([
      fetchJson(`/api/pollen?${q}`),
      fetchJson(`/api/weather?${q}`),
    ]);
    setPollen(pollenJson);
    setWeather(weatherJson);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationError(null);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          await loadForPosition(lat, lon);
        } catch (e) {
          setApiError(e instanceof Error ? e.message : "Unexpected API error");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLocationError(geolocationErrorMessage(err?.code));
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
    );
  }, [loadForPosition]);

  const showPanels = !loading && !locationError && !apiError && pollen;

  const accentLevel = useMemo(
    () => pollen?.today?.dayLevel || "LOW",
    [pollen],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-slate-50 to-slate-100">
      <Header />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <StatusBanner
          loading={loading}
          locationError={locationError}
          apiError={apiError}
        />

        {showPanels ? (
          <>
            <CurrentConditionsCard
              pollenToday={pollen.today}
              weather={weather}
              regionCode={pollen.regionCode}
            />
            <PollenBreakdown types={pollen.today?.types} />
            <PollenChart days={pollen.days} accentLevel={accentLevel} />
            <ForecastList days={pollen.days} />
          </>
        ) : null}

        {!loading && !locationError && !apiError && !pollen ? (
          <p className="text-sm text-slate-600">
            Waiting for pollen data…
          </p>
        ) : null}

        <FaqSection />

        <footer className="pb-8 text-center text-xs text-slate-500">
          This is not medical advice.
        </footer>
      </main>
    </div>
  );
}
