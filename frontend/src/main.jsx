import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  BrainCircuit,
  Building2,
  Leaf,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
const RISK_COLORS = { Low: "#22C55E", Medium: "#F59E0B", High: "#EF4444" };

function App() {
  const [route, setRoute] = useState(window.location.hash.replace("#", "") || "/");
  const [companies, setCompanies] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash.replace("#", "") || "/");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/companies`).then((response) => response.json()),
      fetch(`${API_BASE}/dashboard-summary`).then((response) => response.json()),
    ])
      .then(([companyRows, dashboardSummary]) => {
        setCompanies(companyRows);
        setSummary(dashboardSummary);
      })
      .finally(() => setLoading(false));
  }, []);

  const companyId = route.startsWith("/company/") ? route.split("/")[2] : null;
  useEffect(() => {
    if (!companyId) {
      setSelectedCompany(null);
      return;
    }
    fetch(`${API_BASE}/companies/${companyId}`)
      .then((response) => response.json())
      .then(setSelectedCompany);
  }, [companyId]);

  const navigate = (path) => {
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <TopNav route={route} navigate={navigate} />
      {route === "/" && <LandingPage navigate={navigate} />}
      {route === "/dashboard" && <DashboardPage companies={companies} summary={summary} navigate={navigate} />}
      {route === "/hidden-winners" && <HiddenWinnersPage companies={companies} navigate={navigate} />}
      {route === "/risk-radar" && <RiskRadarPage companies={companies} navigate={navigate} />}
      {route === "/digital-esg" && <DigitalEsgPage companies={companies} navigate={navigate} />}
      {companyId && <CompanyDetailPage company={selectedCompany} />}
    </div>
  );
}

function TopNav({ route, navigate }) {
  const links = [
    ["/dashboard", "Dashboard"],
    ["/hidden-winners", "Hidden Winners"],
    ["/risk-radar", "Risk Radar"],
    ["/digital-esg", "Digital ESG"],
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 font-semibold text-slate-950">
          <Leaf className="h-6 w-6 text-emerald-500" />
          ESG Pulse 360
        </button>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([path, label]) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`rounded px-3 py-2 text-sm font-medium ${
                route === path ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function LandingPage({ navigate }) {
  return (
    <main>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(45,212,191,0.22),transparent_28%),linear-gradient(135deg,rgba(11,18,32,0.96),rgba(16,24,39,0.86))]" />
        <div className="relative mx-auto grid min-h-[78vh] max-w-7xl content-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-sm text-teal-100">
              <BrainCircuit className="h-4 w-4" />
              AI-ready alternative ESG intelligence
            </div>
            <h1 className="text-5xl font-semibold tracking-normal md:text-7xl">ESG Pulse 360</h1>
            <p className="mt-5 max-w-2xl text-2xl text-slate-200">Don't just measure ESG. Predict it.</p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
              A real-time intelligence layer that helps investors find future ESG leaders, detect risks early, and evaluate digital transformation readiness before traditional ratings update.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-8 inline-flex items-center gap-2 rounded bg-emerald-400 px-5 py-3 font-semibold text-slate-950 shadow-glow hover:bg-emerald-300"
            >
              <BarChart3 className="h-5 w-5" />
              View Dashboard
            </button>
          </div>
          <div className="grid content-end gap-4">
            <SignalPanel icon={TrendingUp} label="ESG Momentum" value="Live improvement signals" />
            <SignalPanel icon={Search} label="Hidden Winners" value="Underrated companies improving fast" />
            <SignalPanel icon={AlertTriangle} label="Risk Radar" value="Controversy and regulatory flags" />
            <SignalPanel icon={ShieldCheck} label="Digital ESG" value="AI, cyber, governance readiness" />
          </div>
        </div>
      </section>
      <RoadmapSection />
    </main>
  );
}

