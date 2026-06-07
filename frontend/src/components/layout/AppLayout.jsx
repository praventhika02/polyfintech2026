import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppLayout({ route, navigate, query, setQuery, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(34,197,94,0.12),transparent_26%),radial-gradient(circle_at_85%_10%,rgba(6,182,212,0.12),transparent_24%),linear-gradient(180deg,#f8fafc,#eefdf5_45%,#f8fafc)]" />
      <Sidebar route={route} navigate={navigate} />
      <Topbar query={query} setQuery={setQuery} />
      <main className="relative mx-auto max-w-7xl px-4 py-6 lg:pl-80">{children}</main>
    </div>
  );
}
