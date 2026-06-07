from __future__ import annotations

from collections import Counter
from datetime import date, datetime
from typing import Any
from urllib.parse import quote_plus
from urllib.request import urlopen
import xml.etree.ElementTree as ET

import numpy as np
import pandas as pd


POSITIVE_TERMS = {
    "green",
    "renewable",
    "sustainable",
    "sustainability",
    "decarbonisation",
    "decarbonization",
    "climate",
    "transition",
    "responsible",
    "energy efficient",
    "electric",
    "solar",
    "wind",
    "traceability",
}

NEGATIVE_TERMS = {
    "controversy",
    "concerns",
    "scrutiny",
    "deforestation",
    "incident",
    "investigation",
    "labour issue",
    "labor issue",
    "regulatory",
    "risk",
}

RESPONSIBLE_AI_TERMS = {"responsible ai", "ai governance", "model governance", "model risk"}


def clamp(value: float, lower: int = 0, upper: int = 100) -> int:
    return int(round(max(lower, min(upper, value))))


def scale(value: float, cap: float) -> float:
    if cap <= 0:
        return 0
    return min(100, (value / cap) * 100)


def count_terms(text: str, terms: set[str]) -> int:
    lowered = text.lower()
    return sum(1 for term in terms if term in lowered)


def article_blob(company: dict[str, Any]) -> str:
    return " ".join(
        f"{article.get('title', '')} {article.get('text', '')}"
        for article in company.get("news_articles", [])
    )


def recent_signal_score(company: dict[str, Any]) -> int:
    dates = []
    for article in company.get("news_articles", []):
        try:
            dates.append(datetime.fromisoformat(article["date"]).date())
        except (KeyError, ValueError):
            continue
    if not dates:
        return 40
    newest = max(dates)
    days = max(0, (date(2026, 6, 7) - newest).days)
    return clamp(100 - days * 2)


def score_company(company: dict[str, Any]) -> dict[str, Any]:
    text = article_blob(company)
    jobs = company["job_signals"]
    innovation = company["innovation_signals"]
    risks = company["risk_signals"]

    positive_news_score = scale(count_terms(text, POSITIVE_TERMS), 5)
    negative_news_score = max(
        scale(count_terms(text, NEGATIVE_TERMS), 7),
        scale(risks.get("negative_news_count", 0), 7),
    )
    sustainability_jobs_score = scale(jobs.get("sustainability_jobs", 0), 12)
    green_patent_score = scale(innovation.get("green_patents", 0), 5)
    sustainability_project_score = scale(innovation.get("sustainability_projects", 0), 6)

    momentum_score = clamp(
        positive_news_score * 0.35
        + sustainability_jobs_score * 0.20
        + green_patent_score * 0.20
        + sustainability_project_score * 0.15
        + recent_signal_score(company) * 0.10
    )

    if momentum_score >= 75:
        momentum_label = "Rising"
    elif momentum_score >= 50:
        momentum_label = "Stable"
    else:
        momentum_label = "Declining"

    ai_adoption_score = scale(jobs.get("ai_jobs", 0), 20)
    cybersecurity_score = scale(jobs.get("cybersecurity_jobs", 0), 10)
    data_governance_score = scale(jobs.get("data_governance_jobs", 0), 7)
    digital_innovation_score = scale(innovation.get("digital_patents", 0), 7)
    responsible_ai_score = scale(count_terms(text, RESPONSIBLE_AI_TERMS), 2)
    digital_esg_score = clamp(
        ai_adoption_score * 0.25
        + cybersecurity_score * 0.25
        + data_governance_score * 0.20
        + digital_innovation_score * 0.20
        + responsible_ai_score * 0.10
        - risks.get("cybersecurity_incidents", 0) * 6
    )

    innovation_score = clamp(
        green_patent_score * 0.45
        + digital_innovation_score * 0.35
        + sustainability_project_score * 0.20
    )
    undervaluation_factor = 100 - company["current_esg_score"]
    hidden_winner_score = clamp(
        momentum_score * 0.45
        + digital_esg_score * 0.25
        + innovation_score * 0.20
        + undervaluation_factor * 0.10
    )
    hidden_winner = company["current_esg_score"] < 70 and hidden_winner_score >= 75

    risk_score = clamp(
        negative_news_score * 0.30
        + scale(risks.get("controversies", 0), 5) * 0.25
        + scale(risks.get("regulatory_flags", 0), 3) * 0.25
        + scale(risks.get("labour_issues", 0), 4) * 0.10
        + scale(risks.get("environmental_incidents", 0), 3) * 0.10
    )
    if risk_score >= 70:
        risk_level = "High"
    elif risk_score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    if hidden_winner and risk_score < 50:
        recommendation = "Hidden Winner"
    elif momentum_score >= 75 and risk_score < 40:
        recommendation = "Buy / Strong Watch"
    elif risk_score >= 70:
        recommendation = "Avoid / High Risk"
    elif risk_score >= 40:
        recommendation = "Monitor"
    elif momentum_score >= 50:
        recommendation = "Monitor"
    else:
        recommendation = "Neutral"

    return {
        "momentum_score": momentum_score,
        "momentum_label": momentum_label,
        "hidden_winner_score": hidden_winner_score,
        "hidden_winner": hidden_winner,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "digital_esg_score": digital_esg_score,
        "recommendation": recommendation,
        "breakdown": {
            "positive_news": clamp(positive_news_score),
            "sustainability_jobs": clamp(sustainability_jobs_score),
            "green_patents": clamp(green_patent_score),
            "sustainability_projects": clamp(sustainability_project_score),
            "recent_signals": recent_signal_score(company),
            "innovation": innovation_score,
            "undervaluation": undervaluation_factor,
            "negative_news": clamp(negative_news_score),
            "controversies": clamp(scale(risks.get("controversies", 0), 5)),
            "regulatory_flags": clamp(scale(risks.get("regulatory_flags", 0), 3)),
            "labour_issues": clamp(scale(risks.get("labour_issues", 0), 4)),
            "environmental_incidents": clamp(scale(risks.get("environmental_incidents", 0), 3)),
            "ai_adoption": clamp(ai_adoption_score),
            "cybersecurity": clamp(cybersecurity_score),
            "data_governance": clamp(data_governance_score),
            "digital_innovation": clamp(digital_innovation_score),
            "responsible_ai": clamp(responsible_ai_score),
        },
    }


