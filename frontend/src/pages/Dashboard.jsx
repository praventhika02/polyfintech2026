import { AlertTriangle, BarChart3, BrainCircuit, Building2, Search, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import ChartCard from "../components/ui/ChartCard.jsx";
import DataTable from "../components/ui/DataTable.jsx";
import MetricCard from "../components/ui/MetricCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import DigitalESGChart from "../components/charts/DigitalESGChart.jsx";
import MomentumChart from "../components/charts/MomentumChart.jsx";
import RiskDistributionChart from "../components/charts/RiskDistributionChart.jsx";
import SectorComparisonChart from "../components/charts/SectorComparisonChart.jsx";

export default function Dashboard({ companies, summary, navigate, globalQuery }) {
  const [sector, setSector] = useState("All");
  const sectors = ["All", ...new Set(companies.map((company) => company.sector))];
  const filtered = useMemo(() => {
    return companies.filter((company) => {
      const matchesSector = sector === "All" || company.sector === sector;
      const q = globalQuery.toLowerCase();
      const matchesSearch = !q || `${company.company_name} ${company.sector} ${company.country}`.toLowerCase().includes(q);
      return matchesSector && matchesSearch;
    });
  }, [companies, sector, globalQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Intelligence Dashboard"
        title="Premium ESG signal command center"
        description="A single investor view for momentum, hidden winners, emerging risks and digital ESG readiness."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={Building2} label="Total Companies" value={summary.total_companies} trend="+13" description="Companies monitored" tone="cyan" />
        <MetricCard icon={TrendingUp} label="Rising Companies" value={summary.rising_companies} trend="+38%" description="Positive momentum" />
        <MetricCard icon={Search} label="Hidden Winners" value={summary.hidden_winners} trend="3 names" description="Opportunity candidates" />
        <MetricCard icon={AlertTriangle} label="High Risk Companies" value={summary.high_risk_companies} trend="1 alert" description="Elevated risk" tone="red" />
        <MetricCard icon={BrainCircuit} label="Avg Digital ESG" value={summary.average_digital_esg_score} trend="+AI" description="Digital readiness" tone="cyan" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard title="ESG Momentum Trend" subtitle="Leading companies indexed over six months" icon={TrendingUp}>
          <MomentumChart companies={companies} />
        </ChartCard>
        <ChartCard title="Risk Distribution" subtitle="Low, medium and high severity split" icon={AlertTriangle}>
          <RiskDistributionChart companies={companies} />
        </ChartCard>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Digital ESG Scores" subtitle="AI, cyber and data governance readiness" icon={BrainCircuit}>
          <DigitalESGChart companies={companies} />
        </ChartCard>
        <ChartCard title="Sector Comparison" subtitle="Momentum, digital and risk score averages" icon={BarChart3}>
          <SectorComparisonChart companies={companies} />
        </ChartCard>
      </div>
      <ChartCard title="Company Ranking Table" subtitle="Search, filter and inspect company signal scores" icon={Building2}>
        <div className="mb-4 flex flex-wrap gap-2">
          {sectors.map((item) => (
            <button
              key={item}
              onClick={() => setSector(item)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                sector === item ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100" : "border-slate-400/10 bg-slate-950/40 text-slate-500 hover:text-slate-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <DataTable companies={filtered} navigate={navigate} />
      </ChartCard>
    </div>
  );
}
