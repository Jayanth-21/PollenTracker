import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/cache";

function parseCoord(value, name) {
  const n = Number(value);
  if (value === undefined || value === null || value === "") {
    return { ok: false, error: `Missing ${name}` };
  }
  if (Number.isNaN(n) || !Number.isFinite(n)) {
    return { ok: false, error: `Invalid ${name}` };
  }
  return { ok: true, value: n };
}

/**
 * Pick the first finite number from hourly series at index 0 (aligned with API response).
 */
function pickHourlyNumber(series) {
  if (!Array.isArray(series) || series.length === 0) return null;
  const v = series[0];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const latRes = parseCoord(searchParams.get("lat"), "lat");
  const lonRes = parseCoord(searchParams.get("lon"), "lon");
  if (!latRes.ok) {
    return NextResponse.json({ error: latRes.error }, { status: 400 });
  }
  if (!lonRes.ok) {
    return NextResponse.json({ error: lonRes.error }, { status: 400 });
  }

  const lat = latRes.value;
  const lon = lonRes.value;

  if (lat < -90 || lat > 90) {
    return NextResponse.json({ error: "lat out of range" }, { status: 400 });
  }
  if (lon < -180 || lon > 180) {
    return NextResponse.json({ error: "lon out of range" }, { status: 400 });
  }

  const cacheKey = `${lat}-${lon}`;
  const hit = getCached("weather", cacheKey);
  if (hit) {
    return NextResponse.json({ ...hit, cached: true });
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,windspeed_10m");
  url.searchParams.set("hourly", "temperature_2m,windspeed_10m");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("windspeed_unit", "mph");
  url.searchParams.set("forecast_days", "1");

  let upstream;
  try {
    upstream = await fetch(url.toString(), {
      next: { revalidate: 0 },
      headers: { Accept: "application/json" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Open-Meteo API" },
      { status: 502 },
    );
  }

  let json;
  try {
    json = await upstream.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON from Open-Meteo API", status: upstream.status },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Open-Meteo API error", status: upstream.status, details: json },
      { status: 502 },
    );
  }

  const current = json.current || {};
  const hourly = json.hourly || {};
  const times = hourly.time;

  const temperatureF =
    typeof current.temperature_2m === "number"
      ? current.temperature_2m
      : pickHourlyNumber(hourly.temperature_2m);
  const windSpeedMph =
    typeof current.windspeed_10m === "number"
      ? current.windspeed_10m
      : pickHourlyNumber(hourly.windspeed_10m);

  const body = {
    time:
      typeof current.time === "string"
        ? current.time
        : Array.isArray(times) && times.length
          ? times[0]
          : null,
    temperatureF,
    windSpeedMph,
    units: {
      temperature: "°F",
      windSpeed: "mph",
    },
    cached: false,
  };

  setCached("weather", cacheKey, body);
  return NextResponse.json(body);
}