def enrich_company(company: dict[str, Any]) -> dict[str, Any]:
    scores = score_company(company)
    trend = build_trend(company["current_esg_score"], scores["momentum_score"], scores["risk_score"])
    signals = build_signals(company)
    risk_reason = build_risk_reason(company, scores)
    explanation = build_explanation(company, scores, risk_reason)
    return {
        **company,
        **scores,
        "momentum_trend": trend,
        "recent_signals": signals,
        "risk_reason": risk_reason,
        "investor_action": investor_action(scores),
        "explanation": explanation,
    }


def summarize_company(company: dict[str, Any]) -> dict[str, Any]:
    enriched = enrich_company(company)
    keys = [
        "company_id",
        "company_name",
        "sector",
        "country",
        "current_esg_score",
        "momentum_score",
        "momentum_label",
        "hidden_winner_score",
        "hidden_winner",
        "risk_score",
        "risk_level",
        "digital_esg_score",
        "recommendation",
    ]
    return {key: enriched[key] for key in keys}


def dashboard_summary(companies: list[dict[str, Any]]) -> dict[str, Any]:
    rows = [summarize_company(company) for company in companies]
    frame = pd.DataFrame(rows)
    risk_counts = Counter(frame["risk_level"])
    return {
        "total_companies": int(len(rows)),
        "rising_companies": int((frame["momentum_label"] == "Rising").sum()),
        "hidden_winners": int(frame["hidden_winner"].sum()),
        "high_risk_companies": int((frame["risk_level"] == "High").sum()),
        "average_digital_esg_score": int(np.round(frame["digital_esg_score"].mean())),
        "risk_distribution": dict(risk_counts),
    }


def build_trend(current_score: int, momentum_score: int, risk_score: int) -> list[dict[str, int | str]]:
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    slope = (momentum_score - 50) / 8 - risk_score / 35
    start = current_score - slope * 3
    return [
        {"month": month, "score": clamp(start + index * slope + (index % 2) * 1.5)}
        for index, month in enumerate(months)
    ]


