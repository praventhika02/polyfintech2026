import GlassCard from "../ui/GlassCard.jsx";
import RiskBadge from "../ui/RiskBadge.jsx";
import ScoreBadge from "../ui/ScoreBadge.jsx";

export default function CompanyCard({ company, selected, onClick }) {
  return (
    <button onClick={onClick} className="block w-full text-left">
      <GlassCard className={`p-4 ${selected ? "border-cyan-300/45 bg-cyan-300/10" : ""}`} interactive>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-50">{company.company_name}</h3>
            <p className="mt-1 text-xs text-slate-500">{company.sector} | {company.country}</p>
          </div>
          <RiskBadge level={company.risk_level} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <ScoreBadge label={company.momentum_label} score={company.momentum_score} />
          <span className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">
            Digital {company.digital_esg_score}
          </span>
        </div>
      </GlassCard>
    </button>
  );
}
