import GlassCard from "../ui/GlassCard.jsx";

export default function SignalCard({ signal }) {
  const positive = signal.sentiment !== "Negative";
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-slate-100">{signal.title}</p>
          <p className="mt-1 text-xs text-slate-500">{signal.date} | {signal.source}</p>
        </div>
        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${positive ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300" : "border-red-300/20 bg-red-300/10 text-red-300"}`}>
          {signal.sentiment}
        </span>
      </div>
    </GlassCard>
  );
}
