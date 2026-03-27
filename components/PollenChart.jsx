"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartStrokeForLevel } from "@/lib/level-styles";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-slate-900">{row.dateLabel}</p>
      <p className="text-slate-600">
        Max pollen index:{" "}
        <span className="font-semibold text-slate-900">{row.maxIndex}</span>
      </p>
    </div>
  );
}

export default function PollenChart({ days, accentLevel }) {
  const data = (Array.isArray(days) ? days : []).slice(0, 5).map((d) => ({
    dateLabel: d.dateLabel,
    maxIndex: d.maxIndex,
    dayLevel: d.dayLevel,
  }));

  const stroke = chartStrokeForLevel(accentLevel || "LOW");

  if (data.length === 0) {
    return (
      <section
        className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 shadow-sm"
        aria-labelledby="chart-heading"
      >
        <h2
          id="chart-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Pollen trend
        </h2>
        <p className="mt-4 text-sm text-slate-500">No chart data yet.</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="chart-heading"
    >
      <h2
        id="chart-heading"
        className="text-lg font-semibold text-slate-900"
      >
        Pollen trend
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Line shows the daily maximum UPI (0–5) for the next few days
      </p>

      <div className="mt-6 h-72 w-full" role="img" aria-label="Pollen index over time">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickMargin={8}
            />
            <YAxis
              domain={[0, 5]}
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="maxIndex"
              stroke={stroke}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
