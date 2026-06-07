import { Leaf } from "lucide-react";
import { navigationItems } from "../../data/companies.js";

export default function Sidebar({ route, navigate }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-400/10 bg-slate-950/85 p-4 backdrop-blur-xl lg:block">
      <button onClick={() => navigate("/overview")} className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/20">
          <Leaf className="h-6 w-6" />
        </span>
        <span>
          <span className="block font-semibold text-white">ESG Pulse 360</span>
          <span className="text-xs text-slate-500">AI intelligence layer</span>
        </span>
      </button>
      <nav className="mt-8 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = route === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-emerald-300/15 bg-emerald-300/5 p-4">
        <p className="text-sm font-semibold text-emerald-200">Investigation Mode</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Search, upload, analyse, ask questions, compare evidence.</p>
      </div>
    </aside>
  );
}
