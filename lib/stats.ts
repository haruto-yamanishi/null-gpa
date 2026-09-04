export type Ranked<T> = T & { rank: number };

export function standardCompetitionRank<T>(items: T[], value: (item: T) => number): Ranked<T>[] {
  const sorted = [...items].sort((a, b) => value(b) - value(a));
  let previous: number | null = null;
  let previousRank = 0;
  return sorted.map((item, index) => {
    const current = value(item);
    const rank = previous !== null && current === previous ? previousRank : index + 1;
    previous = current;
    previousRank = rank;
    return { ...item, rank };
  });
}

export function mean(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function median(values: number[]) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function populationStdDev(values: number[]) {
  const avg = mean(values);
  if (avg == null || values.length === 0) return null;
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function deviationScore(score: number, values: number[]) {
  const avg = mean(values);
  const sigma = populationStdDev(values);
  if (avg == null || sigma == null || sigma === 0) return null;
  return 50 + 10 * ((score - avg) / sigma);
}

export function topPercent(rank: number, total: number) {
  if (total <= 0) return null;
  return (rank / total) * 100;
}
