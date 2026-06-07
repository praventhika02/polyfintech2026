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
    compare_companies,
    dashboard_summary,
    enrich_company,
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
    if not company:
        raise HTTPException(status_code=404, detail="Company not found in cache. Try Demo Mode or upload a report.")

    live_articles: list[dict[str, str]] = []
    mode = "Demo Dataset Mode"
    if not request.demo_mode:
        live_articles, mode = search_news(company["company_name"])
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
