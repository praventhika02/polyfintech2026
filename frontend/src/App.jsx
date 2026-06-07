import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  ChevronRight,
  Loader2,
  LogOut,
  Plus,
  Search,
  Send,
  Star,
  Trash2,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const COMPANIES = [
  "DBS Bank",
  "Grab",
  "Singtel",
  "Sea Ltd",
  "Wilmar International",
  "AIA Group",
  "CIMB Group",
  "Axiata",
  "Bangkok Bank",
  "Telkom Indonesia",
];
const FEATURED = ["DBS Bank", "Grab", "Singtel", "Sea Ltd"];
const STEPS = [
  "Fetching signals",
  "Analysing momentum",
  "Scanning risks",
  "Computing Digital ESG",
];

export default function App() {
  const [route, setRoute] = useState(getRoute());
  const [auth, setAuth] = useState(localStorage.getItem("esg-auth") === "true");
  const [watchlist, setWatchlist] = useState(() => readList("esg-watchlist", ["DBS Bank", "Grab", "Sea Ltd"]));

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = auth ? "/dashboard" : "/";
    return () => window.removeEventListener("hashchange", onHash);
  }, [auth]);

  useEffect(() => {
    const valid = route === "/" || route === "/dashboard" || route === "/compare" || route === "/watchlist" || route.startsWith("/investigate/");
    if (auth && !valid) navigate("/dashboard");
  }, [auth, route]);

  const navigate = (path) => {
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const login = () => {
    localStorage.setItem("esg-auth", "true");
    setAuth(true);
    navigate("/dashboard");
  };
  const logout = () => {
    localStorage.removeItem("esg-auth");
    setAuth(false);
    navigate("/");
  };
  const toggleWatch = (company) => {
    const next = watchlist.includes(company) ? watchlist.filter((item) => item !== company) : [...watchlist, company];
    setWatchlist(next);
    localStorage.setItem("esg-watchlist", JSON.stringify(next));
  };

  if (!auth || route === "/") return <Login onLogin={login} />;

  let page = <Dashboard navigate={navigate} watchlist={watchlist} />;
  if (route.startsWith("/investigate/")) {
    page = <Investigate company={decodeURIComponent(route.split("/investigate/")[1] || "DBS Bank")} watchlist={watchlist} toggleWatch={toggleWatch} />;
  } else if (route === "/compare") {
    page = <Compare />;
  } else if (route === "/watchlist") {
    page = <Watchlist watchlist={watchlist} toggleWatch={toggleWatch} navigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9]">
      <Sidebar route={route} navigate={navigate} logout={logout} />
      <main className="ml-[220px] min-h-screen p-6">{page}</main>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="grid min-h-screen place-items-center bg-[#0F172A] px-6 text-[#F1F5F9]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onLogin();
        }}
        className="w-full max-w-md rounded-lg border border-[#334155] bg-[#1E293B] p-8 shadow-2xl"
      >
        <h1 className="text-center text-3xl font-semibold">
          ESG Pulse 360<span className="text-[#16A34A]">.</span>
        </h1>
        <p className="mt-3 text-center text-sm italic text-[#94A3B8]">See tomorrow's ESG leaders before the market does.</p>
        <div className="mt-8 space-y-4">
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="h-11 w-full rounded border border-[#334155] bg-[#0F172A] px-3 text-sm outline-none focus:border-[#16A34A]" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" className="h-11 w-full rounded border border-[#334155] bg-[#0F172A] px-3 text-sm outline-none focus:border-[#16A34A]" />
          <button className="h-11 w-full rounded bg-[#16A34A] font-semibold text-white transition hover:bg-green-700">Sign In</button>
          <button type="button" onClick={() => { setEmail("demo@cgsi.com"); setPassword("demo"); setTimeout(onLogin, 200); }} className="h-11 w-full rounded border border-[#334155] text-[#F1F5F9] transition hover:bg-[#0F172A]">Try Demo</button>
        </div>
        <p className="mt-8 text-center text-xs text-[#94A3B8]">Built for CGS International · PolyFinTech100 2026</p>
      </form>
    </div>
  );
}

