import GlassCard from "./GlassCard.jsx";

const toneClasses = {
  emerald: "from-emerald-400/25 text-emerald-300",
  cyan: "from-cyan-400/25 text-cyan-300",
  amber: "from-amber-400/25 text-amber-300",
  red: "from-red-400/25 text-red-300",
};

export default function MetricCard({ icon: Icon, label, value, description, trend = "+8.4%", tone = "emerald" }) {
  return (
    <GlassCard className="p-5" interactive>
      <div className="flex items-start justify-between gap-4">
        <div className={`rounded-lg bg-gradient-to-br ${toneClasses[tone]} to-transparent p-2`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-xs font-medium text-emerald-200">
          {trend}
        </span>
      </div>
      <p className="mt-5 text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {description && <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>}
    </GlassCard>
  );
}
