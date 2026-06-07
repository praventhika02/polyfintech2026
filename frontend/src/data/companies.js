import {
  AlertTriangle,
  BrainCircuit,
  Building2,
  Files,
  LayoutDashboard,
  Leaf,
  Map,
  Rocket,
  Search,
  ShieldCheck,
  TrendingUp,
  UploadCloud,
} from "lucide-react";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export const navigationItems = [
  { path: "/overview", label: "Overview", icon: LayoutDashboard },
  { path: "/analyse", label: "Analyse Company", icon: Search },
  { path: "/upload", label: "Upload Report", icon: UploadCloud },
  { path: "/workspace", label: "Intelligence Workspace", icon: BrainCircuit },
  { path: "/compare", label: "Compare Companies", icon: Files },
  { path: "/roadmap", label: "Roadmap", icon: Map },
];

export const platformPillars = [
  {
    title: "Real-time ESG Momentum",
    description: "Tracks green financing, sustainability hiring, innovation and fresh ESG initiatives.",
    icon: TrendingUp,
  },
  {
    title: "Hidden Winner Discovery",
    description: "Finds under-recognised companies with improving forward ESG signals.",
    icon: Search,
  },
  {
    title: "ESG Risk Radar",
    description: "Surfaces governance, labour, regulatory and environmental warning signals.",
    icon: AlertTriangle,
  },
  {
    title: "Digital ESG Intelligence",
    description: "Measures AI adoption, cyber readiness, data governance and responsible technology.",
    icon: BrainCircuit,
  },
];

export const signalCards = [
  { label: "Positive News", metric: "ESG headlines", icon: Leaf, accent: "text-emerald-300" },
  { label: "Sustainability Hiring", metric: "Talent momentum", icon: Building2, accent: "text-cyan-300" },
  { label: "Green Innovation", metric: "Patent and project signals", icon: Rocket, accent: "text-emerald-300" },
  { label: "Recent ESG Initiatives", metric: "Fresh market activity", icon: ShieldCheck, accent: "text-cyan-300" },
];

export const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "MVP",
    items: ["Momentum Engine", "Hidden Winners Engine", "Risk Radar", "Digital ESG Score"],
  },
  {
    phase: "Phase 2",
    title: "Future ESG Simulator",
    items: ["Predict 1 to 3 year ESG trajectory", "Scenario modelling"],
  },
  {
    phase: "Phase 3",
    title: "Satellite ESG Signals",
    items: ["Detect deforestation", "Pollution indicators", "Renewable infrastructure", "Factory expansion"],
  },
  {
    phase: "Phase 4",
    title: "Portfolio Optimisation",
    items: ["ESG portfolio recommendations", "Risk, momentum and digital readiness allocation"],
  },
];

export const fallbackCompanies = [
  { company_id: "dbs", company_name: "DBS", sector: "Banking", country: "Singapore", current_esg_score: 72, momentum_score: 99, momentum_label: "Rising", hidden_winner_score: 92, hidden_winner: false, risk_score: 9, risk_level: "Low", digital_esg_score: 100, recommendation: "Buy / Strong Watch" },
  { company_id: "ocbc", company_name: "OCBC", sector: "Banking", country: "Singapore", current_esg_score: 70, momentum_score: 79, momentum_label: "Rising", hidden_winner_score: 73, hidden_winner: false, risk_score: 9, risk_level: "Low", digital_esg_score: 82, recommendation: "Buy / Strong Watch" },
  { company_id: "uob", company_name: "UOB", sector: "Banking", country: "Singapore", current_esg_score: 68, momentum_score: 60, momentum_label: "Stable", hidden_winner_score: 56, hidden_winner: false, risk_score: 22, risk_level: "Low", digital_esg_score: 61, recommendation: "Monitor" },
  { company_id: "singtel", company_name: "Singtel", sector: "Telecommunications", country: "Singapore", current_esg_score: 74, momentum_score: 60, momentum_label: "Stable", hidden_winner_score: 67, hidden_winner: false, risk_score: 9, risk_level: "Low", digital_esg_score: 84, recommendation: "Monitor" },
  { company_id: "grab", company_name: "Grab", sector: "Technology", country: "Singapore", current_esg_score: 61, momentum_score: 88, momentum_label: "Rising", hidden_winner_score: 85, hidden_winner: true, risk_score: 12, risk_level: "Low", digital_esg_score: 95, recommendation: "Hidden Winner" },
  { company_id: "sea", company_name: "Sea Limited", sector: "Technology", country: "Singapore", current_esg_score: 63, momentum_score: 55, momentum_label: "Stable", hidden_winner_score: 66, hidden_winner: false, risk_score: 22, risk_level: "Low", digital_esg_score: 89, recommendation: "Monitor" },
  { company_id: "wilmar", company_name: "Wilmar", sector: "Agribusiness", country: "Singapore", current_esg_score: 58, momentum_score: 36, momentum_label: "Declining", hidden_winner_score: 33, hidden_winner: false, risk_score: 49, risk_level: "Medium", digital_esg_score: 26, recommendation: "Monitor" },
  { company_id: "capitaland", company_name: "CapitaLand", sector: "Real Estate", country: "Singapore", current_esg_score: 76, momentum_score: 74, momentum_label: "Stable", hidden_winner_score: 67, hidden_winner: false, risk_score: 4, risk_level: "Low", digital_esg_score: 59, recommendation: "Monitor" },
  { company_id: "aia", company_name: "AIA", sector: "Insurance", country: "Hong Kong / ASEAN", current_esg_score: 71, momentum_score: 61, momentum_label: "Stable", hidden_winner_score: 66, hidden_winner: false, risk_score: 9, risk_level: "Low", digital_esg_score: 91, recommendation: "Monitor" },
  { company_id: "keppel", company_name: "Keppel", sector: "Infrastructure", country: "Singapore", current_esg_score: 69, momentum_score: 77, momentum_label: "Rising", hidden_winner_score: 76, hidden_winner: true, risk_score: 30, risk_level: "Low", digital_esg_score: 77, recommendation: "Hidden Winner" },
  { company_id: "sembcorp", company_name: "Sembcorp", sector: "Energy", country: "Singapore", current_esg_score: 66, momentum_score: 85, momentum_label: "Rising", hidden_winner_score: 81, hidden_winner: true, risk_score: 21, risk_level: "Low", digital_esg_score: 78, recommendation: "Hidden Winner" },
  { company_id: "comfortdelgro", company_name: "ComfortDelGro", sector: "Transport", country: "Singapore", current_esg_score: 64, momentum_score: 57, momentum_label: "Stable", hidden_winner_score: 51, hidden_winner: false, risk_score: 32, risk_level: "Low", digital_esg_score: 37, recommendation: "Monitor" },
  { company_id: "thai_union", company_name: "Thai Union", sector: "Food & Agriculture", country: "Thailand", current_esg_score: 57, momentum_score: 48, momentum_label: "Declining", hidden_winner_score: 39, hidden_winner: false, risk_score: 89, risk_level: "High", digital_esg_score: 21, recommendation: "Avoid / High Risk" },
];
