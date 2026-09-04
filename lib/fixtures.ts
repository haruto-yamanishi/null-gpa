import type { Participant, Subject } from "./types";

export const SUBJECTS: Subject[] = [
  { id: "english-4", name: "英語IV", credits: 4, term: "full-year" },
  { id: "psychology", name: "心理学", credits: 2, term: "first-half" },
  { id: "analysis-1", name: "解析学I", credits: 2, term: "first-half" },
  { id: "discrete-math", name: "離散数学", credits: 2, term: "full-year" },
  { id: "cognitive-science", name: "認知科学", credits: 4, term: "full-year" },
  { id: "pe-4", name: "保健体育IV", credits: 2, term: "full-year" },
  { id: "web-programming-2", name: "WebプログラミングII", credits: 2, term: "full-year" },
  { id: "computer-architecture", name: "コンピュータアーキテクチャ", credits: 2, term: "full-year" },
  { id: "neighborhood", name: "ネイバーフッド演習", credits: 2, term: "full-year" },
  { id: "design-engineering", name: "デザインエンジニアリング演習", credits: 2, term: "full-year" },
];

const baseScores = [
  [96, 94, 91, 90, 92, 88, 97, 95, 89, 93],
  [92, 88, 86, 91, 87, 84, 94, 90, 82, 88],
  [89, 91, 84, 86, 90, 78, 88, 92, 84, 85],
  [85, 84, 92, 80, 82, 90, 86, 84, 78, 89],
  [82, 79, 80, 88, 84, 83, 91, 79, 85, 81],
  [78, 86, 77, 83, 79, 82, 84, 88, 75, 80],
  [90, 76, 73, 78, 80, 76, 89, 85, 80, 77],
  [76, 82, 88, 75, 77, 81, 80, 82, 72, 84],
  [83, 74, 81, 84, 75, 79, 78, 76, 88, 79],
  [71, 80, 76, 79, 81, 74, 82, 77, 69, 75],
  [87, 72, 70, 74, 73, 86, 76, 80, 77, 72],
  [79, 78, 85, 70, 69, 72, 74, 79, 83, 76],
  [74, 69, 79, 82, 72, 77, 70, 73, 81, 78],
  [68, 75, 74, 76, 78, 70, 79, 71, 74, 82],
  [81, 71, 68, 72, 70, 75, 73, 69, 79, 74],
  [73, 77, 72, 68, 76, 69, 71, 75, 70, 71],
  [69, 73, 75, 71, 68, 80, 67, 72, 76, 69],
  [66, 68, 70, 74, 71, 73, 69, 67, 72, 75],
  [72, 65, 67, 69, 74, 71, 65, 70, 68, 73],
  [64, 70, 69, 66, 67, 68, 72, 64, 71, 70],
  [70, 66, 64, 73, 65, 67, 68, 71, 66, 64],
  [63, 64, 72, 65, 66, 69, 64, 68, 70, 67],
  [67, 62, 66, 70, 63, 65, 70, 66, 64, 68],
  [62, 67, 63, 64, 69, 66, 61, 65, 67, 66],
];

export const SYNTHETIC_PARTICIPANTS: Participant[] = baseScores.map((scores, index) => ({
  accountId: `synthetic-${String(index + 1).padStart(2, "0")}`,
  displayName: index % 7 === 0 ? `Student ${index + 1}` : null,
  identityMode: index % 7 === 0 ? "named" : "anonymous",
  gpaVisibility: index % 5 === 0 ? "public" : "private",
  grades: Object.fromEntries(
    SUBJECTS.map((subject, subjectIndex) => [
      subject.id,
      { score: scores[subjectIndex], visibility: (index + subjectIndex) % 4 === 0 ? "public" : "private" },
    ]),
  ),
}));
