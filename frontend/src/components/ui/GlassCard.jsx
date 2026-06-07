export default function GlassCard({ children, className = "", interactive = false }) {
  return (
    <section
      className={`rounded-lg border border-slate-400/15 bg-slate-900/70 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl ${
        interactive ? "transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_24px_90px_rgba(6,182,212,0.15)]" : ""
      } ${className}`}
    >
      {children}
    </section>
  );
}
