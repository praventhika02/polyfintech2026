import { AlertTriangle, BrainCircuit, Search, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { digitalBreakdown } from "../../utils/scoring.js";
import SignalCard from "./SignalCard.jsx";
import ChartCard from "../ui/ChartCard.jsx";
import GlassCard from "../ui/GlassCard.jsx";
import MetricCard from "../ui/MetricCard.jsx";

export default function CompanyDetailPanel({ company }) {
  if (!company) {
    return (
      <GlassCard className="grid min-h-[520px] place-items-center p-8 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-200">Select a company</p>
          <p className="mt-2 text-sm text-slate-500">Open a company profile to view investor-grade ESG signal intelligence.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-5">
      <GlassCard className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Investor research terminal</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">{company.company_name}</h2>
            <p className="mt-2 text-sm text-slate-500">{company.sector} | {company.country}</p>
          </div>
          <p className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-sm font-semibold text-emerald-200">
            {company.recommendation}
          </p>
        </div>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={TrendingUp} label="Momentum" value={company.momentum_score} trend={company.momentum_label} description="Live improvement intensity" />
        <MetricCard icon={Search} label="Hidden Winner" value={company.hidden_winner_score} tone="cyan" trend={company.hidden_winner ? "Candidate" : "Watch"} description="Rerating opportunity score" />
        <MetricCard icon={AlertTriangle} label="Risk" value={company.risk_score} tone={company.risk_level === "High" ? "red" : "amber"} trend={company.risk_level} description="Controversy and regulatory pressure" />
        <MetricCard icon={BrainCircuit} label="Digital ESG" value={company.digital_esg_score} tone="cyan" trend="AI-ready" description="Technology governance readiness" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <ChartCard title="Digital ESG Breakdown" icon={BrainCircuit}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={digitalBreakdown(company)}>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 8 }} />
              <Bar dataKey="value" fill="#06b6d4" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <GlassCard className="p-5">
          <h3 className="font-semibold text-slate-100">AI Explanation</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">{company.explanation || `${company.company_name} is monitored through ESG momentum, risk and digital readiness signals.`}</p>
          <div className="mt-5 rounded-lg border border-slate-400/10 bg-slate-950/40 p-4">
            <p className="text-sm font-semibold text-slate-200">Suggested investor action</p>
            <p className="mt-1 text-sm text-slate-500">{company.investor_action || company.recommendation}</p>
          </div>
        </GlassCard>
      </div>
      <div className="grid gap-3">
        {(company.recent_signals || []).map((signal) => <SignalCard key={signal.title} signal={signal} />)}
      </div>
    </div>
  );
}
