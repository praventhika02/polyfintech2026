import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import AnalysisPipeline from "../components/intelligence/AnalysisPipeline.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import RiskBadge from "../components/ui/RiskBadge.jsx";
import { API_BASE } from "../data/companies.js";

export default function AnalyseCompany({ companies, setAnalysis, navigate }) {
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
            <button key={company.company_id} onClick={() => setSelected(company.company_id)} className={`rounded-lg border p-4 text-left transition ${selected === company.company_id ? "border-cyan-300/45 bg-cyan-300/10" : "border-slate-400/10 bg-slate-900/60 hover:bg-slate-900"}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-white">{company.company_name}</p>
                  <p className="mt-1 text-sm text-slate-500">{company.sector} | {company.country}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <RiskBadge level={company.risk_level} />
                  <span className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">Digital {company.digital_esg_score}</span>
                  <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">Momentum {company.momentum_score}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
