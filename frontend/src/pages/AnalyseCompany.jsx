import { Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import AnalysisPipeline from "../components/intelligence/AnalysisPipeline.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import RiskBadge from "../components/ui/RiskBadge.jsx";
import { API_BASE } from "../data/companies.js";

export default function AnalyseCompany({ companies, setAnalysis, navigate, watchlist = [], toggleWatchlist }) {
  const [query, setQuery] = useState(() => sessionStorage.getItem("esg-pulse-prefill-search") || "");
  const [selected, setSelected] = useState(() => sessionStorage.getItem("esg-pulse-prefill-search") || companies[0]?.company_id || "");
  const [running, setRunning] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [lastSignals, setLastSignals] = useState(null);
  const [pipelineStep, setPipelineStep] = useState(0);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return companies.filter((company) => `${company.company_name} ${company.sector} ${company.country}`.toLowerCase().includes(q));
  }, [companies, query]);

  const run = async () => {
    setRunning(true);
    setLastSignals(null);
    setPipelineStep(0);
    const stepTimer = window.setInterval(() => {
      setPipelineStep((step) => Math.min(step + 1, 3));
    }, 650);
    const minimumDemoMoment = new Promise((resolve) => window.setTimeout(resolve, 2750));
    const analysisRequest = fetch(`${API_BASE}/analysis/company`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: companies.some((company) => company.company_id === selected) ? selected : null,
        company_name: query || selected,
        demo_mode: demoMode,
      }),
    });
    const [response] = await Promise.all([analysisRequest, minimumDemoMoment]);
    const data = await response.json();
    window.clearInterval(stepTimer);
    setPipelineStep(3);
    setLastSignals(data.signals_detected);
    setAnalysis(data);
    setRunning(false);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    navigate("/workspace");
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="ESG Intelligence Search" title="Search any company. Detect ESG signals before the market sees them." description="Type DBS, Grab, Tesla, Nvidia, Microsoft or any company. ESG Pulse 360 will attempt live RSS collection, analyse signals, generate intelligence, and expose evidence." />
      <AnalysisPipeline active={running} signals={lastSignals} currentStep={pipelineStep} />
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <GlassCard className="p-5">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setSelected(event.target.value); }} placeholder="Search any company, e.g. DBS, Tesla, Nvidia..." className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-400" />
          </label>
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" checked={demoMode} onChange={(event) => setDemoMode(event.target.checked)} />
            Use Demo Dataset Mode / Mock Fallback
          </label>
          <button onClick={run} disabled={!(selected || query) || running} className="mt-5 w-full rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 font-semibold text-white disabled:opacity-50">
            Analyze Live ESG Signals
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
