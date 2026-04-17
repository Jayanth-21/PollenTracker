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

function fallbackLabel(lat, lon) {
  return `${Number(lat).toFixed(2)}°, ${Number(lon).toFixed(2)}°`;
}

/**
 * Reverse geocode via BigDataCloud client API (no key; suitable for light server use).
 */
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

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Coordinates out of range" }, { status: 400 });
  }

  const cacheKey = `${lat}-${lon}`;
  const hit = getCached("reverseGeocode", cacheKey);
  if (hit) {
    return NextResponse.json({ ...hit, cached: true });
  }

  const geoUrl = new URL(
    "https://api.bigdatacloud.net/data/reverse-geocode-client",
  );
  geoUrl.searchParams.set("latitude", String(lat));
  geoUrl.searchParams.set("longitude", String(lon));
  geoUrl.searchParams.set("localityLanguage", "en");

  let label = fallbackLabel(lat, lon);

  try {
    const res = await fetch(geoUrl.toString(), {
      next: { revalidate: 0 },
      headers: {
        Accept: "application/json",
        "User-Agent": "PollenTracker/1.0 (https://vercel.com)",
      },
    });
    if (res.ok) {
      const data = await res.json();
      const city =
        data.city ||
        data.locality ||
        data.localityInfo?.administrative?.[0]?.name ||
        "";
      const region = data.principalSubdivision || "";
      const country = data.countryName || "";
      const parts = [city, region, country].filter(
        (p) => typeof p === "string" && p.length > 0,
      );
      if (parts.length) {
        label = parts.join(", ");
      }
    }
  } catch {
    // keep fallback
  }

  const body = { label, lat, lon, cached: false };
  setCached("reverseGeocode", cacheKey, body);
  return NextResponse.json(body);
}
