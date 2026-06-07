import RiskBadge from "./RiskBadge.jsx";
import ScoreBadge from "./ScoreBadge.jsx";

export default function DataTable({ companies, navigate }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-400/10 text-xs uppercase text-slate-500">
            {["Company", "Sector", "Country", "Current ESG", "Momentum", "Risk", "Digital ESG", "Recommendation"].map((heading) => (
              <th key={heading} className="whitespace-nowrap px-3 py-3 font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-400/10">
          {companies.map((company) => (
            <tr key={company.company_id} className="group transition hover:bg-cyan-300/5">
              <td className="px-3 py-4">
                <button
                  onClick={() => navigate(`/company-explorer?company=${company.company_id}`)}
                  className="text-left font-semibold text-slate-100 group-hover:text-cyan-300"
                >
                  {company.company_name}
                </button>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-slate-400">{company.sector}</td>
              <td className="whitespace-nowrap px-3 py-4 text-slate-400">{company.country}</td>
              <td className="px-3 py-4 text-slate-200">{company.current_esg_score}</td>
              <td className="px-3 py-4"><ScoreBadge label={company.momentum_label} score={company.momentum_score} /></td>
              <td className="px-3 py-4"><RiskBadge level={company.risk_level} /></td>
              <td className="px-3 py-4 font-semibold text-cyan-200">{company.digital_esg_score}</td>
              <td className="whitespace-nowrap px-3 py-4 text-slate-300">{company.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!companies.length && <div className="p-8 text-center text-sm text-slate-500">No companies match the current filter.</div>}
    </div>
  );
}