def build_signals(company: dict[str, Any]) -> list[dict[str, str]]:
    signals = []
    for article in company.get("news_articles", [])[:4]:
        sentiment = "Positive"
        text = f"{article.get('title', '')} {article.get('text', '')}"
        if count_terms(text, NEGATIVE_TERMS) > count_terms(text, POSITIVE_TERMS):
            sentiment = "Negative"
        signals.append(
            {
                "date": article.get("date", ""),
                "source": article.get("source", "Demo Source"),
                "title": article.get("title", ""),
                "sentiment": sentiment,
            }
        )
    return signals


def build_risk_reason(company: dict[str, Any], scores: dict[str, Any]) -> str:
    risks = company["risk_signals"]
    if scores["risk_level"] == "High":
        return "Elevated controversies, regulatory flags, and negative ESG coverage require defensive positioning."
    if risks.get("regulatory_flags", 0):
        return "Moderate regulatory scrutiny is present, but operational signals remain manageable."
    if risks.get("controversies", 0) > 1:
        return "Some controversy signals are visible and should be monitored against future disclosures."
    return "Limited controversy and regulatory signals keep near-term ESG downside contained."


def investor_action(scores: dict[str, Any]) -> str:
    if scores["risk_level"] == "High":
        return "Reduce exposure or require remediation evidence before adding."
    if scores["hidden_winner"]:
        return "Add to watchlist for early ESG rerating potential."
    if scores["momentum_label"] == "Rising":
        return "Prioritise for deeper diligence and active monitoring."
    return "Monitor for confirmation from future signals."


def build_explanation(company: dict[str, Any], scores: dict[str, Any], risk_reason: str) -> str:
    if scores["hidden_winner"]:
        opening = (
            f"{company['company_name']} is a Hidden Winner Candidate because its current ESG rating is still "
            "moderate while momentum, innovation, and digital ESG readiness are already strong."
        )
    else:
        opening = (
            f"{company['company_name']} is classified as {scores['momentum_label']} with a "
            f"{scores['momentum_score']} momentum score and {scores['digital_esg_score']} Digital ESG score."
        )
    return f"{opening} {risk_reason} The signal is generated from demo news, hiring, innovation, and controversy indicators."


def search_news(company_name: str) -> tuple[list[dict[str, str]], str]:
    query = quote_plus(f"{company_name} ESG sustainability governance renewable carbon cybersecurity AI")
    url = f"https://news.google.com/rss/search?q={query}&hl=en-SG&gl=SG&ceid=SG:en"
    try:
        with urlopen(url, timeout=4) as response:
            root = ET.fromstring(response.read())
        articles = []
        for item in root.findall("./channel/item")[:8]:
            articles.append(
                {
                    "title": item.findtext("title", default="Untitled signal"),
                    "date": item.findtext("pubDate", default=""),
                    "source": "Google News RSS",
                    "url": item.findtext("link", default=""),
                    "text": item.findtext("description", default=""),
                }
            )
        if articles:
            return articles, "Live News Mode"
    except Exception:
        pass
    return [], "Demo Dataset Mode"


