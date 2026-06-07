import { Search, Sparkles } from "lucide-react";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { hiddenWinnerReason } from "../utils/scoring.js";

export default function HiddenWinners({ companies }) {
  const winners = companies.filter((company) => company.hidden_winner).sort((a, b) => b.hidden_winner_score - a.hidden_winner_score);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Opportunity Engine"
        title="Hidden Winners Engine"
        description="Finds companies that are currently under-recognised but showing strong ESG improvement signals."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        {winners.map((company, index) => (
          <GlassCard key={company.company_id} className="relative overflow-hidden p-6" interactive>
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-emerald-300/10" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">Rank #{index + 1}</span>
                <Sparkles className="h-5 w-5 text-cyan-300" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-white">{company.company_name}</h2>
              <p className="mt-1 text-sm text-slate-500">{company.sector} | {company.country}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <Score label="Current ESG" value={company.current_esg_score} />
                <Score label="Momentum" value={company.momentum_score} />
                <Score label="Digital ESG" value={company.digital_esg_score} />
                <Score label="Hidden Score" value={company.hidden_winner_score} />
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-400">{hiddenWinnerReason(company)}</p>
            </div>
          </GlassCard>
        ))}
      </div>
      {!winners.length && (
        <GlassCard className="p-8 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 font-semibold text-slate-200">No hidden winners detected</p>
        </GlassCard>
      )}
    </div>
  );
}

function Score({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-400/10 bg-slate-950/45 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
