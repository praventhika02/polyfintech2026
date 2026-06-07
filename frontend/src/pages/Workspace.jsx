import { BrainCircuit, Calendar, Save, Target } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AssistantPanel from "../components/intelligence/AssistantPanel.jsx";
import EvidenceList from "../components/intelligence/EvidenceList.jsx";
import TraceableScore from "../components/intelligence/TraceableScore.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";

const tabs = ["Executive Summary", "Momentum Analysis", "Hidden Winner Analysis", "ESG Risk Radar", "Digital ESG Intelligence", "Source Evidence"];

export default function Workspace({ analysis, activeTab, setActiveTab, navigate, onSave }) {
  if (!analysis) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Intelligence Workspace" title="Start an investigation" description="Search a company or upload a report to generate traceable ESG intelligence." />
        <GlassCard className="p-8 text-center">
          <BrainCircuit className="mx-auto h-10 w-10 text-cyan-300" />
          <h2 className="mt-4 text-2xl font-semibold text-white">No active analysis yet</h2>
          <p className="mt-2 text-slate-500">Run company analysis or upload a report to populate the workspace.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => navigate("/analyse")} className="rounded-lg bg-cyan-300 px-4 py-2 font-semibold text-slate-950">Search Company</button>
            <button onClick={() => navigate("/upload")} className="rounded-lg border border-slate-400/15 px-4 py-2 font-semibold text-slate-200">Upload Report</button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <PageHeader
          eyebrow={analysis.mode}
          title={analysis.company_name}
          description="Generated ESG intelligence with traceable scores, source evidence and AI assistant support."
          action={<button onClick={onSave} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white"><Save className="h-4 w-4" />Save Analysis</button>}
        />
        {analysis.mode === "Demo Dataset Mode" && (
          <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-3 text-sm font-semibold text-amber-100">
            Demo Dataset Mode: live source collection was unavailable or demo mode was selected.
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-semibold ${activeTab === tab ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100" : "border-slate-400/10 bg-slate-950/40 text-slate-500 hover:text-slate-200"}`}>
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "Executive Summary" && <ExecutiveSummary analysis={analysis} />}
        {activeTab === "Momentum Analysis" && <MomentumTab analysis={analysis} />}
        {activeTab === "Hidden Winner Analysis" && <TraceableScore title="Hidden Winner Analysis" score={analysis.scores.hidden_winner} />}
        {activeTab === "ESG Risk Radar" && <TraceableScore title="ESG Risk Radar" score={analysis.scores.risk} />}
        {activeTab === "Digital ESG Intelligence" && <DigitalTab analysis={analysis} />}
        {activeTab === "Source Evidence" && <EvidenceList evidence={analysis.evidence} />}
        <SignalTimeline events={analysis.timeline || []} />
      </div>
      <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
        <AssistantPanel analysis={analysis} />
        <EvidenceList evidence={{ ...analysis.evidence, source_articles: (analysis.evidence?.source_articles || []).slice(0, 3) }} />
      </div>
    </div>
  );
}

function SignalTimeline({ events }) {
  if (!events.length) return null;
  return (
    <GlassCard className="p-5">
      <h3 className="font-semibold text-slate-950">ESG Signal Timeline</h3>
      <p className="mt-1 text-sm text-slate-600">What happened, when it happened, and why it affected the analysis.</p>
      <div className="mt-5 space-y-3">
        {events.map((event, index) => (
          <div key={`${event.title}-${index}`} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[110px_1fr_190px]">
            <div className="text-sm font-semibold text-slate-500">{event.date || "No date"}</div>
            <div>
              <p className="font-semibold text-slate-950">{event.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{event.reason}</p>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-emerald-700">{event.category}</p>
              <p className="mt-1 text-slate-500">{event.impact}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function ExecutiveSummary({ analysis }) {
  const items = [
    ["Key Opportunity", analysis.executive_summary.key_opportunity],
    ["Key Risk", analysis.executive_summary.key_risk],
    ["ESG Outlook", analysis.executive_summary.esg_outlook],
    ["Digital Readiness", analysis.executive_summary.digital_readiness],
  ];
  return (
    <div className="space-y-5">
      <GlassCard className="p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <SummaryMetric icon={Calendar} label="Analysis Date" value={analysis.analysis_date?.slice(0, 10)} />
          <SummaryMetric icon={Target} label="Confidence" value={analysis.confidence_score} />
          <SummaryMetric icon={BrainCircuit} label="Recommendation" value={analysis.recommendation} wide />
          <SummaryMetric icon={Target} label="Mode" value={analysis.mode} />
        </div>
        <p className="mt-5 text-sm leading-7 text-slate-400">{analysis.recommendation_explanation}</p>
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(([label, value]) => (
          <GlassCard key={label} className="p-5">
            <p className="text-sm font-semibold text-cyan-200">{label}</p>
            <p className="mt-3 text-sm leading-7 text-slate-400">{value}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function SummaryMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-400/10 bg-slate-950/45 p-4">
      <Icon className="h-5 w-5 text-cyan-300" />
      <p className="mt-3 text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words font-semibold text-white">{value}</p>
    </div>
  );
}

function MomentumTab({ analysis }) {
  return (
    <div className="space-y-5">
      <TraceableScore title="Momentum Analysis" score={analysis.scores.momentum} />
      <GlassCard className="p-5">
        <h3 className="font-semibold text-slate-100">Momentum Trend</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={analysis.trend || []}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 8 }} />
            <Line dataKey="score" stroke="#22c55e" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}

function DigitalTab({ analysis }) {
  const rows = [
    ["AI Adoption", analysis.breakdown.ai_adoption],
    ["Cybersecurity", analysis.breakdown.cybersecurity],
    ["Data Governance", analysis.breakdown.data_governance],
    ["Digital Innovation", analysis.breakdown.digital_innovation],
    ["Responsible AI", analysis.breakdown.responsible_ai],
  ].map(([name, value]) => ({ name, value }));
  return (
    <div className="space-y-5">
      <TraceableScore title="Digital ESG Intelligence" score={analysis.scores.digital_esg} />
      <GlassCard className="p-5">
        <h3 className="font-semibold text-slate-100">Digital Readiness Factors</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={rows}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} interval={0} />
            <YAxis stroke="#64748b" domain={[0, 100]} />
            <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 8 }} />
            <Bar dataKey="value" fill="#06b6d4" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