def analyse_company(company: dict[str, Any], live_articles: list[dict[str, str]] | None = None, mode: str = "Demo Dataset Mode") -> dict[str, Any]:
    source_company = {**company}
    if live_articles:
        source_company["news_articles"] = live_articles
    enriched = enrich_company(source_company)
    evidence = build_evidence(source_company, enriched, mode)
    confidence = confidence_score(enriched, evidence, mode)
    recommendation = dynamic_recommendation(enriched)
    return {
        "analysis_id": f"{company['company_id']}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "mode": mode,
        "company_id": company["company_id"],
        "company_name": company["company_name"],
        "sector": company["sector"],
        "country": company["country"],
        "analysis_date": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "signals_detected": signal_counts(source_company, enriched),
        "confidence_score": confidence,
        "recommendation": recommendation["label"],
        "recommendation_explanation": recommendation["explanation"],
        "executive_summary": {
            "key_opportunity": build_key_opportunity(enriched),
            "key_risk": enriched["risk_reason"],
            "esg_outlook": build_outlook(enriched),
            "digital_readiness": build_digital_readiness(enriched),
        },
        "scores": {
            "momentum": score_payload(
                enriched["momentum_score"],
                confidence,
                f"{company['company_name']} is {enriched['momentum_label']} based on positive ESG signals, sustainability hiring, innovation, and signal recency.",
                evidence["positive_signals"],
                ["News", "Hiring Signals", "Innovation Signals"],
            ),
            "hidden_winner": score_payload(
                enriched["hidden_winner_score"],
                confidence,
                "The hidden winner score compares current ESG rating against forward momentum, digital readiness, and innovation indicators.",
                evidence["opportunity_signals"],
                ["Company Cache", "Innovation Signals", "Digital Signals"],
            ),
            "risk": score_payload(
                enriched["risk_score"],
                confidence,
                enriched["risk_reason"],
                evidence["risk_signals"],
                ["News", "Risk Signals", "Regulatory Flags"],
                enriched["risk_level"],
            ),
            "digital_esg": score_payload(
                enriched["digital_esg_score"],
                confidence,
                "Digital ESG readiness is generated from AI adoption, cybersecurity, data governance, digital innovation, and responsible AI evidence.",
                evidence["digital_signals"],
                ["Job Signals", "Patent Signals", "News"],
            ),
        },
        "breakdown": enriched["breakdown"],
        "trend": enriched["momentum_trend"],
        "timeline": build_signal_timeline(source_company, enriched),
        "evidence": evidence,
        "suggested_questions": [
            f"Why is {company['company_name']} a hidden winner?",
            "What caused the risk score?",
            "Summarise ESG outlook.",
            "Compare this company to DBS.",
        ],
    }


def build_company_from_live_signals(company_name: str, live_articles: list[dict[str, str]]) -> dict[str, Any]:
    text = " ".join(f"{article.get('title', '')} {article.get('text', '')}" for article in live_articles)
    positive = count_terms(text, POSITIVE_TERMS)
    negative = count_terms(text, NEGATIVE_TERMS)
    digital = count_terms(text, RESPONSIBLE_AI_TERMS | {"ai", "cybersecurity", "data governance", "digital", "automation"})
    green = count_terms(text, {"green", "renewable", "solar", "wind", "carbon", "climate"})
    current_score = clamp(58 + positive * 3 - negative * 4 + min(8, digital), 35, 82)
    return {
        "company_id": company_name.lower().replace(" ", "_").replace(".", ""),
        "company_name": company_name.strip().title(),
        "sector": "Live Search",
        "country": "Global",
        "current_esg_score": current_score,
        "news_articles": live_articles,
        "job_signals": {
            "sustainability_jobs": max(1, positive + green),
            "ai_jobs": max(1, digital),
            "cybersecurity_jobs": count_terms(text, {"cybersecurity", "cyber", "security", "privacy"}),
            "data_governance_jobs": count_terms(text, {"data governance", "privacy", "responsible ai", "model governance"}),
        },
        "innovation_signals": {
            "green_patents": max(0, green),
            "digital_patents": max(0, digital),
            "sustainability_projects": max(1, positive),
        },
        "risk_signals": {
            "controversies": count_terms(text, {"controversy", "lawsuit", "probe", "investigation"}),
            "regulatory_flags": count_terms(text, {"regulator", "regulatory", "fine", "penalty"}),
            "negative_news_count": max(0, negative),
            "labour_issues": count_terms(text, {"labour", "labor", "worker", "union", "safety"}),
            "environmental_incidents": count_terms(text, {"pollution", "spill", "deforestation", "emissions"}),
            "cybersecurity_incidents": count_terms(text, {"breach", "cyberattack", "data leak"}),
        },
    }


