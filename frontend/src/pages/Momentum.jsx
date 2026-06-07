import { signalCards } from "../data/companies.js";
import ChartCard from "../components/ui/ChartCard.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ScoreBadge from "../components/ui/ScoreBadge.jsx";
import MomentumChart from "../components/charts/MomentumChart.jsx";
import { TrendingUp } from "lucide-react";

export default function Momentum({ companies }) {
  const rows = [...companies].sort((a, b) => b.momentum_score - a.momentum_score);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Momentum Engine"
        title="ESG Momentum Engine"
        description="Tracks real-time ESG improvement signals from news, filings, jobs and innovation activity."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {signalCards.map((card) => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.label} className="p-5" interactive>
              <Icon className={`h-6 w-6 ${card.accent}`} />
              <p className="mt-4 font-semibold text-white">{card.label}</p>
              <p className="mt-2 text-sm text-slate-500">{card.metric}</p>
            </GlassCard>
          );
        })}
      </div>
      <ChartCard title="Momentum Trend Line" subtitle="Rising ESG signal trajectory" icon={TrendingUp}>
        <MomentumChart companies={companies} height={340} />
      </ChartCard>
      <div className="grid gap-4">
        {rows.map((company) => (
          <GlassCard key={company.company_id} className="p-5" interactive>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{company.company_name}</h3>
                <p className="mt-1 text-sm text-slate-500">{company.sector} | {company.country}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {company.momentum_label === "Rising"
                    ? "Strong improvement signals from ESG news, hiring and innovation activity."
                    : company.momentum_label === "Stable"
                      ? "Signals remain constructive but require confirmation before rerating."
                      : "Momentum is weakening as risk or low innovation signals dominate."}
                </p>
              </div>
              <ScoreBadge label={company.momentum_label} score={company.momentum_score} />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
