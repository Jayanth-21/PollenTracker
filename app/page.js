"use client";

import { useCallback, useState } from "react";
import Header from "@/components/Header";
import StatusBanner from "@/components/StatusBanner";
import LocationPicker from "@/components/LocationPicker";
import CurrentConditionsCard from "@/components/CurrentConditionsCard";
import PollenBreakdown from "@/components/PollenBreakdown";
import PollenChart from "@/components/PollenChart";
import ForecastList from "@/components/ForecastList";
import FaqSection from "@/components/FaqSection";

function geolocationErrorMessage(code) {
  switch (code) {
    case 1:
      return "Permission was denied. You can search for a place below, or enable location in your browser settings.";
    case 2:
      return "Your position could not be determined. Try search, or check device location services.";
    case 3:
      return "The location request timed out. Try again or use search.";
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

const LINKEDIN_URL =
  "https://www.linkedin.com/in/jayanth-sankar-815a02211/";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [pollen, setPollen] = useState(null);
  const [weather, setWeather] = useState(null);
  const [locationLabel, setLocationLabel] = useState(null);

  const loadForPosition = useCallback(async (lat, lon) => {
    const q = `lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
    const [pollenJson, weatherJson] = await Promise.all([
      fetchJson(`/api/pollen?${q}`),
      fetchJson(`/api/weather?${q}`),
    ]);
    setPollen(pollenJson);
    setWeather(weatherJson);
  }, []);

  const loadLocationAndData = useCallback(
    async (lat, lon, presetLabel) => {
      setLoading(true);
      setApiError(null);
      setLocationError(null);
      try {
        let label = presetLabel;
        if (!label) {
          const lb = await fetchJson(
            `/api/location-label?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
          );
          label =
            typeof lb.label === "string" && lb.label.length > 0
              ? lb.label
              : `${Number(lat).toFixed(2)}°, ${Number(lon).toFixed(2)}°`;
        }
        setLocationLabel(label);
        await loadForPosition(lat, lon);
      } catch (e) {
        setPollen(null);
        setWeather(null);
        setLocationLabel(null);
        setApiError(
          e instanceof Error ? e.message : "Unexpected API error",
        );
      } finally {
        setLoading(false);
      }
    },
    [loadForPosition],
  );

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }
    setGeoLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGeoLoading(false);
        await loadLocationAndData(
          pos.coords.latitude,
          pos.coords.longitude,
          null,
        );
      },
      (err) => {
        setGeoLoading(false);
        setLocationError(geolocationErrorMessage(err?.code));
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
    );
  }, [loadLocationAndData]);

  const handleSelectPlace = useCallback(
    (lat, lon, label) => {
      loadLocationAndData(lat, lon, label);
    },
    [loadLocationAndData],
  );

  const handleChangeLocation = useCallback(() => {
    setPollen(null);
    setWeather(null);
    setLocationLabel(null);
    setApiError(null);
    setLocationError(null);
  }, []);

  const showPicker =
    !pollen && !loading && !geoLoading;
  const showPanels = Boolean(pollen) && !apiError;
  const bannerLoading = loading || geoLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-slate-50 to-slate-100">
      <Header />

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <StatusBanner
          loading={bannerLoading}
          locationError={locationError}
          apiError={apiError}
        />

        {showPicker ? (
          <LocationPicker
            onUseMyLocation={handleUseMyLocation}
            onSelectPlace={handleSelectPlace}
            disabled={loading}
            geoLoading={geoLoading}
          />
        ) : null}

        {showPanels ? (
          <>
            <p className="text-center text-sm">
              <button
                type="button"
                onClick={handleChangeLocation}
                className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-900"
              >
                Change location
              </button>
            </p>
            <CurrentConditionsCard
              pollenToday={pollen.today}
              weather={weather}
              locationLabel={locationLabel}
            />
            <PollenBreakdown types={pollen.today?.types} />
            <PollenChart
              days={pollen.days}
              accentLevel={pollen?.today?.dayLevel || "LOW"}
            />
            <ForecastList days={pollen.days} />
          </>
        ) : null}

        <FaqSection />

        <footer className="pb-8 text-center text-xs text-slate-500">
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-emerald-800"
          >
            Built and Maintained by Jayanth Sankar
          </a>
        </footer>
      </main>
    </div>
  );
}
