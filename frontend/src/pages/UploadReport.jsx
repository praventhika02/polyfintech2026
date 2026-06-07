import { FileText, UploadCloud } from "lucide-react";
import { useState } from "react";
import AnalysisPipeline from "../components/intelligence/AnalysisPipeline.jsx";
import GlassCard from "../components/ui/GlassCard.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { API_BASE } from "../data/companies.js";

export default function UploadReport({ setAnalysis, navigate }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [running, setRunning] = useState(false);

  const handleFile = async (selected) => {
    if (!selected) return;
    setFile(selected);
    if (selected.type === "text/plain" || selected.name.endsWith(".txt")) {
      setText(await selected.text());
    } else {
      setText(`${selected.name} uploaded. Browser preview for PDF/DOCX is limited in this MVP; add report excerpts here before analysis.`);
    }
  };

  const run = async () => {
    setRunning(true);
    const response = await fetch(`${API_BASE}/analysis/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_name: file?.name || "Manual ESG Notes.txt", file_type: file?.type || "txt", text }),
    });
    const data = await response.json();
    setAnalysis(data);
    setRunning(false);
    navigate("/workspace");
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Upload Report" title="Extract ESG intelligence from corporate documents" description="Upload sustainability reports, annual reports or ESG notes, preview extracted text, then run analysis." />
      <AnalysisPipeline active={running} />
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard className="p-6">
          <label
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleFile(event.dataTransfer.files?.[0]);
            }}
            className="grid min-h-[260px] cursor-pointer place-items-center rounded-lg border border-dashed border-cyan-300/30 bg-cyan-300/5 p-8 text-center"
          >
            <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
            <div>
              <UploadCloud className="mx-auto h-10 w-10 text-cyan-300" />
              <p className="mt-4 font-semibold text-white">Drag and drop report</p>
              <p className="mt-2 text-sm text-slate-500">PDF, DOCX or TXT. TXT files are previewed automatically.</p>
            </div>
          </label>
          {file && (
            <div className="mt-5 rounded-lg border border-slate-400/10 bg-slate-950/45 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="font-semibold text-slate-100">{file.name}</p>
                  <p className="text-xs text-slate-500">{Math.round(file.size / 1024)} KB</p>
                </div>
              </div>
            </div>
          )}
          <button onClick={run} disabled={running} className="mt-5 w-full rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-50">
            Run ESG Analysis
          </button>
        </GlassCard>
        <GlassCard className="p-5">
          <h3 className="font-semibold text-slate-100">Extracted Text Preview</h3>
          <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste ESG report excerpts here, or upload a TXT file..." className="mt-4 min-h-[360px] w-full resize-y rounded-lg border border-slate-400/10 bg-slate-950/60 p-4 text-sm leading-6 text-slate-200 outline-none focus:border-cyan-300/45" />
        </GlassCard>
      </div>
    </div>
  );
}
