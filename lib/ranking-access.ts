const VISIT_ACCESS_KEY = "null-gpa-ranking-access";

export function hasRankingAccessForVisit() {
  return typeof window !== "undefined" && window.sessionStorage.getItem(VISIT_ACCESS_KEY) === "1";
}

export function markRankingAccessForVisit() {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(VISIT_ACCESS_KEY, "1");
  }
}

export function clearRankingAccessForVisit() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(VISIT_ACCESS_KEY);
  }
}