function Sidebar({ route, navigate, logout }) {
  const items = [
    ["Dashboard", "/dashboard", BarChart3],
    ["Investigate", "/investigate/DBS%20Bank", Search],
    ["Compare", "/compare", ChevronRight],
    ["Watchlist", "/watchlist", Star],
  ];
  return (
    <aside className="fixed inset-y-0 left-0 w-[220px] border-r border-[#334155] bg-[#0F172A]">
      <div className="p-5">
        <div className="text-xl font-semibold">ESG Pulse 360<span className="text-[#16A34A]">.</span></div>
      </div>
      <nav className="mt-4 space-y-1">
        {items.map(([label, path, Icon]) => {
          const active = route === path || (label === "Investigate" && route.startsWith("/investigate/"));
          return (
            <button key={label} onClick={() => navigate(path)} className={`flex w-full items-center gap-3 border-l-4 px-5 py-3 text-left text-sm transition ${active ? "border-[#16A34A] bg-[#1E293B] text-white" : "border-transparent text-[#94A3B8] hover:bg-[#1E293B]"}`}>
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 border-t border-[#334155] p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#16A34A] text-sm font-bold">IV</div>
          <div>
            <p className="text-sm font-semibold">Investor Demo</p>
            <p className="text-xs text-[#94A3B8]">demo@cgsi.com</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-xs text-[#94A3B8] hover:text-white"><LogOut className="h-3 w-3" />Logout</button>
      </div>
    </aside>
  );
}

function Dashboard({ navigate, watchlist }) {
  const [query, setQuery] = useState("");
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const suggestions = COMPANIES.filter((company) => company.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    setLoading(true);
    Promise.all(FEATURED.map((company) => fetch(`${API}/api/news/${encodeURIComponent(company)}`).then((r) => r.json())))
      .then((groups) => setFeed(groups.flat().slice(0, 6)))
      .finally(() => setTimeout(() => setLoading(false), 250));
  }, []);

  const go = (company) => navigate(`/investigate/${encodeURIComponent(company)}`);

  return (
    <div className="space-y-8">
      <TopLine title="Dashboard" />
      <section className="rounded-lg border border-[#334155] bg-[#1E293B] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#16A34A]">ESG Intelligence Search</p>
        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#94A3B8]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && go(query || "DBS Bank")} placeholder="Search any ASEAN company..." className="h-14 w-full rounded border border-[#334155] bg-[#0F172A] pl-12 pr-4 text-lg outline-none focus:border-[#16A34A]" />
          {query && (
            <div className="absolute z-10 mt-2 w-full rounded border border-[#334155] bg-[#1E293B] shadow-xl">
              {suggestions.slice(0, 8).map((company) => (
                <button key={company} onClick={() => go(company)} className="block w-full px-4 py-3 text-left text-sm hover:bg-[#0F172A]">{company}</button>
              ))}
            </div>
          )}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Live ESG Signals</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {loading ? Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} />) : feed.map((item, index) => <NewsCard key={`${item.headline}-${index}`} item={item} onClick={() => go(item.company)} />)}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold">My Watchlist</h2>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {watchlist.map((company) => <WatchCard key={company} company={company} onClick={() => go(company)} />)}
          <button onClick={() => go("DBS Bank")} className="grid min-w-48 place-items-center rounded-lg border border-dashed border-[#334155] p-4 text-[#94A3B8] hover:text-white"><Plus className="h-5 w-5" />Add company</button>
        </div>
      </section>
    </div>
  );
}

function Investigate({ company, watchlist, toggleWatch }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [scenario, setScenario] = useState("current_trend");
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setStep(0);
    const timer = window.setInterval(() => setStep((value) => Math.min(value + 1, 3)), 700);
    const request = async () => {
      const articles = await fetch(`${API}/api/news/${encodeURIComponent(company)}`).then((r) => r.json());
      const response = await fetch(`${API}/api/analyse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, articles }),
      });
      const data = await response.json();
      await delay(3000);
      if (mounted) {
        window.clearInterval(timer);
        setStep(3);
        setAnalysis(data);
        setLoading(false);
      }
    };
    request();
    return () => { mounted = false; window.clearInterval(timer); };
  }, [company]);

  if (loading || !analysis) return <Pipeline company={company} step={step} />;

  const forecast = analysis.forecast.scenarios[scenario];
  return (
    <div className="space-y-6 pb-24">
      <div className="sticky top-0 z-10 -mx-6 border-b border-[#334155] bg-[#0F172A]/95 px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{analysis.company}</h1>
            <p className="mt-1 text-sm text-[#94A3B8]">{analysis.sector} · {analysis.mode}</p>
          </div>
          <button onClick={() => toggleWatch(company)} className={`rounded border px-3 py-2 text-sm ${watchlist.includes(company) ? "border-[#D97706] text-[#D97706]" : "border-[#334155] text-[#94A3B8]"}`}><Star className="mr-2 inline h-4 w-4" fill={watchlist.includes(company) ? "currentColor" : "none"} />Add to Watchlist</button>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          <ScoreBadge label="E-Score" data={analysis.scores.E} />
          <ScoreBadge label="S-Score" data={analysis.scores.S} />
          <ScoreBadge label="G-Score" data={analysis.scores.G} />
          <ScoreBadge label="Digital ESG" data={analysis.scores.digital} />
        </div>
      </div>
      <Module title="ESG Momentum" chip={analysis.momentum.overall}>
        {["E", "S", "G"].map((key) => <SubScore key={key} label={`${key} Momentum`} row={analysis.momentum[key]} />)}
        <h3 className="mt-5 font-semibold">Why is {analysis.company} momentum {analysis.momentum.overall.toLowerCase()}?</h3>
        <EvidenceGrid evidence={analysis.momentum.evidence} />
        <MomentumMatrix quadrant={analysis.momentum.momentum_quadrant} reason={analysis.momentum.quadrant_reason} />
      </Module>
      <Module title="Red Flag Radar" chip={analysis.risk.status}>
        {analysis.risk.status === "Clear" ? <p className="rounded bg-[#0F172A] p-4 text-[#94A3B8]">No significant ESG risk signals detected in the past 30 days.</p> : analysis.risk.alerts.map((alert, index) => <AlertCard key={index} alert={alert} />)}
        <p className="mt-4 text-xs text-[#94A3B8]">Signals monitored across English + Bahasa + Thai + Vietnamese sources</p>
      </Module>
      <Module title="Digital ESG Score" chip={analysis.digital.pricing_signal}>
        <div className="grid grid-cols-[180px_1fr] gap-6">
          <div className="grid h-36 w-36 place-items-center rounded-full border-8 border-[#0891B2] text-3xl font-bold">{analysis.digital.overall_score}/100</div>
          <div>
            <p className="text-[#94A3B8]">Scoring AI governance, data maturity, and digital sustainability — the ESG pillar no existing framework measures.</p>
            <SubScore label="Digital Hiring Velocity" row={analysis.digital.hiring_velocity} />
            <SubScore label="Innovation Index" row={analysis.digital.innovation_index} />
            <SubScore label="Digital Risk Rating" row={analysis.digital.digital_risk_rating} />
            <p className="mt-3 text-sm text-[#16A34A]">{analysis.company} scores {analysis.digital.sector_benchmark_delta}pts above sector average on Digital ESG</p>
          </div>
        </div>
      </Module>
      <Module title="Future ESG Forecast" chip={analysis.forecast.quadrant_prediction}>
        <div className="flex gap-2">
          {Object.entries({ current_trend: "Current trend continues", accelerated: "Accelerate ESG investment", cuts: "ESG governance cuts" }).map(([key, label]) => (
            <button key={key} onClick={() => setScenario(key)} className={`rounded px-3 py-2 text-sm ${scenario === key ? "bg-[#16A34A]" : "bg-[#0F172A] text-[#94A3B8]"}`}>{label}</button>
          ))}
        </div>
        <ForecastChart values={forecast} current={analysis.forecast.current_score} />
        <table className="mt-4 w-full text-sm"><tbody>{["3mo", "6mo", "9mo", "12mo"].map((m, i) => <tr key={m} className="border-b border-[#334155]"><td className="py-2 text-[#94A3B8]">{m}</td><td className="py-2 font-semibold">{forecast[i]}</td></tr>)}</tbody></table>
        <p className="mt-4 rounded bg-[#0F172A] p-4 text-[#16A34A]">{analysis.forecast.key_insight}</p>
      </Module>
      <button onClick={() => setDrawer(true)} className="fixed bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full bg-[#16A34A] shadow-xl"><Bot className="h-6 w-6" /></button>
      {drawer && <AIAssistant company={company} context={analysis} close={() => setDrawer(false)} />}
    </div>
  );
}

function Compare() {
  const [selected, setSelected] = useState(["DBS Bank", "Grab"]);
  const rows = ["E-Score", "S-Score", "G-Score", "Digital ESG", "Momentum", "Risk Status", "12mo Forecast"];
  return (
    <div className="space-y-6">
      <TopLine title="Compare Companies" />
      <div className="rounded-lg border border-[#334155] bg-[#1E293B] p-5">
        <div className="flex gap-2">{COMPANIES.slice(0, 8).map((company) => <button key={company} onClick={() => setSelected((items) => items.includes(company) ? items.filter((x) => x !== company) : [...items, company].slice(0, 3))} className={`rounded px-3 py-2 text-sm ${selected.includes(company) ? "bg-[#16A34A]" : "bg-[#0F172A] text-[#94A3B8]"}`}>{company}</button>)}</div>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#334155] bg-[#1E293B]">
        <table className="w-full text-sm">
          <thead><tr><th className="bg-[#0F172A] p-3 text-left">Metric</th>{selected.map((c) => <th key={c} className="bg-[#0F172A] p-3 text-left">{c}</th>)}</tr></thead>
          <tbody>{rows.map((row, idx) => <tr key={row} className="border-t border-[#334155]"><td className="p-3 text-[#94A3B8]">{row}</td>{selected.map((c, i) => <td key={c} className="p-3 font-semibold">{mockCompareValue(row, idx, i)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <Module title="AI-generated Comparison Summary" chip="Generated">
        <p className="text-[#94A3B8]">DBS shows stronger institutional ESG momentum, while Grab has the clearest hidden-winner profile because Digital ESG and improvement velocity are high relative to current recognised ESG maturity.</p>
        <button className="mt-4 rounded bg-[#16A34A] px-4 py-2 font-semibold">Which should I invest in?</button>
      </Module>
    </div>
  );
}

function Watchlist({ watchlist, toggleWatch, navigate }) {
  return (
    <div className="space-y-6">
      <TopLine title="Watchlist" />
      {watchlist.length === 0 ? <div className="rounded-lg border border-[#334155] bg-[#1E293B] p-10 text-center text-[#94A3B8]">No companies in watchlist. Search to add your first company.</div> : (
        <div className="grid grid-cols-3 gap-4">{watchlist.map((company) => <div key={company} className="rounded-lg border border-[#334155] bg-[#1E293B] p-5"><button onClick={() => navigate(`/investigate/${encodeURIComponent(company)}`)} className="text-xl font-semibold hover:text-[#16A34A]">{company}</button><div className="mt-4 grid grid-cols-2 gap-2 text-sm"><span>E 76 ↑</span><span>S 71 →</span><span>G 80 ↑</span><span>Digital 82 ↑</span></div><p className="mt-3 text-xs text-[#94A3B8]">Last updated 2h ago</p><button onClick={() => toggleWatch(company)} className="mt-4 text-xs text-[#DC2626]"><Trash2 className="mr-1 inline h-3 w-3" />Remove</button></div>)}</div>
      )}
    </div>
  );
}

function Pipeline({ company, step }) {
  return (
    <div className="grid min-h-[75vh] place-items-center">
      <div className="w-full max-w-3xl rounded-lg border border-[#334155] bg-[#1E293B] p-8">
        <h1 className="text-3xl font-semibold">Investigating {company}</h1>
        <p className="mt-2 text-[#94A3B8]">Running AI ESG signal pipeline with mock fallback ready.</p>
        <div className="mt-8 space-y-3">
          {STEPS.map((label, index) => <div key={label} className={`flex items-center gap-3 rounded border p-4 transition ${index === step ? "border-[#16A34A] bg-[#0F172A]" : index < step ? "border-[#334155] bg-[#0F172A]/50" : "border-[#334155]"}`}>{index === step ? <Loader2 className="h-5 w-5 animate-spin text-[#16A34A]" /> : <CheckCircle2 className={`h-5 w-5 ${index < step ? "text-[#16A34A]" : "text-[#334155]"}`} />}<span>{label}</span></div>)}
        </div>
      </div>
    </div>
  );
}

function AIAssistant({ company, context, close }) {
  const [openMessages, setOpenMessages] = useState([{ role: "assistant", content: `Ask me anything about ${company}'s ESG intelligence.` }]);
  const [text, setText] = useState("");
  const ask = async (content) => {
    if (!content) return;
    setOpenMessages((m) => [...m, { role: "user", content }]);
    setText("");
    const response = await fetch(`${API}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company, context, messages: [{ role: "user", content }] }) });
    const data = await response.json();
    setOpenMessages((m) => [...m, { role: "assistant", content: data.answer }]);
  };
  return (
    <aside className="fixed bottom-0 right-0 top-0 z-30 w-[350px] border-l border-[#334155] bg-[#1E293B] p-4 shadow-2xl">
      <div className="flex items-center justify-between"><h2 className="font-semibold">Ask AI</h2><button onClick={close}>Close</button></div>
      <div className="mt-4 flex flex-wrap gap-2">{["Why is this a hidden winner?", "What's the biggest ESG risk?", "Compare to sector"].map((q) => <button key={q} onClick={() => ask(q)} className="rounded bg-[#0F172A] px-2 py-1 text-xs text-[#94A3B8]">{q}</button>)}</div>
      <div className="mt-4 h-[70vh] space-y-3 overflow-auto">{openMessages.map((m, i) => <div key={i} className={`rounded p-3 text-sm ${m.role === "user" ? "bg-[#0F172A]" : "bg-[#0F172A]/60 text-[#94A3B8]"}`}>{m.content}</div>)}</div>
      <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className="mt-3 flex gap-2"><input value={text} onChange={(e) => setText(e.target.value)} className="min-w-0 flex-1 rounded border border-[#334155] bg-[#0F172A] px-3 text-sm outline-none" /><button className="rounded bg-[#16A34A] p-2"><Send className="h-4 w-4" /></button></form>
    </aside>
  );
}

function Module({ title, chip, children }) {
  return <section className="rounded-lg border border-[#334155] bg-[#1E293B] p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">{title}</h2><span className="rounded bg-[#0F172A] px-3 py-1 text-sm text-[#16A34A]">{chip}</span></div>{children}</section>;
}
function ScoreBadge({ label, data }) { return <div className="rounded border border-[#334155] bg-[#1E293B] p-3"><p className="text-xs text-[#94A3B8]">{label}</p><p className="mt-1 text-xl font-semibold">{data.score} <span className="text-[#16A34A]">{trendSymbol(data.trend)}</span></p></div>; }
function SubScore({ label, row }) { const score = row.score || 50; return <div className="mt-3"><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{score} {trendSymbol(row.direction)}</span></div><div className="h-2 rounded bg-[#0F172A]"><div className="h-2 rounded bg-[#16A34A]" style={{ width: `${score}%` }} /></div><p className="mt-1 text-xs text-[#94A3B8]">{row.reason || row.evidence}</p></div>; }
function EvidenceGrid({ evidence = [] }) { return <div className="mt-3 grid grid-cols-2 gap-3">{evidence.map((e, i) => <div key={i} className="rounded border border-[#334155] bg-[#0F172A] p-3"><p className="text-xs text-[#94A3B8]">{e.source} · {e.date}</p><p className="mt-1 text-sm">{e.title || e.headline}</p><span className="mt-2 inline-block rounded bg-[#1E293B] px-2 py-1 text-xs text-[#0891B2]">{e.signal_type || "ESG Signal"}</span></div>)}</div>; }
function MomentumMatrix({ quadrant, reason }) { return <div className="mt-5 rounded border border-[#334155] bg-[#0F172A] p-4"><p className="font-semibold">Momentum Matrix: {quadrant}</p><div className="relative mt-3 grid h-40 grid-cols-2 grid-rows-2 border border-[#334155] text-xs text-[#94A3B8]"><div className="p-2">Hidden Winner</div><div className="p-2 text-right">Future Leader</div><div className="p-2 self-end">Value Trap</div><div className="p-2 self-end text-right">Overrated Leader</div><div className="absolute left-[60%] top-[28%] h-4 w-4 rounded-full bg-[#16A34A]" /></div><p className="mt-3 text-sm text-[#94A3B8]">{reason}</p></div>; }
function AlertCard({ alert }) { return <div className="rounded border border-[#334155] bg-[#0F172A] p-4"><span className="rounded bg-[#D97706] px-2 py-1 text-xs">{alert.severity}</span><p className="mt-3 font-semibold">{alert.category}</p><p className="mt-1 text-sm text-[#94A3B8]">{alert.description}</p><p className="mt-2 text-xs text-[#94A3B8]">{alert.source} · {alert.date} · {alert.time_to_impact}</p></div>; }
function ForecastChart({ values, current }) { const points = [current, ...values].map((v, i) => `${i * 80},${120 - Math.max(0, Math.min(100, v))}` ).join(" "); return <svg className="mt-5 h-36 w-full rounded bg-[#0F172A]" viewBox="0 0 340 140"><polyline fill="none" stroke="#16A34A" strokeWidth="4" points={points} /></svg>; }
function NewsCard({ item, onClick }) { return <button onClick={onClick} className="rounded-lg border border-[#334155] bg-[#1E293B] p-4 text-left transition hover:border-[#16A34A]"><span className="rounded bg-[#0F172A] px-2 py-1 text-xs text-[#16A34A]">{item.company}</span><p className="mt-3 font-semibold">{item.headline}</p><p className="mt-2 text-xs text-[#94A3B8]">{item.source} · {item.time_ago}</p><span className="mt-3 inline-block rounded bg-[#0F172A] px-2 py-1 text-xs text-[#0891B2]">{signalIcon(item.signal)} {item.signal}</span></button>; }
function WatchCard({ company, onClick }) { return <button onClick={onClick} className="min-w-56 rounded-lg border border-[#334155] bg-[#1E293B] p-4 text-left hover:border-[#16A34A]"><p className="font-semibold">{company}</p><p className="mt-2 text-sm text-[#16A34A]">↑ Momentum</p><p className="mt-1 text-sm text-[#0891B2]">Digital ESG 82</p></button>; }
function Skeleton() { return <div className="h-36 animate-pulse rounded-lg border border-[#334155] bg-[#1E293B]" />; }
function TopLine({ title }) { return <div className="flex items-center justify-between"><h1 className="text-3xl font-semibold">{title}</h1><div className="flex items-center gap-3 text-[#94A3B8]"><Bell className="h-5 w-5" />Live demo mode</div></div>; }
function signalIcon(signal) { return signal === "Environmental" ? "🌱" : signal === "Social" ? "👥" : signal === "Governance" ? "🏛" : "💻"; }
function trendSymbol(value) { return value === "up" ? "↑" : value === "down" ? "↓" : value === "flat" ? "→" : value || ""; }
function mockCompareValue(row, idx, col) { if (row.includes("Risk")) return col === 1 ? "Watch" : "Clear"; if (row.includes("Momentum")) return col === 1 ? "Rising ↑" : "Rising ↑"; if (row.includes("Forecast")) return col === 1 ? "84 ↑" : "88 ↑"; return `${78 + idx + col * 3} ↑`; }
function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function getRoute() { return window.location.hash.replace("#", "") || "/"; }
function readList(key, fallback) { try { const parsed = JSON.parse(localStorage.getItem(key) || "null"); return Array.isArray(parsed) ? parsed : fallback; } catch { return fallback; } }
