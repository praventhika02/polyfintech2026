import { Bell, Search } from "lucide-react";
import { todayLabel } from "../../utils/formatters.js";

export default function Topbar({ query, setQuery }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur-xl lg:pl-80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="hidden text-sm font-medium text-slate-500 md:block">{todayLabel()}</div>
        <label className="relative flex min-w-0 flex-1 items-center md:max-w-xl">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search companies, sectors, ESG signals..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400"
          />
        </label>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
            Live ESG Signals
          </span>
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-emerald-600">
            <Bell className="h-4 w-4" />
          </button>
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 text-sm font-bold text-white">
            IV
          </div>
        </div>
      </div>
    </header>
  );
}
