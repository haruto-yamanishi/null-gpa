const RANKING_ACCESS_COOKIE = "null-gpa-ranking-access";
const RANKING_ACCESS_MAX_AGE_SECONDS = 60 * 60 * 12;

export function hasRankingAccessCookie(cookieHeader: string) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === `${RANKING_ACCESS_COOKIE}=1`);
}

function secureCookieAttribute() {
  return typeof window !== "undefined" && window.location.protocol === "https:"
    ? "; Secure"
    : "";
}

export function hasRankingAccessForVisit() {
  return typeof document !== "undefined" && hasRankingAccessCookie(document.cookie);
}

export function markRankingAccessForVisit() {
  if (typeof document === "undefined") return;

  document.cookie = `${RANKING_ACCESS_COOKIE}=1; Path=/; Max-Age=${RANKING_ACCESS_MAX_AGE_SECONDS}; SameSite=Lax${secureCookieAttribute()}`;
}

export function clearRankingAccessForVisit() {
  if (typeof document === "undefined") return;

  document.cookie = `${RANKING_ACCESS_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secureCookieAttribute()}`;
}
