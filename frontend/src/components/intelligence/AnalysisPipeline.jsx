import { CheckCircle2, Loader2 } from "lucide-react";

const steps = ["Collecting Signals", "Analysing ESG Data", "Generating Intelligence"];

export default function AnalysisPipeline({ active }) {
  if (!active) return null;
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {steps.map((step, index) => (
        <div key={step} className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
          <div className="flex items-center gap-3">
            {index === steps.length - 1 ? <Loader2 className="h-5 w-5 animate-spin text-cyan-300" /> : <CheckCircle2 className="h-5 w-5 text-emerald-300" />}
            <span className="font-semibold text-slate-100">{step}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">AI pipeline step {index + 1}</p>
        </div>
      ))}
    </div>
  );
}
