import { AlertTriangle, ArrowRight, Files, Search, UploadCloud } from "lucide-react";
import { useState } from "react";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import RiskBadge from "../components/ui/RiskBadge.jsx";

export default function Overview({ companies, summary, navigate, savedAnalyses = [], watchlist = [], setAnalysis, setActiveTab }) {
  const [search, setSearch] = useState("");
  const newsFeed = companies.map((company) => ({
    company: company.company_name,
    headline: company.risk_level === "High"
      ? `${company.company_name} ESG risk signal requires review`
      : `${company.company_name} shows ESG momentum signal`,
    source: company.risk_level === "High" ? "Risk Radar" : "Live Signal Monitor",
    time: "Live",
    category: company.risk_level === "High" ? "Governance Risk" : company.digital_esg_score > 80 ? "Digital ESG" : "Sustainability",
    sentiment: company.risk_level === "High" ? "Negative" : "Positive",
    risk_level: company.risk_level,
  }));
  const opportunities = [...companies].sort((a, b) => b.hidden_winner_score - a.hidden_winner_score).slice(0, 4);
  const risks = [...companies].sort((a, b) => b.risk_score - a.risk_score).slice(0, 4);
  const watchlistCompanies = companies.filter((company) => watchlist.includes(company.company_id));

  const launchSearch = () => {
    sessionStorage.setItem("esg-pulse-prefill-search", search);
    navigate("/analyse");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-emerald-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">ESG Intelligence Investigation Platform</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-950 md:text-6xl">Discover ESG momentum before annual disclosures catch up.</h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-600">
            Search any company, fetch live ESG signals, generate evidence-backed intelligence, ask questions, and compare investment opportunities.
          </p>
          <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && launchSearch()} placeholder="Search DBS, Grab, Tesla, Nvidia, Microsoft..." className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-11 pr-3 text-slate-950 outline-none focus:border-emerald-400" />
            </div>
            <button onClick={launchSearch} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 font-semibold text-white hover:bg-emerald-600">
              Analyze <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate("/upload")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:border-emerald-200">
              <UploadCloud className="h-4 w-4" /> Upload Report
            </button>
            <button onClick={() => navigate("/compare")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:border-emerald-200">
              <Files className="h-4 w-4" /> Compare Companies
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="p-5">
          <PageHeader title="Live ESG News Stream" description="A signal feed, not a chart dump. Filter mentally by company, category and sentiment." />
          <div className="mt-5 max-h-[560px] space-y-3 overflow-auto pr-1">
            {newsFeed.map((item) => (
              <div key={`${item.company}-${item.category}`} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[120px_1fr_135px_95px]">
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

        <div className="space-y-5">
          <GlassCard className="p-5">
            <PageHeader title="ESG Opportunities Detected Today" description="Future leader candidates generated from momentum and digital signals." />
            <div className="mt-5 space-y-3">
              {opportunities.map((company) => (
                <div key={company.company_id} className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="font-semibold text-slate-950">{company.company_name}</p>
                  <p className="mt-1 text-sm text-slate-600">Hidden winner {company.hidden_winner_score}, momentum {company.momentum_score}, digital {company.digital_esg_score}.</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="font-semibold text-slate-950">ESG Risks Detected Today</h2>
            </div>
            <div className="mt-5 space-y-3">
              {risks.map((company) => (
                <div key={company.company_id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{company.company_name}</p>
                      <p className="mt-1 text-sm text-slate-600">Risk score {company.risk_score}. Evidence review recommended.</p>
                    </div>
                    <RiskBadge level={company.risk_level} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <GlassCard className="p-5">
          <PageHeader title="Saved Investigations" description="Reopen prior generated intelligence." />
          <div className="mt-5 space-y-2">
            {savedAnalyses.length ? savedAnalyses.slice(0, 5).map((analysis) => (
              <button key={analysis.analysis_id} onClick={() => { setAnalysis(analysis); setActiveTab("Executive Summary"); navigate("/workspace"); }} className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left hover:border-emerald-200">
                <p className="font-semibold text-slate-950">{analysis.company_name}</p>
                <p className="text-xs text-slate-500">{analysis.recommendation} | Confidence {analysis.confidence_score}</p>
              </button>
            )) : <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No saved investigations yet.</p>}
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <PageHeader title="User Watchlist" description="Star companies from Analyse Company to monitor them here." />
          <div className="mt-5 flex flex-wrap gap-2">
            {(watchlistCompanies.length ? watchlistCompanies : []).map((company) => (
              <span key={company.company_id} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">Star {company.company_name}</span>
            ))}
            {!watchlistCompanies.length && <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No watched companies yet.</p>}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