def mock_signal_articles(company_name: str) -> list[dict[str, str]]:
    clean_name = canonical_company_name(company_name)
    return [
        {
            "title": f"{clean_name} expands sustainability financing and transition initiatives",
            "date": "2026-06-03",
            "source": "Seeded Mock News",
            "url": "",
            "text": f"{clean_name} announced green financing, renewable energy, and sustainability initiatives that indicate improving ESG momentum.",
        },
        {
            "title": f"{clean_name} increases AI governance and cybersecurity hiring",
            "date": "2026-06-01",
            "source": "Seeded Mock Careers Signal",
            "url": "",
            "text": f"Job signals show AI, cybersecurity, data governance, privacy, and responsible AI roles linked to digital ESG readiness.",
        },
        {
            "title": f"Analysts monitor {clean_name} governance and supply chain disclosures",
            "date": "2026-05-28",
            "source": "Seeded Mock Disclosure",
            "url": "",
            "text": f"Governance, labour, regulatory, and supply chain risk disclosures are being monitored, with no severe controversy signal detected.",
        },
        {
            "title": f"{clean_name} pilots low-carbon operations programme",
            "date": "2026-05-22",
            "source": "Seeded Mock Sustainability",
            "url": "",
            "text": f"The company reported carbon reduction, energy efficiency, and sustainable operations programmes.",
        },
    ]


def canonical_company_name(company_name: str) -> str:
    normalized = (company_name or "Target Company").strip().lower()
    aliases = {
        "dbs": "DBS Bank",
        "dbs bank": "DBS Bank",
        "sea": "Sea Ltd",
        "sea ltd": "Sea Ltd",
        "sea limited": "Sea Ltd",
        "wilmar": "Wilmar International",
        "wilmar international": "Wilmar International",
        "singtel": "Singtel",
        "grab": "Grab",
    }
    return aliases.get(normalized, (company_name or "Target Company").strip().title())


def analyse_report(file_name: str, text: str) -> dict[str, Any]:
    pseudo_company = {
        "company_id": "uploaded_report",
        "company_name": file_name.rsplit(".", 1)[0].replace("_", " ").replace("-", " ").title() or "Uploaded Report",
        "sector": "Uploaded Document",
        "country": "User Upload",
        "current_esg_score": 62,
        "news_articles": [
            {
                "title": f"Uploaded report: {file_name}",
                "date": date.today().isoformat(),
                "source": "Uploaded Report",
                "text": text[:3000],
            }
        ],
        "job_signals": {
            "sustainability_jobs": count_terms(text, POSITIVE_TERMS),
            "ai_jobs": count_terms(text, {"ai", "artificial intelligence", "automation"}),
            "cybersecurity_jobs": count_terms(text, {"cybersecurity", "security", "privacy"}),
            "data_governance_jobs": count_terms(text, {"data governance", "privacy", "model governance"}),
        },
        "innovation_signals": {
            "green_patents": count_terms(text, {"renewable", "solar", "wind", "green innovation"}),
            "digital_patents": count_terms(text, {"digital", "ai", "platform", "analytics"}),
            "sustainability_projects": count_terms(text, POSITIVE_TERMS),
        },
        "risk_signals": {
            "controversies": count_terms(text, {"controversy", "investigation"}),
            "regulatory_flags": count_terms(text, {"regulatory", "fine", "penalty"}),
            "negative_news_count": count_terms(text, NEGATIVE_TERMS),
            "labour_issues": count_terms(text, {"labour", "worker", "safety"}),
            "environmental_incidents": count_terms(text, {"pollution", "spill", "deforestation"}),
            "cybersecurity_incidents": count_terms(text, {"data breach", "cyber incident"}),
        },
    }
    analysis = analyse_company(pseudo_company, mode="Uploaded Report Mode")
    analysis["extracted_text_preview"] = text[:1200]
    analysis["file_name"] = file_name
    return analysis


def compare_companies(companies: list[dict[str, Any]]) -> dict[str, Any]:
    analyses = [analyse_company(company) for company in companies]
    rows = [
        {
            "company_id": item["company_id"],
            "company_name": item["company_name"],
            "momentum": item["scores"]["momentum"]["score"],
            "hidden_winner": item["scores"]["hidden_winner"]["score"],
            "risk": item["scores"]["risk"]["score"],
            "digital_esg": item["scores"]["digital_esg"]["score"],
            "confidence": item["confidence_score"],
            "recommendation": item["recommendation"],
        }
        for item in analyses
    ]
    return {
        "rows": rows,
        "best_esg_opportunity": max(rows, key=lambda row: row["hidden_winner"])["company_name"],
        "highest_risk_company": max(rows, key=lambda row: row["risk"])["company_name"],
        "most_digitally_advanced_company": max(rows, key=lambda row: row["digital_esg"])["company_name"],
        "most_improved_company": max(rows, key=lambda row: row["momentum"])["company_name"],
        "mode": "Demo Dataset Mode",
    }


