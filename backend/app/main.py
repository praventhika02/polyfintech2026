from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .scoring import (
    analyse_company,
    analyse_report,
    answer_question,
    build_company_from_live_signals,
    compare_companies,
    dashboard_summary,
    enrich_company,
    mock_signal_articles,
    search_news,
    summarize_company,
)

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "companies.json"

app = FastAPI(
    title="ESG Pulse 360 API",
    description="Rule-based ESG intelligence MVP for ASEAN companies.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CompanyAnalysisRequest(BaseModel):
    company_id: str | None = None
    company_name: str | None = None
    demo_mode: bool = False


class ReportAnalysisRequest(BaseModel):
    file_name: str
    text: str = ""
    file_type: str = "txt"


class AssistantRequest(BaseModel):
    analysis: dict[str, Any]
    question: str


class CompareRequest(BaseModel):
    company_ids: list[str]


class PrototypeAnalyseRequest(BaseModel):
    company: str
    articles: list[dict[str, Any]] = []


class PrototypeChatRequest(BaseModel):
    company: str
    context: dict[str, Any] = {}
    messages: list[dict[str, str]] = []


def load_companies() -> list[dict[str, Any]]:
    with DATA_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/companies")
def get_companies() -> list[dict[str, Any]]:
    return [summarize_company(company) for company in load_companies()]


@app.get("/search-companies")
def search_companies(q: str = "") -> list[dict[str, Any]]:
    query = q.lower().strip()
    rows = [summarize_company(company) for company in load_companies()]
    if not query:
        return rows[:8]
    return [
        row
        for row in rows
        if query in f"{row['company_name']} {row['sector']} {row['country']}".lower()
    ][:10]


@app.get("/companies/{company_id}")
def get_company(company_id: str) -> dict[str, Any]:
    for company in load_companies():
        if company["company_id"] == company_id:
            return enrich_company(company)
    raise HTTPException(status_code=404, detail="Company not found")


@app.post("/analysis/company")
def run_company_analysis(request: CompanyAnalysisRequest) -> dict[str, Any]:
    companies = load_companies()
    company = None
    for candidate in companies:
        if request.company_id and candidate["company_id"] == request.company_id:
            company = candidate
            break
        if request.company_name and request.company_name.lower() in candidate["company_name"].lower():
            company = candidate
            break
    live_articles: list[dict[str, str]] = []
    mode = "Demo Dataset Mode"
    if not request.demo_mode:
        live_articles, mode = search_news(company["company_name"] if company else request.company_name or "")
    if not company and live_articles:
        company = build_company_from_live_signals(request.company_name or "Unknown Company", live_articles)
    if not company:
        fallback_articles = mock_signal_articles(request.company_name or "Unknown Company")
        company = build_company_from_live_signals(
            request.company_name or "Unknown Company",
            fallback_articles,
        )
        mode = "Mock Fallback Mode"
    return analyse_company(company, live_articles=live_articles, mode=mode)


@app.post("/analysis/report")
def run_report_analysis(request: ReportAnalysisRequest) -> dict[str, Any]:
    if not request.text.strip():
        request.text = (
            f"{request.file_name} uploaded for ESG review. Text extraction preview was unavailable in browser. "
            "Run analysis uses file metadata and any visible text supplied by the user."
        )
    return analyse_report(request.file_name, request.text)


@app.post("/assistant")
def ask_assistant(request: AssistantRequest) -> dict[str, Any]:
    return answer_question(request.analysis, request.question)


@app.post("/compare")
def compare(request: CompareRequest) -> dict[str, Any]:
    companies = [company for company in load_companies() if company["company_id"] in request.company_ids]
    if len(companies) < 2:
        raise HTTPException(status_code=400, detail="Select at least two companies to compare.")
    return compare_companies(companies[:5])


@app.get("/dashboard-summary")
def get_dashboard_summary() -> dict[str, Any]:
    return dashboard_summary(load_companies())


@app.get("/api/news/{company}")
def prototype_news(company: str) -> list[dict[str, str]]:
    live_articles, mode = search_news(company)
    articles = live_articles or mock_signal_articles(company)
    return [
        {
            "headline": article.get("title", "ESG signal detected"),
            "source": article.get("source", mode),
            "date": article.get("date", ""),
            "url": article.get("url", ""),
            "company": company,
            "signal": infer_signal(article.get("title", "") + " " + article.get("text", "")),
            "time_ago": "2h ago" if index < 2 else "Today",
        }
        for index, article in enumerate(articles[:6])
    ]


@app.post("/api/analyse")
def prototype_analyse(request: PrototypeAnalyseRequest) -> dict[str, Any]:
    companies = load_companies()
    company = next(
        (
            candidate
            for candidate in companies
            if request.company.lower() in candidate["company_name"].lower()
            or candidate["company_name"].lower() in request.company.lower()
        ),
        None,
    )
    articles = [
        {
            "title": article.get("headline", article.get("title", "ESG signal detected")),
            "date": article.get("date", "2026-06-07"),
            "source": article.get("source", "Mock News"),
            "url": article.get("url", ""),
            "text": article.get("headline", article.get("text", "")),
        }
        for article in request.articles
    ] or mock_signal_articles(request.company)
    if not company:
        company = build_company_from_live_signals(request.company, articles)
    analysis = analyse_company(company, live_articles=articles, mode="Mock Fallback Mode")
    return to_prototype_analysis(analysis)


@app.post("/api/chat")
def prototype_chat(request: PrototypeChatRequest) -> dict[str, str]:
    question = (request.messages[-1]["content"] if request.messages else "").lower()
    company = request.company
    if "hidden" in question:
        answer = f"{company} looks like a hidden ESG opportunity when its improvement signals outpace its current recognised ESG profile. The strongest evidence is momentum plus digital readiness."
    elif "risk" in question:
        answer = f"The biggest ESG risk for {company} comes from the red-flag evidence in the current analysis, especially governance, labour, environmental or digital incidents that may affect investor perception within weeks."
    elif "sector" in question or "compare" in question:
        answer = f"Compared with sector peers, {company}'s differentiator is the spread between ESG momentum and Digital ESG readiness. A stronger spread suggests underpriced future-leader potential."
    else:
        answer = f"{company} is being assessed from the generated momentum, risk, digital ESG and forecast modules. Every conclusion is tied back to the evidence cards shown in the investigation."
    return {"answer": answer}


def infer_signal(text: str) -> str:
    lowered = text.lower()
    if any(term in lowered for term in ["cyber", "ai", "digital", "data"]):
        return "Digital"
    if any(term in lowered for term in ["labour", "worker", "social"]):
        return "Social"
    if any(term in lowered for term in ["governance", "regulatory", "controversy"]):
        return "Governance"
    return "Environmental"


def to_prototype_analysis(analysis: dict[str, Any]) -> dict[str, Any]:
    momentum_score = analysis["scores"]["momentum"]["score"]
    risk_score = analysis["scores"]["risk"]["score"]
    digital_score = analysis["scores"]["digital_esg"]["score"]
    e_score = min(100, max(0, momentum_score - 3))
    s_score = min(100, max(0, momentum_score - (12 if risk_score > 35 else 6)))
    g_score = min(100, max(0, 100 - risk_score + 8))
    risk_status = "Alert" if risk_score >= 70 else "Watch" if risk_score >= 40 else "Clear"
    quadrant = (
        "Hidden Winner"
        if analysis["scores"]["hidden_winner"]["score"] >= 75 and risk_score < 50
        else "Future Leader"
        if momentum_score >= 70 and digital_score >= 70
        else "Value Trap"
        if risk_score >= 60
        else "Overrated Leader"
    )
    evidence = analysis["evidence"]["source_articles"][:4]
    current = round((e_score + s_score + g_score + digital_score) / 4)
    return {
        "company": analysis["company_name"],
        "sector": analysis["sector"],
        "mode": analysis["mode"],
        "scores": {
            "E": {"score": e_score, "trend": "↑", "reason": "Environmental signal density improved through sustainability and transition evidence."},
            "S": {"score": s_score, "trend": "↑" if risk_score < 40 else "→", "reason": "Social momentum is supported by workforce, labour and community signal monitoring."},
            "G": {"score": g_score, "trend": "→" if risk_score < 40 else "↓", "reason": "Governance score reflects controversy and regulatory signal pressure."},
            "digital": {"score": digital_score, "trend": "↑", "reason": "Digital ESG reflects AI governance, cybersecurity and data maturity evidence."},
        },
        "momentum": {
            "overall": analysis["scores"]["momentum"]["score"] >= 75 and "Rising" or analysis["scores"]["momentum"]["score"] >= 50 and "Stable" or "Declining",
            "E": {"score": e_score, "direction": "↑", "reason": "Sustainability and carbon-transition signals are strengthening."},
            "S": {"score": s_score, "direction": "↑" if risk_score < 40 else "→", "reason": "Social evidence is constructive but monitored for labour signals."},
            "G": {"score": g_score, "direction": "→" if risk_score < 40 else "↓", "reason": "Governance remains stable unless red flags intensify."},
            "evidence": evidence,
            "momentum_quadrant": quadrant,
            "quadrant_reason": f"{analysis['company_name']} sits in {quadrant} based on momentum {momentum_score}, risk {risk_score}, and Digital ESG {digital_score}.",
        },
        "risk": {
            "status": risk_status,
            "alerts": [] if risk_status == "Clear" else [
                {
                    "severity": "High" if risk_status == "Alert" else "Medium",
                    "category": "Labour" if "labour" in analysis["scores"]["risk"]["explanation"].lower() else "Governance",
                    "description": analysis["scores"]["risk"]["explanation"],
                    "source": (evidence[0]["source"] if evidence else "Mock Risk Monitor"),
                    "date": (evidence[0]["date"] if evidence else "2026-06-07"),
                    "time_to_impact": "4-8 weeks",
                }
            ],
        },
        "digital": {
            "overall_score": digital_score,
            "hiring_velocity": {"score": analysis["breakdown"]["ai_adoption"], "evidence": "AI and data roles signal digital ESG readiness."},
            "innovation_index": {"score": analysis["breakdown"]["digital_innovation"], "evidence": "Digital patents and innovation announcements support maturity."},
            "digital_risk_rating": {"score": max(0, 100 - risk_score), "evidence": "Lower cyber/regulatory incidents improve digital risk safety."},
            "sector_benchmark_delta": digital_score - 64,
            "pricing_signal": "Underpriced signal" if digital_score >= 75 and risk_score < 50 else "Fairly priced" if risk_score < 70 else "Overpriced risk",
            "insight": analysis["executive_summary"]["digital_readiness"],
            "evidence": analysis["scores"]["digital_esg"]["supporting_evidence"],
        },
        "forecast": {
            "current_score": current,
            "scenarios": {
                "current_trend": [current + 2, current + 4, current + 6, current + 8],
                "accelerated": [current + 4, current + 8, current + 12, current + 16],
                "cuts": [current - 3, current - 6, current - 9, current - 12],
            },
            "key_insight": f"Under the current trend, {analysis['company_name']} could enter or strengthen its {quadrant} position within 6 months.",
            "quadrant_prediction": quadrant,
        },
        "signals_detected": analysis["signals_detected"],
        "evidence": evidence,
    }
    return apply_demo_profile_overrides(payload)


def apply_demo_profile_overrides(payload: dict[str, Any]) -> dict[str, Any]:
    profiles = {
        "dbs": {"momentum": "Rising", "digital": 78, "risk": "Clear", "quadrant": "Future Leader"},
        "dbs bank": {"momentum": "Rising", "digital": 78, "risk": "Clear", "quadrant": "Future Leader"},
        "grab": {"momentum": "Rising", "digital": 82, "risk": "Watch", "quadrant": "Hidden Winner"},
        "sea limited": {"momentum": "Stable", "digital": 86, "risk": "Clear", "quadrant": "Future Leader"},
        "sea ltd": {"momentum": "Stable", "digital": 86, "risk": "Clear", "quadrant": "Future Leader"},
        "wilmar": {"momentum": "Declining", "digital": 41, "risk": "Alert", "quadrant": "Value Trap"},
        "wilmar international": {"momentum": "Declining", "digital": 41, "risk": "Alert", "quadrant": "Value Trap"},
        "singtel": {"momentum": "Stable", "digital": 71, "risk": "Clear", "quadrant": "Overrated Leader"},
    }
    key = payload["company"].lower()
    profile = profiles.get(key)
    if not profile:
        return payload
    payload["momentum"]["overall"] = profile["momentum"]
    payload["momentum"]["momentum_quadrant"] = profile["quadrant"]
    payload["momentum"]["quadrant_reason"] = f"{payload['company']} is classified as {profile['quadrant']} in the seeded mock fallback profile."
    payload["digital"]["overall_score"] = profile["digital"]
    payload["scores"]["digital"]["score"] = profile["digital"]
    payload["risk"]["status"] = profile["risk"]
    if profile["risk"] == "Clear":
        payload["risk"]["alerts"] = []
    elif profile["risk"] == "Watch":
        payload["risk"]["alerts"] = [
            {
                "severity": "Medium",
                "category": "Labour",
                "description": "Labour-related platform and workforce signals require monitoring, but no severe controversy is detected.",
                "source": "Seeded Mock Risk Monitor",
                "date": "2026-06-03",
                "time_to_impact": "4-8 weeks",
            }
        ]
    else:
        payload["risk"]["alerts"] = [
            {
                "severity": "High",
                "category": "Environmental",
                "description": "Supply-chain and environmental scrutiny signals suggest elevated ESG downside risk.",
                "source": "Seeded Mock Risk Monitor",
                "date": "2026-06-03",
                "time_to_impact": "2-6 weeks",
            }
        ]
    return payload


def to_prototype_analysis(analysis: dict[str, Any]) -> dict[str, Any]:
    momentum_score = analysis["scores"]["momentum"]["score"]
    risk_score = analysis["scores"]["risk"]["score"]
    digital_score = analysis["scores"]["digital_esg"]["score"]
    e_score = min(100, max(0, momentum_score - 3))
    s_score = min(100, max(0, momentum_score - (12 if risk_score > 35 else 6)))
    g_score = min(100, max(0, 100 - risk_score + 8))
    risk_status = "Alert" if risk_score >= 70 else "Watch" if risk_score >= 40 else "Clear"
    quadrant = (
        "Hidden Winner"
        if analysis["scores"]["hidden_winner"]["score"] >= 75 and risk_score < 50
        else "Future Leader"
        if momentum_score >= 70 and digital_score >= 70
        else "Value Trap"
        if risk_score >= 60
        else "Overrated Leader"
    )
    evidence = analysis["evidence"]["source_articles"][:4]
    current = round((e_score + s_score + g_score + digital_score) / 4)
    payload = {
        "company": analysis["company_name"],
        "sector": analysis["sector"],
        "mode": analysis["mode"],
        "scores": {
            "E": {"score": e_score, "trend": "up", "reason": "Environmental signal density improved through sustainability and transition evidence."},
            "S": {"score": s_score, "trend": "up" if risk_score < 40 else "flat", "reason": "Social momentum is supported by workforce, labour and community signal monitoring."},
            "G": {"score": g_score, "trend": "flat" if risk_score < 40 else "down", "reason": "Governance score reflects controversy and regulatory signal pressure."},
            "digital": {"score": digital_score, "trend": "up", "reason": "Digital ESG reflects AI governance, cybersecurity and data maturity evidence."},
        },
        "momentum": {
            "overall": "Rising" if momentum_score >= 75 else "Stable" if momentum_score >= 50 else "Declining",
            "E": {"score": e_score, "direction": "up", "reason": "Sustainability and carbon-transition signals are strengthening."},
            "S": {"score": s_score, "direction": "up" if risk_score < 40 else "flat", "reason": "Social evidence is constructive but monitored for labour signals."},
            "G": {"score": g_score, "direction": "flat" if risk_score < 40 else "down", "reason": "Governance remains stable unless red flags intensify."},
            "evidence": evidence,
            "momentum_quadrant": quadrant,
            "quadrant_reason": f"{analysis['company_name']} sits in {quadrant} based on momentum {momentum_score}, risk {risk_score}, and Digital ESG {digital_score}.",
        },
        "risk": {
            "status": risk_status,
            "alerts": [] if risk_status == "Clear" else [
                {
                    "severity": "High" if risk_status == "Alert" else "Medium",
                    "category": "Governance",
                    "description": analysis["scores"]["risk"]["explanation"],
                    "source": evidence[0]["source"] if evidence else "Mock Risk Monitor",
                    "date": evidence[0]["date"] if evidence else "2026-06-07",
                    "time_to_impact": "4-8 weeks",
                }
            ],
        },
        "digital": {
            "overall_score": digital_score,
            "hiring_velocity": {"score": analysis["breakdown"]["ai_adoption"], "evidence": "AI and data roles signal digital ESG readiness."},
            "innovation_index": {"score": analysis["breakdown"]["digital_innovation"], "evidence": "Digital patents and innovation announcements support maturity."},
            "digital_risk_rating": {"score": max(0, 100 - risk_score), "evidence": "Lower cyber/regulatory incidents improve digital risk safety."},
            "sector_benchmark_delta": digital_score - 64,
            "pricing_signal": "Underpriced signal" if digital_score >= 75 and risk_score < 50 else "Fairly priced" if risk_score < 70 else "Overpriced risk",
            "insight": analysis["executive_summary"]["digital_readiness"],
            "evidence": analysis["scores"]["digital_esg"]["supporting_evidence"],
        },
        "forecast": {
            "current_score": current,
            "scenarios": {
                "current_trend": [current + 2, current + 4, current + 6, current + 8],
                "accelerated": [current + 4, current + 8, current + 12, current + 16],
                "cuts": [current - 3, current - 6, current - 9, current - 12],
            },
            "key_insight": f"Under the current trend, {analysis['company_name']} could enter or strengthen its {quadrant} position within 6 months.",
            "quadrant_prediction": quadrant,
        },
        "signals_detected": analysis["signals_detected"],
        "evidence": evidence,
    }
    return apply_demo_profile_overrides(payload)
