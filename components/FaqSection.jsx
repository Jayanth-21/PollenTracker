const ITEMS = [
  {
    q: "Where does the pollen data come from?",
    a: "Pollen levels and daily forecasts are requested from the Google Pollen API for your coordinates. Coverage varies by region.",
  },
  {
    q: "Why do I need to share my location?",
    a: "The site uses your browser location to request a local forecast. If you deny permission, we cannot automatically pick coordinates.",
  },
  {
    q: "What is the Universal Pollen Index (UPI)?",
    a: "UPI is a 0–5 scale summarizing pollen burden. Higher values generally mean more pollen in the air for the types reported.",
  },
  {
    q: "How is wind and temperature shown?",
    a: "Wind speed and temperature come from Open-Meteo using the same latitude and longitude. No API key is required for that service.",
  },
];

export default function FaqSection() {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="faq-heading"
    >
      <h2 id="faq-heading" className="text-lg font-semibold text-slate-900">
        FAQ
      </h2>

      <dl className="mt-4 space-y-5">
        {ITEMS.map((item) => (
          <div key={item.q}>
            <dt className="font-medium text-slate-900">{item.q}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-slate-600">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>

      <div
        className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
        role="note"
      >
        <p className="font-semibold">Disclaimer</p>
        <p className="mt-1">
          This is not medical advice. Pollen and weather information is for
          general informational purposes only and is not a substitute for
          professional medical guidance.
        </p>
      </div>
    </section>
  );
}
