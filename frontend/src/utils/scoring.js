export const riskColors = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#ef4444",
};

export function getSummary(companies) {
  const total = companies.length;
  const rising = companies.filter((company) => company.momentum_label === "Rising").length;
  const hidden = companies.filter((company) => company.hidden_winner).length;
  const highRisk = companies.filter((company) => company.risk_level === "High").length;
  const digitalAverage = Math.round(
    companies.reduce((sum, company) => sum + company.digital_esg_score, 0) / Math.max(total, 1),
  );

  return {
    total_companies: total,
    rising_companies: rising,
    hidden_winners: hidden,
    high_risk_companies: highRisk,
    average_digital_esg_score: digitalAverage,
  };
}

export function riskDistribution(companies) {
  return ["Low", "Medium", "High"].map((level) => ({
    name: level,
    value: companies.filter((company) => company.risk_level === level).length,
  }));
}

export function sectorComparison(companies) {
  const sectors = new Map();
  companies.forEach((company) => {
    const current = sectors.get(company.sector) || {
      sector: company.sector,
      count: 0,
      momentum: 0,
      digital: 0,
      risk: 0,
    };
    current.count += 1;
    current.momentum += company.momentum_score;
    current.digital += company.digital_esg_score;
    current.risk += company.risk_score;
    sectors.set(company.sector, current);
  });

  return [...sectors.values()].map((sector) => ({
    sector: sector.sector,
    momentum: Math.round(sector.momentum / sector.count),
    digital: Math.round(sector.digital / sector.count),
    risk: Math.round(sector.risk / sector.count),
  }));
}

export function momentumSeries(companies) {
  const leaders = [...companies].sort((a, b) => b.momentum_score - a.momentum_score).slice(0, 6);
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, monthIndex) => {
    const row = { month };
    leaders.forEach((company, companyIndex) => {
      const start = company.current_esg_score - 12 + companyIndex;
      const slope = (company.momentum_score - company.current_esg_score) / 6;
      row[company.company_name] = Math.max(20, Math.min(100, Math.round(start + slope * (monthIndex + 1))));
    });
    return row;
  });
}

export function digitalBreakdown(company) {
  if (company?.breakdown) {
    return [
      { name: "AI Adoption", value: company.breakdown.ai_adoption },
      { name: "Cybersecurity", value: company.breakdown.cybersecurity },
      { name: "Data Governance", value: company.breakdown.data_governance },
      { name: "Digital Innovation", value: company.breakdown.digital_innovation },
      { name: "Responsible AI", value: company.breakdown.responsible_ai },
    ];
  }

  const score = company?.digital_esg_score || 55;
  return [
    { name: "AI Adoption", value: Math.min(100, score + 8) },
    { name: "Cybersecurity", value: Math.max(0, score - 2) },
    { name: "Data Governance", value: Math.max(0, score - 7) },
    { name: "Digital Innovation", value: Math.min(100, score + 4) },
    { name: "Responsible AI", value: Math.max(0, score - 12) },
  ];
}

export function riskReason(company) {
  if (company.risk_level === "High") {
    return "Controversies and regulatory pressure are materially elevated.";
  }
  if (company.risk_level === "Medium") {
    return "Risk signals are visible and require closer monitoring.";
  }
  return "Limited controversy and regulatory signals at current intensity.";
}

export function hiddenWinnerReason(company) {
  return `${company.company_name} has a moderate current ESG score but strong momentum, digital readiness and innovation signals.`;
}
