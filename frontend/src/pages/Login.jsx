import { BrainCircuit, Leaf, Lock, Mail, ShieldCheck, TrendingUp } from "lucide-react";
import { platformPillars } from "../data/companies.js";

export default function Login({ onLogin }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,197,94,0.22),transparent_30%),radial-gradient(circle_at_82%_40%,rgba(6,182,212,0.2),transparent_26%),linear-gradient(135deg,#020617,#0f172a_55%,#020617)]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-lg border border-slate-400/15 bg-slate-900/70 p-6 shadow-[0_24px_90px_rgba(2,6,23,0.5)] backdrop-blur-xl md:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/20">
              <Leaf className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-white">ESG Pulse 360</h1>
              <p className="text-sm text-slate-500">Don't just measure ESG. Predict it.</p>
            </div>
          </div>
          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Secure investor workspace</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Sign in to intelligence layer</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Monitor ESG momentum, risk and digital readiness before traditional ratings move.</p>
          </div>
          <form className="mt-8 space-y-4" onSubmit={(event) => { event.preventDefault(); onLogin(); }}>
            <label className="block">
              <span className="text-sm text-slate-400">Email</span>
              <span className="relative mt-2 block">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input className="h-12 w-full rounded-lg border border-slate-400/15 bg-slate-950/60 pl-10 pr-3 text-sm text-slate-100 outline-none focus:border-cyan-300/45" defaultValue="investor@demo.com" />
              </span>
            </label>
            <label className="block">
              <span className="text-sm text-slate-400">Password</span>
              <span className="relative mt-2 block">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type="password" className="h-12 w-full rounded-lg border border-slate-400/15 bg-slate-950/60 pl-10 pr-3 text-sm text-slate-100 outline-none focus:border-cyan-300/45" defaultValue="demo12345" />
              </span>
            </label>
            <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 font-semibold text-slate-950 transition hover:brightness-110">
              <ShieldCheck className="h-4 w-4" />
              Login
            </button>
            <button type="button" onClick={onLogin} className="h-12 w-full rounded-lg border border-cyan-300/25 bg-cyan-300/10 font-semibold text-cyan-100 transition hover:bg-cyan-300/15">
              Demo Login
            </button>
          </form>
        </section>
        <section className="space-y-5">
          <div className="rounded-lg border border-slate-400/15 bg-slate-900/55 p-6 backdrop-blur-xl">
            <BrainCircuit className="h-8 w-8 text-cyan-300" />
            <h2 className="mt-5 text-4xl font-semibold text-white md:text-5xl">Predictive ESG intelligence for ASEAN investors.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
              ESG Pulse 360 is not another ESG scorecard. It is a real-time AI intelligence layer that helps investors discover future ESG leaders, detect emerging risks, and evaluate digital readiness before the market reacts.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {platformPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="rounded-lg border border-slate-400/15 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-emerald-300/30">
                  <Icon className="h-5 w-5 text-emerald-300" />
                  <p className="mt-4 font-semibold text-white">{pillar.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{pillar.description}</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-emerald-300/15 bg-emerald-300/10 p-4 text-sm text-emerald-100">
            <TrendingUp className="h-5 w-5" />
            Live demo mode uses rule-based ESG/NLP scoring and is ready for future LLM integration.
          </div>
        </section>
      </div>
    </main>
  );
}
