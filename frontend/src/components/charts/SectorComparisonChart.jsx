import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { sectorComparison } from "../../utils/scoring.js";

export default function SectorComparisonChart({ companies, height = 310 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sectorComparison(companies).slice(0, 8)}>
        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
        <XAxis dataKey="sector" stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 8 }} />
        <Legend />
        <Bar dataKey="momentum" fill="#22c55e" radius={[5, 5, 0, 0]} />
        <Bar dataKey="digital" fill="#06b6d4" radius={[5, 5, 0, 0]} />
        <Bar dataKey="risk" fill="#f59e0b" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
