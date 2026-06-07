import { useEffect, useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { API_BASE } from "../data/companies.js";
import CompanyCard from "../components/company/CompanyCard.jsx";
import CompanyDetailPanel from "../components/company/CompanyDetailPanel.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";

export default function CompanyExplorer({ companies, globalQuery }) {
  const initialId = new URLSearchParams(window.location.hash.split("?")[1] || "").get("company") || companies[0]?.company_id;
  const [selectedId, setSelectedId] = useState(initialId);
  const [detail, setDetail] = useState(null);
  const [localQuery, setLocalQuery] = useState("");

  useEffect(() => {
    setDetail(null);
    if (!selectedId) return;
    fetch(`${API_BASE}/companies/${selectedId}`)
      .then((response) => response.json())
      .then(setDetail)
      .catch(() => setDetail(companies.find((company) => company.company_id === selectedId)));
  }, [selectedId, companies]);

  const filtered = useMemo(() => {
    const q = `${globalQuery} ${localQuery}`.toLowerCase();
    return companies.filter((company) => `${company.company_name} ${company.sector} ${company.country}`.toLowerCase().includes(q.trim()));
  }, [companies, globalQuery, localQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Company Explorer"
        title="Investor research terminal"
        description="Search companies, open detail panels and inspect ESG momentum, risk, digital readiness and AI-generated signal explanations."
      />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <label className="relative block">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={localQuery}
              onChange={(event) => setLocalQuery(event.target.value)}
              placeholder="Search company by name..."
              className="h-11 w-full rounded-lg border border-slate-400/10 bg-slate-900/70 pl-10 pr-3 text-sm text-slate-100 outline-none focus:border-cyan-300/45"
            />
          </label>
          <div className="grid max-h-[760px] gap-3 overflow-auto pr-1">
            {filtered.map((company) => (
              <CompanyCard
                key={company.company_id}
                company={company}
                selected={selectedId === company.company_id}
                onClick={() => setSelectedId(company.company_id)}
              />
            ))}
          </div>
        </aside>
        <CompanyDetailPanel company={detail} />
      </div>
    </div>
  );
}
