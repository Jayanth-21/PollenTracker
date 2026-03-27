export default function Header() {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Pollen Tracker 🌿
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Local pollen, wind, and a multi-day outlook
          </p>
        </div>
      </div>
    </header>
  );
}
