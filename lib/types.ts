export type Visibility = "public" | "private";
export type IdentityMode = "anonymous" | "named";

export type Subject = {
  id: string;
  name: string;
  credits: number;
  term: "first-half" | "second-half" | "full-year" | "other";
};

export type GradeInput = {
  subjectId: string;
  score: number | null;
  visibility: Visibility;
};

export type Participant = {
  accountId: string;
  displayName: string | null;
  identityMode: IdentityMode;
  gpaVisibility: Visibility;
  grades: Record<string, { score: number; visibility: Visibility }>;
};

export type RankingRow = {
  rank: number;
  participantCount: number;
  topPercent: number;
  pseudonym: string;
  displayName: string | null;
  gpa: number | null;
  isMe: boolean;
};

export type SubjectStatistic = {
  subjectId: string;
  score: number | null;
  rank: number | null;
  participantCount: number;
  average: number | null;
  median: number | null;
  deviation: number | null;
};

export type SubjectRankingRow = {
  subjectId: string;
  rank: number;
  participantCount: number;
  pseudonym: string;
  displayName: string | null;
  score: number | null;
  isMe: boolean;
};
