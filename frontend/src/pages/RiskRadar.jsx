import { AlertTriangle, ShieldAlert } from "lucide-react";
import ChartCard from "../components/ui/ChartCard.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import RiskBadge from "../components/ui/RiskBadge.jsx";
import RiskDistributionChart from "../components/charts/RiskDistributionChart.jsx";
import { riskReason } from "../utils/scoring.js";

export default function RiskRadar({ companies }) {
  const rows = [...companies].sort((a, b) => b.risk_score - a.risk_score);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Risk Radar"
        title="ESG Risk Radar"
        description="Detects governance, environmental and social risks before annual ESG ratings react."
      />
      <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">
        <ChartCard title="Risk Severity Split" subtitle="Portfolio risk exposure by level" icon={ShieldAlert}>
          <RiskDistributionChart companies={companies} />
        </ChartCard>
        <div className="grid gap-4 md:grid-cols-3">
          {rows.slice(0, 3).map((company) => (
            <GlassCard key={company.company_id} className="p-5" interactive>
              <div className="flex items-center justify-between">
                <AlertTriangle className={company.risk_level === "High" ? "h-6 w-6 text-red-300" : "h-6 w-6 text-amber-300"} />
                <RiskBadge level={company.risk_level} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{company.company_name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{riskReason(company)}</p>
              <p className="mt-4 text-sm font-semibold text-slate-200">Action: {company.risk_level === "High" ? "Avoid / High Risk" : "Monitor closely"}</p>
            </GlassCard>
          ))}
        </div>
      </div>
      <ChartCard title="Risk Ranking Table" subtitle="Main reason and suggested investor action" icon={AlertTriangle}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-400/10 text-xs uppercase text-slate-500">
                {["Company", "Risk Type", "Risk Score", "Severity", "Main Reason", "Suggested Action"].map((heading) => (
                  <th key={heading} className="px-3 py-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-400/10">
              {rows.map((company) => (
                <tr key={company.company_id} className="hover:bg-red-300/5">
                  <td className="px-3 py-4 font-semibold text-slate-100">{company.company_name}</td>
                  <td className="px-3 py-4 text-slate-400">Governance / ESG controversy</td>
                  <td className="px-3 py-4 text-slate-200">{company.risk_score}</td>
                  <td className="px-3 py-4"><RiskBadge level={company.risk_level} /></td>
                  <td className="px-3 py-4 text-slate-400">{riskReason(company)}</td>
                  <td className="px-3 py-4 text-slate-300">{company.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
