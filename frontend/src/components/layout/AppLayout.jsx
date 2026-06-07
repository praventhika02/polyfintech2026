import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppLayout({ route, navigate, query, setQuery, children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(34,197,94,0.18),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(6,182,212,0.16),transparent_24%),linear-gradient(180deg,#020617,#0f172a_42%,#020617)]" />
      <Sidebar route={route} navigate={navigate} />
      <Topbar query={query} setQuery={setQuery} />
      <main className="relative mx-auto max-w-7xl px-4 py-6 lg:pl-80">{children}</main>
    </div>
  );
}