function DashboardPage({ companies, summary, navigate }) {
  const sorted = [...companies].sort((a, b) => b.momentum_score - a.momentum_score);
  const riskPie = Object.entries(summary.risk_distribution || {}).map(([name, value]) => ({ name, value }));
  return (
    <PageShell title="Investor Dashboard" subtitle="Real-time ESG signals across ASEAN companies.">
      <SummaryGrid summary={summary} />
      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel title="Company Intelligence Ranking" icon={Building2}>
          <CompanyTable companies={sorted} navigate={navigate} />
        </Panel>
        <Panel title="Risk Distribution" icon={AlertTriangle}>
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie data={riskPie} dataKey="value" nameKey="name" outerRadius={95} label>
                {riskPie.map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Digital ESG Leaderboard" icon={BrainCircuit}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={[...companies].sort((a, b) => b.digital_esg_score - a.digital_esg_score).slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="company_name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="digital_esg_score" fill="#14B8A6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Momentum Trend Snapshot" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={companies.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="company_name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="momentum_score" stroke="#22C55E" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="current_esg_score" stroke="#64748B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>
      <RoadmapSection compact />
    </PageShell>
  );
}

function CompanyDetailPage({ company }) {
  if (!company) return <LoadingState />;
  const digitalBreakdown = [
    ["AI Adoption", company.breakdown.ai_adoption],
    ["Cybersecurity", company.breakdown.cybersecurity],
    ["Data Governance", company.breakdown.data_governance],
    ["Digital Innovation", company.breakdown.digital_innovation],
    ["Responsible AI", company.breakdown.responsible_ai],
  ].map(([name, value]) => ({ name, value }));

  return (
    <PageShell title={company.company_name} subtitle={`${company.sector} | ${company.country}`}>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={TrendingUp} label="ESG Momentum Engine" value={company.momentum_score} detail={company.momentum_label} tone="green" />
        <MetricCard icon={Search} label="Hidden Winners Engine" value={company.hidden_winner_score} detail={company.hidden_winner ? "Hidden Winner Candidate" : "Not flagged"} tone="teal" />
        <MetricCard icon={AlertTriangle} label="ESG Risk Radar" value={company.risk_score} detail={company.risk_level} tone={company.risk_level === "High" ? "red" : company.risk_level === "Medium" ? "amber" : "green"} />
        <MetricCard icon={BrainCircuit} label="Digital ESG Score" value={company.digital_esg_score} detail="Technology readiness" tone="blue" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Momentum Trend" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={290}>
            <LineChart data={company.momentum_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[40, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#22C55E" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Digital ESG Breakdown" icon={ShieldCheck}>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={digitalBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <Panel title="Recent ESG Signals" icon={Leaf}>
          <div className="space-y-3">
            {company.recent_signals.map((signal) => (
              <div key={signal.title} className="rounded border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{signal.title}</p>
                  <StatusBadge label={signal.sentiment} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{signal.date} | {signal.source}</p>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="AI Explanation" icon={BrainCircuit}>
          <p className="leading-7 text-slate-700">{company.explanation}</p>
          <div className="mt-5 rounded bg-slate-100 p-4">
            <p className="text-sm font-semibold text-slate-900">Suggested investor action</p>
            <p className="mt-1 text-sm text-slate-600">{company.investor_action}</p>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}

function HiddenWinnersPage({ companies, navigate }) {
  const winners = companies.filter((company) => company.hidden_winner).sort((a, b) => b.hidden_winner_score - a.hidden_winner_score);
  return (
    <PageShell title="Hidden Winners" subtitle="Companies with moderate current ESG ratings but strong forward-looking improvement signals.">
      <Panel title="Hidden Winners Ranking" icon={Search}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-500">
                <th className="px-3 py-3">Rank</th>
                <th className="px-3 py-3">Company</th>
                <th className="px-3 py-3">Current ESG</th>
                <th className="px-3 py-3">Momentum</th>
                <th className="px-3 py-3">Hidden Score</th>
                <th className="px-3 py-3">Why</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {winners.map((company, index) => (
                <tr key={company.company_id} className="hover:bg-emerald-50">
                  <td className="px-3 py-4 font-semibold">{index + 1}</td>
                  <td className="px-3 py-4">
                    <button className="font-semibold text-slate-950 hover:text-emerald-600" onClick={() => navigate(`/company/${company.company_id}`)}>
                      {company.company_name}
                    </button>
                    <div className="text-sm text-slate-500">{company.sector}</div>
                  </td>
                  <td className="px-3 py-4">{company.current_esg_score}</td>
                  <td className="px-3 py-4">{company.momentum_score}</td>
                  <td className="px-3 py-4">{company.hidden_winner_score}</td>
                  <td className="px-3 py-4 text-sm text-slate-600">Average current ESG rating with high momentum, strong innovation, and digital readiness.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </PageShell>
  );
}

function RiskRadarPage({ companies, navigate }) {
  const rows = [...companies].sort((a, b) => b.risk_score - a.risk_score);
  return (
    <PageShell title="ESG Risk Radar" subtitle="Early controversy, regulatory, labour, and environmental signals ranked by risk severity.">
      <div className="grid gap-4 md:grid-cols-3">
        {rows.slice(0, 3).map((company) => (
          <div key={company.company_id} className="rounded border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <AlertTriangle className={`h-6 w-6 ${company.risk_level === "High" ? "text-red-500" : "text-amber-500"}`} />
              <StatusBadge label={company.risk_level} />
            </div>
            <button onClick={() => navigate(`/company/${company.company_id}`)} className="mt-4 text-left text-lg font-semibold hover:text-red-600">
              {company.company_name}
            </button>
            <p className="mt-2 text-sm text-slate-600">Risk score {company.risk_score}. Suggested action: {company.risk_level === "High" ? "Avoid / High Risk" : "Monitor closely"}.</p>
          </div>
        ))}
      </div>
      <Panel title="Risk Ranking" icon={AlertTriangle}>
        <CompanyRiskTable rows={rows} navigate={navigate} />
      </Panel>
    </PageShell>
  );
}

function DigitalEsgPage({ companies, navigate }) {
  const rows = [...companies].sort((a, b) => b.digital_esg_score - a.digital_esg_score);
  return (
    <PageShell title="Digital ESG" subtitle="A missing ESG factor: AI adoption, cyber resilience, data governance, and responsible technology readiness.">
      <Panel title="Digital ESG Leaderboard" icon={BrainCircuit}>
        <CompanyTable companies={rows} navigate={navigate} compact />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Digital Scores" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="company_name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="digital_esg_score" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <ShieldCheck className="h-8 w-8 text-sky-500" />
          <h2 className="mt-4 text-xl font-semibold">Why Digital ESG Matters</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Traditional ESG ratings often underweight AI governance, cybersecurity readiness, and data responsibility. ESG Pulse 360 treats digital transformation as a forward signal because future ESG leaders will need credible technology controls as well as climate and social commitments.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

function SummaryGrid({ summary }) {
  const cards = [
    ["Total companies", summary.total_companies, Building2, "blue"],
    ["Rising companies", summary.rising_companies, TrendingUp, "green"],
    ["Hidden winners", summary.hidden_winners, Search, "teal"],
    ["High-risk companies", summary.high_risk_companies, AlertTriangle, "red"],
    ["Avg Digital ESG", summary.average_digital_esg_score, BrainCircuit, "blue"],
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map(([label, value, Icon, tone]) => (
        <MetricCard key={label} icon={Icon} label={label} value={value} tone={tone} />
      ))}
    </div>
  );
}

function CompanyTable({ companies, navigate, compact = false }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="text-left text-xs uppercase text-slate-500">
            <th className="px-3 py-3">Company</th>
            {!compact && <th className="px-3 py-3">Sector</th>}
            <th className="px-3 py-3">Current</th>
            <th className="px-3 py-3">Momentum</th>
            <th className="px-3 py-3">Hidden</th>
            <th className="px-3 py-3">Risk</th>
            <th className="px-3 py-3">Digital</th>
            <th className="px-3 py-3">Recommendation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {companies.map((company) => (
            <tr key={company.company_id} className="hover:bg-slate-50">
              <td className="px-3 py-4">
                <button className="font-semibold text-slate-950 hover:text-emerald-600" onClick={() => navigate(`/company/${company.company_id}`)}>
                  {company.company_name}
                </button>
                <div className="text-sm text-slate-500">{company.country}</div>
              </td>
              {!compact && <td className="px-3 py-4 text-sm">{company.sector}</td>}
              <td className="px-3 py-4">{company.current_esg_score}</td>
              <td className="px-3 py-4">
                <div className="flex items-center gap-2">
                  <MomentumIcon label={company.momentum_label} />
                  {company.momentum_score}
                </div>
              </td>
              <td className="px-3 py-4">{company.hidden_winner_score}</td>
              <td className="px-3 py-4"><StatusBadge label={company.risk_level} /></td>
              <td className="px-3 py-4 font-semibold">{company.digital_esg_score}</td>
              <td className="px-3 py-4 text-sm font-medium">{company.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompanyRiskTable({ rows, navigate }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="text-left text-xs uppercase text-slate-500">
            <th className="px-3 py-3">Company</th>
            <th className="px-3 py-3">Risk Score</th>
            <th className="px-3 py-3">Risk Level</th>
            <th className="px-3 py-3">Main Risk Reason</th>
            <th className="px-3 py-3">Investor Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((company) => (
            <tr key={company.company_id}>
              <td className="px-3 py-4">
                <button className="font-semibold hover:text-red-600" onClick={() => navigate(`/company/${company.company_id}`)}>
                  {company.company_name}
                </button>
              </td>
              <td className="px-3 py-4">{company.risk_score}</td>
              <td className="px-3 py-4"><StatusBadge label={company.risk_level} /></td>
              <td className="px-3 py-4 text-sm text-slate-600">{company.risk_level === "High" ? "Controversies and regulatory pressure are elevated." : "Risk signals are present but contained."}</td>
              <td className="px-3 py-4 text-sm font-medium">{company.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RoadmapSection({ compact = false }) {
  const phases = [
    ["Phase 2", "Future ESG Simulator", "Forecast 1 to 3 year ESG trajectories under different investment scenarios."],
    ["Phase 3", "Satellite Signals", "Detect deforestation, factory expansion, renewable infrastructure, and pollution indicators."],
    ["Phase 4", "Portfolio Optimisation", "Construct ESG-focused portfolios using momentum, risk, Digital ESG, and sector diversification."],
  ];
  return (
    <section className={`${compact ? "" : "bg-white"} py-8`}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-emerald-500" />
            <h2 className="text-xl font-semibold">Future Roadmap</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {phases.map(([phase, title, text]) => (
              <div key={phase} className="rounded border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-emerald-600">{phase}</p>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PageShell({ title, subtitle, children }) {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-slate-600">{subtitle}</p>
      </div>
      {children}
    </main>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="h-5 w-5 text-emerald-500" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "green" }) {
  const toneClasses = {
    green: "bg-emerald-50 text-emerald-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-sky-50 text-sky-600",
  };
  return (
    <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`rounded p-2 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {detail && <span className="text-sm font-medium text-slate-500">{detail}</span>}
      </div>
      <p className="mt-5 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function SignalPanel({ icon: Icon, label, value }) {
  return (
    <div className="rounded border border-white/10 bg-white/8 p-5 backdrop-blur">
      <Icon className="h-6 w-6 text-emerald-300" />
      <p className="mt-4 font-semibold">{label}</p>
      <p className="mt-1 text-sm text-slate-300">{value}</p>
    </div>
  );
}

function MomentumIcon({ label }) {
  if (label === "Rising") return <ArrowUp className="h-4 w-4 text-emerald-500" />;
  if (label === "Declining") return <ArrowDown className="h-4 w-4 text-red-500" />;
  return <ArrowRight className="h-4 w-4 text-amber-500" />;
}

function StatusBadge({ label }) {
  const classes = {
    Low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Medium: "bg-amber-50 text-amber-700 ring-amber-200",
    High: "bg-red-50 text-red-700 ring-red-200",
    Positive: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Negative: "bg-red-50 text-red-700 ring-red-200",
  };
  return <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ring-1 ${classes[label] || "bg-slate-100 text-slate-700 ring-slate-200"}`}>{label}</span>;
}

function LoadingState() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-700">
      <div className="flex items-center gap-3">
        <Leaf className="h-6 w-6 animate-pulse text-emerald-500" />
        Loading ESG Pulse 360
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
