import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { momentumSeries } from "../../utils/scoring.js";

const strokes = ["#22c55e", "#06b6d4", "#a78bfa", "#f59e0b", "#38bdf8", "#f472b6"];

export default function MomentumChart({ companies, height = 310 }) {
  const leaders = [...companies].sort((a, b) => b.momentum_score - a.momentum_score).slice(0, 6);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={momentumSeries(companies)}>
        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
        <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
        <YAxis stroke="#64748b" tickLine={false} axisLine={false} domain={[30, 100]} />
        <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 8 }} />
        {leaders.map((company, index) => (
          <Line key={company.company_id} type="monotone" dataKey={company.company_name} stroke={strokes[index]} strokeWidth={2.5} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
