import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { riskColors, riskDistribution } from "../../utils/scoring.js";

export default function RiskDistributionChart({ companies, height = 300 }) {
  const rows = riskDistribution(companies);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={rows} innerRadius={72} outerRadius={104} dataKey="value" nameKey="name" paddingAngle={4}>
          {rows.map((entry) => (
            <Cell key={entry.name} fill={riskColors[entry.name]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 8 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