def signal_counts(company: dict[str, Any], enriched: dict[str, Any]) -> dict[str, int]:
    text = article_blob(company)
    articles = len(company.get("news_articles", []))
    sustainability = count_terms(text, POSITIVE_TERMS)
    digital = count_terms(text, RESPONSIBLE_AI_TERMS | {"ai", "cybersecurity", "data governance", "digital"})
    risk = count_terms(text, NEGATIVE_TERMS) + int(enriched["risk_score"] >= 40)
    return {
        "articles_found": articles,
        "sustainability_announcements": sustainability,
        "ai_hiring_signals": digital + company.get("job_signals", {}).get("ai_jobs", 0),
        "regulatory_disclosures": risk + company.get("risk_signals", {}).get("regulatory_flags", 0),
    }


def answer_question(analysis: dict[str, Any], question: str) -> dict[str, Any]:
    lowered = question.lower()
    company = analysis.get("company_name", "This company")
    if "hidden" in lowered or "winner" in lowered:
        answer = analysis["scores"]["hidden_winner"]["explanation"]
        evidence = analysis["scores"]["hidden_winner"]["supporting_evidence"]
    elif "risk" in lowered:
        answer = analysis["scores"]["risk"]["explanation"]
        evidence = analysis["scores"]["risk"]["supporting_evidence"]
    elif "digital" in lowered or "ai" in lowered:
        answer = analysis["scores"]["digital_esg"]["explanation"]
        evidence = analysis["scores"]["digital_esg"]["supporting_evidence"]
    elif "outlook" in lowered or "summar" in lowered:
        answer = analysis["executive_summary"]["esg_outlook"]
        evidence = analysis["evidence"]["positive_signals"][:3]
    else:
        answer = (
            f"{company} has a {analysis['recommendation']} recommendation with "
            f"{analysis['confidence_score']} confidence. The strongest opportunity is "
            f"{analysis['executive_summary']['key_opportunity']}"
        )
        evidence = analysis["evidence"]["source_articles"][:3]
    return {"answer": answer, "evidence": evidence, "mode": analysis.get("mode", "Demo Dataset Mode")}


def build_signal_timeline(company: dict[str, Any], enriched: dict[str, Any]) -> list[dict[str, Any]]:
    events = []
    for article in company.get("news_articles", []):
        text = f"{article.get('title', '')} {article.get('text', '')}"
        positive = count_terms(text, POSITIVE_TERMS)
        negative = count_terms(text, NEGATIVE_TERMS)
        if negative > positive:
            impact = "Risk score pressure"
            category = "Risk"
            direction = "negative"
        elif count_terms(text, RESPONSIBLE_AI_TERMS | {"ai", "cybersecurity", "data governance", "digital"}) > 0:
            impact = "Digital ESG contribution"
            category = "Digital ESG"
            direction = "positive"
        else:
            impact = "Momentum score contribution"
            category = "Momentum"
            direction = "positive"
        events.append(
            {
                "date": article.get("date", ""),
                "title": article.get("title", "ESG signal detected"),
                "source": article.get("source", "Source"),
                "category": category,
                "impact": impact,
                "direction": direction,
                "score_effect": "+ momentum" if direction == "positive" else "+ risk",
                "reason": article.get("text", "")[:220] or impact,
            }
        )
    if not events:
        events.append(
            {
                "date": date.today().isoformat(),
                "title": "Analysis generated from cached company signals",
                "source": "ESG Pulse 360",
                "category": "Analysis",
                "impact": "Baseline intelligence generated",
                "direction": "neutral",
                "score_effect": "baseline",
                "reason": build_outlook(enriched),
            }
        )
    return sorted(events, key=lambda item: item.get("date", ""), reverse=True)


def score_payload(score: int, confidence: int, explanation: str, evidence: list[dict[str, str]], sources: list[str], level: str | None = None) -> dict[str, Any]:
    payload = {
        "score": score,
        "confidence_score": confidence,
        "explanation": explanation,
        "supporting_evidence": evidence,
        "sources_used": sources,
    }
    if level:
        payload["level"] = level
    return payload


