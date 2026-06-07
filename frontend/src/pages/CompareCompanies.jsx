import { Files } from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { API_BASE } from "../data/companies.js";

export default function CompareCompanies({ companies }) {
  const [selected, setSelected] = useState(companies.slice(0, 3).map((company) => company.company_id));
  const [comparison, setComparison] = useState(null);

  const toggle = (id) => {
    setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id].slice(0, 5));
  };

  const run = async () => {
    const response = await fetch(`${API_BASE}/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_ids: selected }),
    });
    setComparison(await response.json());
  };

  const rows = comparison?.rows || [];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Compare Companies" title="Generate ESG opportunity comparison" description="Select 2 to 5 companies and calculate opportunity, risk, momentum and digital readiness dynamically." />
      <GlassCard className="p-5">
        <div className="flex flex-wrap gap-2">
          {companies.map((company) => (
            <button key={company.company_id} onClick={() => toggle(company.company_id)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${selected.includes(company.company_id) ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100" : "border-slate-400/10 text-slate-500"}`}>
              {company.company_name}
            </button>
          ))}
        </div>
        <button onClick={run} disabled={selected.length < 2} className="mt-5 rounded-lg bg-cyan-300 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50">
          Generate Comparison
        </button>
      </GlassCard>
      {comparison && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Insight label="Best ESG Opportunity" value={comparison.best_esg_opportunity} />
            <Insight label="Highest Risk Company" value={comparison.highest_risk_company} />
            <Insight label="Most Digitally Advanced" value={comparison.most_digitally_advanced_company} />
            <Insight label="Most Improved" value={comparison.most_improved_company} />
          </div>
          <GlassCard className="p-5">
            <div className="flex items-center gap-2">
              <Files className="h-5 w-5 text-cyan-300" />
              <h3 className="font-semibold text-slate-100">Comparison Chart</h3>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={rows}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="company_name" stroke="#64748b" interval={0} />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="momentum" fill="#22c55e" />
                <Bar dataKey="hidden_winner" fill="#06b6d4" />
                <Bar dataKey="risk" fill="#ef4444" />
                <Bar dataKey="digital_esg" fill="#a78bfa" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
          <GlassCard className="overflow-x-auto p-5">
            <table className="min-w-full text-left text-sm">
              <thead><tr className="border-b border-slate-400/10 text-xs uppercase text-slate-500">{["Company", "Momentum", "Hidden Winner", "Risk", "Digital ESG", "Recommendation"].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-400/10">{rows.map((row) => <tr key={row.company_id}><td className="px-3 py-4 font-semibold text-white">{row.company_name}</td><td className="px-3 py-4">{row.momentum}</td><td className="px-3 py-4">{row.hidden_winner}</td><td className="px-3 py-4">{row.risk}</td><td className="px-3 py-4">{row.digital_esg}</td><td className="px-3 py-4 text-slate-300">{row.recommendation}</td></tr>)}</tbody>
            </table>
          </GlassCard>
        </>
      )}
    </div>
  );
}

function Insight({ label, value }) {
  return (
    <GlassCard className="p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </GlassCard>
  );
}
