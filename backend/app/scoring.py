from __future__ import annotations

from collections import Counter
from datetime import date, datetime
from typing import Any

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