def build_evidence(company: dict[str, Any], enriched: dict[str, Any], mode: str) -> dict[str, Any]:
    articles = company.get("news_articles", [])
    source_articles = [
        {
            "title": article.get("title", "Untitled signal"),
            "source": article.get("source", "Unknown"),
            "date": article.get("date", ""),
            "url": article.get("url", ""),
            "excerpt": article.get("text", "")[:240],
        }
        for article in articles[:8]
    ]
    positive_signals = [
        signal for signal in source_articles if count_terms(signal["title"] + " " + signal["excerpt"], POSITIVE_TERMS) >= count_terms(signal["title"] + " " + signal["excerpt"], NEGATIVE_TERMS)
    ][:5]
    risk_signals = [
        signal for signal in source_articles if count_terms(signal["title"] + " " + signal["excerpt"], NEGATIVE_TERMS) > 0
    ][:5]
    if not risk_signals:
        risk_signals = [{"title": "Low controversy signal density", "source": mode, "date": "", "url": "", "excerpt": enriched["risk_reason"]}]
    digital_signals = [
        {"title": "AI and cybersecurity readiness indicators", "source": "Job and innovation signals", "date": "", "url": "", "excerpt": f"AI {enriched['breakdown']['ai_adoption']}, Cybersecurity {enriched['breakdown']['cybersecurity']}, Data Governance {enriched['breakdown']['data_governance']}."}
    ]
    opportunity_signals = positive_signals[:3] + digital_signals
    return {
        "mode": mode,
        "source_articles": source_articles,
        "positive_signals": positive_signals or source_articles[:3],
        "risk_signals": risk_signals,
        "digital_signals": digital_signals,
        "opportunity_signals": opportunity_signals,
        "keywords_found": sorted(
            term for term in POSITIVE_TERMS | NEGATIVE_TERMS | RESPONSIBLE_AI_TERMS if term in article_blob(company).lower()
        )[:16],
    }


def confidence_score(enriched: dict[str, Any], evidence: dict[str, Any], mode: str) -> int:
    base = 58 if mode == "Demo Dataset Mode" else 76
    article_boost = min(12, len(evidence["source_articles"]) * 2)
    signal_boost = min(10, len(evidence["keywords_found"]))
    return clamp(base + article_boost + signal_boost)


def dynamic_recommendation(enriched: dict[str, Any]) -> dict[str, str]:
    if enriched["risk_score"] >= 70:
        return {
            "label": "High Risk / Avoid",
            "explanation": "Risk evidence dominates the opportunity signal and should block new exposure until remediation is visible.",
        }
    if enriched["hidden_winner"] and enriched["risk_score"] < 50:
        return {
            "label": "Investigate Hidden Winner",
            "explanation": "Current ESG recognition appears below forward-looking momentum and digital readiness signals.",
        }
    if enriched["momentum_score"] >= 75 and enriched["digital_esg_score"] >= 70:
        return {
            "label": "Strong Watch",
            "explanation": "Momentum and Digital ESG readiness are both strong while risk remains manageable.",
        }
    return {
        "label": "Monitor",
        "explanation": "Signals are mixed or still developing; continue monitoring evidence before taking a strong view.",
    }


def build_key_opportunity(enriched: dict[str, Any]) -> str:
    if enriched["hidden_winner"]:
        return "The company may be under-recognised by static ESG ratings relative to its forward momentum."
    if enriched["digital_esg_score"] >= 75:
        return "Digital ESG readiness is a differentiating strength versus traditional ESG scorecards."
    return "Improvement signals are present but need more evidence before becoming an investable opportunity."


def build_outlook(enriched: dict[str, Any]) -> str:
    return (
        f"ESG outlook is {enriched['momentum_label'].lower()} with momentum {enriched['momentum_score']}, "
        f"risk {enriched['risk_score']} ({enriched['risk_level']}), and Digital ESG {enriched['digital_esg_score']}."
    )


def build_digital_readiness(enriched: dict[str, Any]) -> str:
    return (
        f"Digital readiness score is {enriched['digital_esg_score']} based on AI adoption "
        f"({enriched['breakdown']['ai_adoption']}), cybersecurity ({enriched['breakdown']['cybersecurity']}), "
        f"and data governance ({enriched['breakdown']['data_governance']})."
    )
