import { Bot, Send } from "lucide-react";
import { useState } from "react";
import { API_BASE } from "../../data/companies.js";
import GlassCard from "../ui/GlassCard.jsx";

export default function AssistantPanel({ analysis }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);

  const ask = async (text = question) => {
    if (!analysis || !text.trim()) return;
    setThinking(true);
    setMessages((items) => [...items, { role: "user", text }]);
    setQuestion("");
    try {
      const response = await fetch(`${API_BASE}/assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis, question: text }),
      });
      const data = await response.json();
      setMessages((items) => [...items, { role: "assistant", text: data.answer, evidence: data.evidence || [] }]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-emerald-600" />
        <h3 className="font-semibold text-slate-950">AI Assistant</h3>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(analysis?.suggested_questions || []).map((item) => (
          <button key={item} onClick={() => ask(item)} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-left text-xs text-emerald-700 hover:bg-emerald-100">
            {item}
          </button>
        ))}
      </div>
      <div className="mt-5 max-h-[420px] space-y-3 overflow-auto pr-1">
        {messages.map((message, index) => (
          <div key={index} className={`rounded-lg p-3 ${message.role === "user" ? "bg-slate-900 text-white" : "bg-emerald-50 text-slate-700"}`}>
            <p className="text-sm leading-6">{message.text}</p>
            {message.evidence?.length > 0 && <p className="mt-2 text-xs text-slate-500">Evidence-backed answer</p>}
          </div>
        ))}
        {thinking && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Generating answer from analysis evidence...</div>}
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          ask();
        }}
      >
        <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about risk, outlook, hidden winner signals..." className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-400" />
        <button className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-500 text-white">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </GlassCard>
  );
}
