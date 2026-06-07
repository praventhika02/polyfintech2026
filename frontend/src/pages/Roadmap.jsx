import { roadmapPhases } from "../data/companies.js";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";

export default function Roadmap() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Product Roadmap"
        title="From ESG signals to portfolio intelligence"
        description="The MVP establishes the intelligence layer. Future phases extend it into forecasting, geospatial verification and portfolio construction."
      />
      <div className="relative space-y-5">
        <div className="absolute bottom-8 left-5 top-8 hidden w-px bg-gradient-to-b from-emerald-300 via-cyan-300 to-slate-700 md:block" />
        {roadmapPhases.map((phase, index) => (
          <div key={phase.phase} className="relative md:pl-16">
            <div className="absolute left-0 top-6 hidden h-10 w-10 place-items-center rounded-lg border border-cyan-300/25 bg-slate-950 text-cyan-200 md:grid">
              {index + 1}
            </div>
            <GlassCard className="p-6" interactive>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{phase.phase}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{phase.title}</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {phase.items.map((item) => (
                  <div key={item} className="rounded-lg border border-slate-400/10 bg-slate-950/45 p-4 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  );
}
