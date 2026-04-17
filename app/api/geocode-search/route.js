import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/cache";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters", results: [] },
      { status: 400 },
    );
  }

  const cacheKey = q.toLowerCase();
  const hit = getCached("geocode", cacheKey);
  if (hit) {
    return NextResponse.json({ ...hit, cached: true });
  }

  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", q);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  let upstream;
  try {
    upstream = await fetch(url.toString(), {
      next: { revalidate: 0 },
      headers: { Accept: "application/json" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach geocoding service", results: [] },
      { status: 502 },
    );
  }

  let json;
  try {
    json = await upstream.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid geocoding response", results: [] },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Geocoding request failed", results: [], details: json },
      { status: 502 },
    );
  }

  const raw = Array.isArray(json.results) ? json.results : [];
  const results = raw.map((r) => ({
    name: typeof r.name === "string" ? r.name : "",
    latitude: Number(r.latitude),
    longitude: Number(r.longitude),
    country: typeof r.country === "string" ? r.country : "",
    admin1: typeof r.admin1 === "string" ? r.admin1 : "",
    label: formatPlaceLabel(r),
  }));

  const body = { results, cached: false };
  setCached("geocode", cacheKey, body);
  return NextResponse.json(body);
}

function formatPlaceLabel(r) {
  const name = typeof r.name === "string" ? r.name : "";
  const admin1 = typeof r.admin1 === "string" ? r.admin1 : "";
  const country = typeof r.country === "string" ? r.country : "";
  const parts = [name];
  if (admin1) parts.push(admin1);
  if (country) parts.push(country);
  return parts.filter(Boolean).join(", ");
}
