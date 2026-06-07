import { CheckCircle2, Loader2 } from "lucide-react";

const steps = [
  "Fetching signals",
  "Analysing momentum",
  "Scanning risks",
  "Computing Digital ESG",
];

export default function AnalysisPipeline({ active, signals, currentStep = 0 }) {
  if (!active && !signals) return null;
  const counts = signals
    ? [
        ["articles found", signals.articles_found],
        ["sustainability announcements", signals.sustainability_announcements],
        ["AI hiring signals", signals.ai_hiring_signals],
        ["regulatory disclosures", signals.regulatory_disclosures],
      ]
    : [];
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`rounded-lg border p-4 shadow-sm transition duration-150 ${
              active && index === currentStep
                ? "border-emerald-400 bg-emerald-50"
                : index < currentStep || !active
                  ? "border-emerald-200 bg-white"
                  : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              {active && index === currentStep ? <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> : <CheckCircle2 className={`h-5 w-5 ${index < currentStep || !active ? "text-emerald-600" : "text-slate-300"}`} />}
              <span className="font-semibold text-slate-950">{step}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {index === 0 && "NewsAPI/RSS or mock signal fallback"}
              {index === 1 && "Momentum evidence extraction"}
              {index === 2 && "Governance, labour and controversy scan"}
              {index === 3 && "AI, cyber and data governance signals"}
            </p>
          </div>
        ))}
      </div>
      {counts.length > 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Live Signals Detected</p>
          <div className="mt-3 grid gap-3 md:grid-cols-4">
            {counts.map(([label, value]) => (
              <div key={label}>
                <p className="text-2xl font-semibold text-slate-950">{value}</p>
                <p className="text-sm text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
