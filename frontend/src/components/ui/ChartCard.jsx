import GlassCard from "./GlassCard.jsx";

export default function ChartCard({ icon: Icon, title, subtitle, children, className = "" }) {
  return (
    <GlassCard className={`p-5 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-cyan-300" />}
            <h2 className="font-semibold text-slate-100">{title}</h2>
          </div>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </GlassCard>
  );
}
