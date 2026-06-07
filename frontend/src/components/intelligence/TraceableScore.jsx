import GlassCard from "../ui/GlassCard.jsx";

export default function TraceableScore({ title, score }) {
  if (!score) return null;
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{score.explanation}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold text-slate-950">{score.score}</p>
          <p className="mt-1 text-xs text-slate-500">Confidence {score.confidence_score}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(score.sources_used || []).map((source) => (
          <span key={source} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
            {source}
          </span>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {(score.supporting_evidence || []).slice(0, 3).map((item, index) => (
          <div key={`${item.title}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-900">{item.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{item.excerpt || item.source}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
