import { ArrowRight, BarChart3, Building2, Search, ShieldAlert, TrendingUp } from "lucide-react";
import { platformPillars } from "../data/companies.js";
import MetricCard from "../components/ui/MetricCard.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";

export default function Overview({ companies, summary, navigate }) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-400/15 bg-slate-900/70 p-6 shadow-[0_24px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Welcome back, Investor</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-white md:text-6xl">Track ESG momentum before the market catches up.</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
              ESG Pulse 360 converts news, hiring, innovation and risk signals into a real-time intelligence layer for identifying future ESG leaders.
            </p>
            <button onClick={() => navigate("/dashboard")} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:brightness-110">
              <BarChart3 className="h-5 w-5" />
              Open Intelligence Dashboard
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {platformPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <GlassCard key={pillar.title} className="p-5" interactive>
                  <Icon className="h-6 w-6 text-emerald-300" />
                  <p className="mt-4 font-semibold text-white">{pillar.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{pillar.description}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Building2} label="Total Companies Tracked" value={summary.total_companies} trend="+13 demo" description="ASEAN companies in active monitoring" tone="cyan" />
        <MetricCard icon={TrendingUp} label="Rising Companies" value={summary.rising_companies} trend="+5 active" description="High momentum improvement signals" />
        <MetricCard icon={Search} label="Hidden Winners" value={summary.hidden_winners} trend="+3 found" description="Under-recognised ESG opportunity names" />
        <MetricCard icon={ShieldAlert} label="High Risk Alerts" value={summary.high_risk_companies} trend="1 alert" description="Emerging risk cases requiring caution" tone="red" />
      </div>
      <PageHeader title="Live Opportunity Feed" description="Companies with the strongest signal mix across momentum, digital ESG and risk." />
      <div className="grid gap-4 xl:grid-cols-3">
        {[...companies].sort((a, b) => b.hidden_winner_score - a.hidden_winner_score).slice(0, 3).map((company) => (
          <GlassCard key={company.company_id} className="p-5" interactive>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">{company.company_name}</p>
                <p className="mt-1 text-sm text-slate-500">{company.sector} | {company.country}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-cyan-300" />
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-400">{company.recommendation} with momentum {company.momentum_score}, risk {company.risk_score}, and Digital ESG {company.digital_esg_score}.</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
