import type { SubjectStatistic } from "./types";

export const MINIMUM_SUBJECT_STATISTIC_PARTICIPANTS = 10;

export function subjectDeviationDisplay(statistic: SubjectStatistic | undefined) {
  if (!statistic) {
    return {
      value: "—",
      note: "この科目の点数を登録すると表示",
    };
  }

  if (statistic.deviation != null) {
    return {
      value: statistic.deviation.toFixed(1),
      note: `この科目の${statistic.participantCount}人から計算`,
    };
  }

  const remaining = Math.max(
    MINIMUM_SUBJECT_STATISTIC_PARTICIPANTS - statistic.participantCount,
    0,
  );

  return {
    value: "—",
    note: remaining > 0
      ? `この科目はあと${remaining}人の点数登録で表示`
      : "全員が同点のため計算できません",
  };
}
