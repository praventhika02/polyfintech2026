import { useEffect, useMemo, useState } from "react";
import AppLayout from "./components/layout/AppLayout.jsx";
import { API_BASE, fallbackCompanies } from "./data/companies.js";
import { getSummary } from "./utils/scoring.js";
import Dashboard from "./pages/Dashboard.jsx";
import DigitalESG from "./pages/DigitalESG.jsx";
import HiddenWinners from "./pages/HiddenWinners.jsx";
import Login from "./pages/Login.jsx";
import Momentum from "./pages/Momentum.jsx";
import Overview from "./pages/Overview.jsx";
import RiskRadar from "./pages/RiskRadar.jsx";
import CompanyExplorer from "./pages/CompanyExplorer.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import { Leaf } from "lucide-react";

const publicRoutes = ["/login"];

export default function App() {
  const [route, setRoute] = useState(normalizeRoute(window.location.hash));
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem("esg-pulse-auth") === "true");
  const [companies, setCompanies] = useState(fallbackCompanies);
  const [summary, setSummary] = useState(getSummary(fallbackCompanies));
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onHashChange = () => setRoute(normalizeRoute(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    if (!window.location.hash) {
      window.location.hash = authenticated ? "/overview" : "/login";
    }
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [authenticated]);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/companies`).then((response) => response.json()),
      fetch(`${API_BASE}/dashboard-summary`).then((response) => response.json()),
    ])
      .then(([companyRows, dashboardSummary]) => {
        const rows = Array.isArray(companyRows) ? companyRows : companyRows.value || fallbackCompanies;
        setCompanies(rows);
        setSummary({ ...getSummary(rows), ...dashboardSummary });
      })
      .catch(() => {
        setCompanies(fallbackCompanies);
        setSummary(getSummary(fallbackCompanies));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!authenticated && !publicRoutes.includes(route)) {
      window.location.hash = "/login";
    }
    if (authenticated && route === "/login") {
      window.location.hash = "/overview";
    }
  }, [authenticated, route]);

  const filteredCompanies = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return companies;
    return companies.filter((company) => `${company.company_name} ${company.sector} ${company.country} ${company.recommendation}`.toLowerCase().includes(q));
  }, [companies, query]);

  const navigate = (path) => {
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const login = () => {
    localStorage.setItem("esg-pulse-auth", "true");
    setAuthenticated(true);
    navigate("/overview");
  };

  if (route === "/login" || !authenticated) {
    return <Login onLogin={login} />;
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <AppLayout route={route} navigate={navigate} query={query} setQuery={setQuery}>
      {route === "/overview" && <Overview companies={companies} summary={summary} navigate={navigate} />}
      {route === "/dashboard" && <Dashboard companies={filteredCompanies} summary={getSummary(filteredCompanies)} navigate={navigate} globalQuery={query} />}
      {route === "/momentum" && <Momentum companies={filteredCompanies} />}
      {route === "/hidden-winners" && <HiddenWinners companies={filteredCompanies} />}
      {route === "/risk-radar" && <RiskRadar companies={filteredCompanies} />}
      {route === "/digital-esg" && <DigitalESG companies={filteredCompanies} />}
      {route.startsWith("/company-explorer") && <CompanyExplorer companies={companies} globalQuery={query} />}
      {route === "/roadmap" && <Roadmap />}
    </AppLayout>
  );
}

function normalizeRoute(hash) {
  const value = hash.replace("#", "") || "/login";
  return value.split("?")[0] === "/company-explorer" ? value : value;
}

function LoadingState() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-400">
      <div className="flex items-center gap-3">
        <Leaf className="h-6 w-6 animate-pulse text-emerald-300" />
        Loading ESG Pulse 360
      </div>
    </div>
  );
}
