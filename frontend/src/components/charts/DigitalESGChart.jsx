import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DigitalESGChart({ companies, height = 310 }) {
  const rows = [...companies].sort((a, b) => b.digital_esg_score - a.digital_esg_score).slice(0, 10);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows}>
        <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
        <XAxis dataKey="company_name" stroke="#64748b" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(148,163,184,0.18)", borderRadius: 8 }} />
        <Bar dataKey="digital_esg_score" fill="#06b6d4" radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
