from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .scoring import dashboard_summary, enrich_company, summarize_company

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


def load_companies() -> list[dict[str, Any]]:
    with DATA_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/companies")
def get_companies() -> list[dict[str, Any]]:
    return [summarize_company(company) for company in load_companies()]


@app.get("/companies/{company_id}")
def get_company(company_id: str) -> dict[str, Any]:
    for company in load_companies():
        if company["company_id"] == company_id:
            return enrich_company(company)
    raise HTTPException(status_code=404, detail="Company not found")


@app.get("/dashboard-summary")
def get_dashboard_summary() -> dict[str, Any]:
    return dashboard_summary(load_companies())
