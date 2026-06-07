import GlassCard from "../ui/GlassCard.jsx";

export default function EvidenceList({ evidence }) {
  const articles = evidence?.source_articles || [];
  const keywords = evidence?.keywords_found || [];
  return (
    <GlassCard className="p-5">
      <h3 className="font-semibold text-slate-100">Source Evidence</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {keywords.map((keyword) => (
          <span key={keyword} className="rounded-full border border-emerald-300/15 bg-emerald-300/10 px-2.5 py-1 text-xs text-emerald-200">
            {keyword}
          </span>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {articles.map((article, index) => (
          <div key={`${article.title}-${index}`} className="rounded-lg border border-slate-400/10 bg-slate-950/45 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-medium text-slate-100">{article.title}</p>
                <p className="mt-1 text-xs text-slate-500">{article.source} | {article.date || "No date"}</p>
              </div>
              {article.url && <a className="text-xs text-cyan-300 hover:text-cyan-100" href={article.url} target="_blank" rel="noreferrer">Open source</a>}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{article.excerpt}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
