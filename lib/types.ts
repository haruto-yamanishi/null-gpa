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
