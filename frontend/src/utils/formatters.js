export function todayLabel() {
  return new Intl.DateTimeFormat("en-SG", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

export function scoreTone(score) {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}
