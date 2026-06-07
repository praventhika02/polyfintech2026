export default function GlassCard({ children, className = "", interactive = false }) {
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white shadow-sm ${
        interactive ? "transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_18px_44px_rgba(15,23,42,0.08)]" : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}
