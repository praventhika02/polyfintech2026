const styles = {
  Low: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  Medium: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  High: "border-red-400/20 bg-red-400/10 text-red-300",
};

export default function RiskBadge({ level }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[level] || styles.Low}`}>
      {level}
    </span>
  );
}
