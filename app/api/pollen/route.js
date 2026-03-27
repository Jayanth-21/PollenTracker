import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/cache";
import { normalizePollenResponse } from "@/lib/pollen-normalize";

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

export async function GET(request) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Server misconfiguration: GOOGLE_API_KEY is not set" },
      { status: 500 },
    );
  }

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
  const hit = getCached("pollen", cacheKey);
  if (hit) {
    return NextResponse.json({ ...hit, cached: true });
  }

  const url = new URL("https://pollen.googleapis.com/v1/forecast:lookup");
  url.searchParams.set("key", key);
  url.searchParams.set("location.latitude", String(lat));
  url.searchParams.set("location.longitude", String(lon));
  url.searchParams.set("days", "5");
  url.searchParams.set("plantsDescription", "false");

  let upstream;
  try {
    upstream = await fetch(url.toString(), {
      next: { revalidate: 0 },
      headers: { Accept: "application/json" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach Google Pollen API" },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON from Google Pollen API", status: upstream.status },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      {
        error: "Google Pollen API error",
        status: upstream.status,
        details: json,
      },
      { status: 502 },
    );
  }

  const normalized = normalizePollenResponse(json);
  const body = { ...normalized, cached: false };
  setCached("pollen", cacheKey, body);
  return NextResponse.json(body);
}
