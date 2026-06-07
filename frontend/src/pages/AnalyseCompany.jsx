import { Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import AnalysisPipeline from "../components/intelligence/AnalysisPipeline.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import RiskBadge from "../components/ui/RiskBadge.jsx";
import { API_BASE } from "../data/companies.js";

export default function AnalyseCompany({ companies, setAnalysis, navigate, watchlist = [], toggleWatchlist }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(companies[0]?.company_id || "");
  const [running, setRunning] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return companies.filter((company) => `${company.company_name} ${company.sector} ${company.country}`.toLowerCase().includes(q));
  }, [companies, query]);

  const run = async () => {
    setRunning(true);
    const response = await fetch(`${API_BASE}/analysis/company`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_id: selected, demo_mode: demoMode }),
    });
    const data = await response.json();
    setAnalysis(data);
    setRunning(false);
    navigate("/workspace");
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Analyse Company" title="Search, select and run AI ESG analysis" description="Collect signals from news, reports and cached company data, then generate traceable intelligence." />
      <AnalysisPipeline active={running} />
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <GlassCard className="p-5">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company..." className="h-11 w-full rounded-lg border border-slate-400/10 bg-slate-950/60 pl-10 pr-3 text-sm text-slate-100 outline-none focus:border-cyan-300/45" />
          </label>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" checked={demoMode} onChange={(event) => setDemoMode(event.target.checked)} />
            Use Demo Dataset Mode
          </label>
          <button onClick={run} disabled={!selected || running} className="mt-5 w-full rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">
            Run Analysis
          </button>
        </GlassCard>
        <div className="grid gap-3">
          {filtered.map((company) => (
            <div key={company.company_id} className={`rounded-lg border p-4 transition ${selected === company.company_id ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-200"}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <button onClick={() => setSelected(company.company_id)} className="min-w-0 text-left">
                  <p className="font-semibold text-slate-950">{company.company_name}</p>
                  <p className="mt-1 text-sm text-slate-500">{company.sector} | {company.country}</p>
                </button>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => toggleWatchlist?.(company.company_id)} className={`grid h-8 w-8 place-items-center rounded-full border ${watchlist.includes(company.company_id) ? "border-amber-200 bg-amber-50 text-amber-500" : "border-slate-200 text-slate-400"}`} title="Save to watchlist">
                    <Star className="h-4 w-4" fill={watchlist.includes(company.company_id) ? "currentColor" : "none"} />
                  </button>
                  <RiskBadge level={company.risk_level} />
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">Digital {company.digital_esg_score}</span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Momentum {company.momentum_score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
