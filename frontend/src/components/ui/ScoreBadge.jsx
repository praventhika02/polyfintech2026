import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

export default function ScoreBadge({ label, score }) {
  const Icon = label === "Rising" ? ArrowUp : label === "Declining" ? ArrowDown : ArrowRight;
  const color = label === "Rising" ? "text-emerald-300" : label === "Declining" ? "text-red-300" : "text-amber-300";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-slate-400/15 bg-slate-950/50 px-2.5 py-1 text-xs font-semibold ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {score} {label && <span className="text-slate-400">{label}</span>}
    </span>
  );
}
