import { BrainCircuit, ShieldCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "../components/ui/ChartCard.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import DigitalESGChart from "../components/charts/DigitalESGChart.jsx";
import { digitalBreakdown } from "../utils/scoring.js";

export default function DigitalESG({ companies }) {
  const leaders = [...companies].sort((a, b) => b.digital_esg_score - a.digital_esg_score);
  const leader = leaders[0];
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Differentiator"
        title="Digital ESG Intelligence"
        description="Measures AI adoption, cybersecurity readiness, data governance and digital transformation maturity."
      />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Digital ESG Leaderboard" subtitle="Technology governance and transformation readiness" icon={BrainCircuit}>
          <DigitalESGChart companies={companies} height={360} />
        </ChartCard>
        <GlassCard className="p-6">
          <ShieldCheck className="h-8 w-8 text-cyan-300" />
          <h2 className="mt-5 text-2xl font-semibold text-white">Why it matters</h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Traditional ESG ratings usually underweight AI adoption, cyber resilience and data governance. ESG Pulse 360 turns those digital signals into a leading indicator for future ESG readiness.
          </p>
          <div className="mt-6 rounded-lg border border-cyan-300/15 bg-cyan-300/10 p-4">
            <p className="text-sm text-slate-400">Current leader</p>
            <p className="mt-1 text-xl font-semibold text-cyan-100">{leader.company_name} | {leader.digital_esg_score}</p>
          </div>
        </GlassCard>
      </div>
      <ChartCard title={`${leader.company_name} Digital Factor Breakdown`} subtitle="AI adoption, cyber, data governance, innovation and responsible AI" icon={BrainCircuit}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={digitalBreakdown(leader)}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 8 }} />
            <Bar dataKey="value" fill="#22c55e" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
