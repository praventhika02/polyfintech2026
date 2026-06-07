import { AlertTriangle, BrainCircuit, Clock, Search, UploadCloud } from "lucide-react";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import RiskBadge from "../components/ui/RiskBadge.jsx";

export default function Overview({ companies, summary, navigate, savedAnalyses = [], watchlist = [], setAnalysis, setActiveTab }) {
  const recentlyAnalysed = [...companies].sort((a, b) => b.momentum_score - a.momentum_score).slice(0, 4);
  const alerts = [...companies].sort((a, b) => b.risk_score - a.risk_score).slice(0, 3);
  const newsFeed = companies.flatMap((company) => [
    {
      company: company.company_name,
      headline: `${company.company_name} ESG momentum signal detected`,
      source: company.risk_level === "High" ? "Risk Radar" : "Signal Monitor",
      time: "Live",
      category: company.risk_level === "High" ? "Governance Risk" : company.digital_esg_score > 80 ? "Digital ESG" : "Sustainability",
      sentiment: company.risk_level === "High" ? "Negative" : "Positive",
    },
  ]).slice(0, 7);
  const watchlistCompanies = companies.filter((company) => watchlist.includes(company.company_id));

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">AI ESG Intelligence Workspace</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold text-slate-950 md:text-6xl">Investigate companies before ESG ratings react.</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">
              Search a company, upload ESG reports, run the analysis pipeline, inspect evidence, ask questions and compare investment opportunities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigate("/analyse")} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 font-semibold text-slate-950">
                <Search className="h-5 w-5" />
                Search Company
              </button>
              <button onClick={() => navigate("/upload")} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-3 font-semibold text-emerald-700">
                <UploadCloud className="h-5 w-5" />
                Upload ESG Report
              </button>
            </div>
          </div>
          <GlassCard className="p-5">
            <BrainCircuit className="h-8 w-8 text-emerald-600" />
            <h2 className="mt-4 text-2xl font-semibold text-slate-950">Investigation Flow</h2>
            <div className="mt-5 space-y-3">
              {["Collect external signals", "Analyse ESG evidence", "Generate traceable scores", "Ask questions", "Compare opportunities"].map((step, index) => (
                <div key={step} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="grid h-7 w-7 place-items-center rounded bg-emerald-100 text-xs font-semibold text-emerald-700">{index + 1}</span>
                  <span className="text-sm text-slate-700">{step}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Companies in cache" value={summary.total_companies} />
        <Stat label="Recently rising" value={summary.rising_companies} />
        <Stat label="Hidden opportunities" value={summary.hidden_winners} />
        <Stat label="High risk alerts" value={summary.high_risk_companies} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="p-5">
          <PageHeader title="Live ESG News Feed" description="Real-time ESG signals by company, category and sentiment." />
          <div className="mt-5 space-y-3">
            {newsFeed.map((item) => (
              <div key={`${item.company}-${item.category}`} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[130px_1fr_120px_110px]">
                <p className="font-semibold text-slate-950">{item.company}</p>
                <div>
                  <p className="font-medium text-slate-800">{item.headline}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.source} | {item.time}</p>
                </div>
                <p className="text-sm text-slate-600">{item.category}</p>
                <p className={`text-sm font-semibold ${item.sentiment === "Negative" ? "text-red-600" : "text-emerald-700"}`}>{item.sentiment}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <PageHeader title="Trending Momentum Companies" description="Strongest current improvers from the latest signal cache." />
          <div className="mt-5 space-y-3">
            {recentlyAnalysed.map((company) => (
              <button key={company.company_id} onClick={() => navigate("/analyse")} className="w-full rounded-lg border border-slate-400/10 bg-slate-950/45 p-4 text-left hover:border-cyan-300/30">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                  <p className="font-semibold text-slate-950">{company.company_name}</p>
                    <p className="mt-1 text-sm text-slate-500">{company.sector} | Momentum {company.momentum_score}</p>
                  </div>
                  <span className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">{company.recommendation}</span>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-300" />
            <h2 className="font-semibold text-slate-100">Recent ESG Alerts</h2>
          </div>
          <div className="mt-5 space-y-3">
            {alerts.map((company) => (
              <div key={company.company_id} className="rounded-lg border border-slate-400/10 bg-slate-950/45 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{company.company_name}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">Risk score {company.risk_score}. Investigate evidence before exposure changes.</p>
                  </div>
                  <RiskBadge level={company.risk_level} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <GlassCard className="p-5">
          <PageHeader title="Hidden Winners Watchlist" description="Future leader candidates with strong momentum and Digital ESG." />
          <div className="mt-5 space-y-3">
            {companies.filter((company) => company.hidden_winner).map((company) => (
              <div key={company.company_id} className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-semibold text-slate-950">{company.company_name}</p>
                <p className="mt-1 text-sm text-slate-600">Hidden winner {company.hidden_winner_score}, momentum {company.momentum_score}, Digital ESG {company.digital_esg_score}.</p>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <PageHeader title="User Watchlist & Recent Analyses" description="Saved companies and generated research persist in this browser." />
          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-900">Watchlist</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(watchlistCompanies.length ? watchlistCompanies : companies.slice(0, 3)).map((company) => (
                <span key={company.company_id} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">Star {company.company_name}</span>
              ))}
            </div>
            <p className="mt-6 text-sm font-semibold text-slate-900">Recent Analyses</p>
            <div className="mt-2 space-y-2">
              {savedAnalyses.length ? savedAnalyses.slice(0, 4).map((analysis) => (
                <button key={analysis.analysis_id} onClick={() => { setAnalysis(analysis); setActiveTab("Executive Summary"); navigate("/workspace"); }} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left hover:border-emerald-200">
                  <p className="font-semibold text-slate-950">{analysis.company_name}</p>
                  <p className="text-xs text-slate-500">{analysis.recommendation} | Confidence {analysis.confidence_score}</p>
                </button>
              )) : <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">No saved analyses yet. Run an analysis, then save it from the workspace.</p>}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <GlassCard className="p-5">
      <Clock className="h-5 w-5 text-emerald-600" />
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
    </GlassCard>
  );
}
