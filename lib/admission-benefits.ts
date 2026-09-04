export type AdmissionBenefit = {
  university: string;
  program: string;
  maxRank?: number;
  threshold: string;
  schoolYears: string;
  benefit: string;
  note?: string;
  sourceUrl: string;
  kind: "scholarship" | "recommendation";
  label?: string;
};

export const ADMISSION_BENEFITS: AdmissionBenefit[] = [
  {
    university: "長岡技術科学大学",
    program: "VOS特待生",
    maxRank: 2,
    threshold: "上位5%",
    schoolYears: "3年または4年",
    benefit: "採用されると入学料全額免除＋編入後2年間の授業料半額免除。",
    note: "スーパーVOSは3・4年とも上位5%など、さらに条件があります。",
    sourceUrl: "https://www.nagaokaut.ac.jp/admissions/actions/specially-treat/index.html",
    kind: "scholarship",
    label: "特待候補",
  },
  {
    university: "日本学生支援機構（JASSO）",
    program: "給付奨学金（返済不要）",
    threshold: "家計・学力等の要件",
    schoolYears: "編入学後に申込",
    benefit: "要件を満たせば、編入学後に在学採用へ申し込める返済不要の給付奨学金。",
    note: "編入前の支援期間を含む支給期間は、通算72か月が上限です。大学の奨学金窓口で手続きします。",
    sourceUrl: "https://www.jasso.go.jp/shogakukin/about/kyufu/shikaku/zaigaku.html",
    kind: "scholarship",
    label: "奨学金",
  },
  {
    university: "日本学生支援機構（JASSO）",
    program: "貸与奨学金（第一種・第二種）",
    threshold: "家計・学力等の要件",
    schoolYears: "編入学後3か月以内に手続き",
    benefit: "第一種（無利子）は編入先で新規申込み、第二種（有利子）は所定の手続きで卒業予定期まで継続できる場合があります。",
    note: "編入前から貸与中の場合も、編入先の担当窓口へ早めに相談してください。",
    sourceUrl: "https://www.jasso.go.jp/shogakukin/saiyochu/todokede/tengaku.html",
    kind: "scholarship",
    label: "奨学金",
  },
  {
    university: "電気通信大学",
    program: "学域地方出身学生支援奨学金",
    threshold: "地方出身・成績優秀・経済的支援が必要",
    schoolYears: "2028年度以降の3年次編入",
    benefit: "返還不要・年額6万円（対象期間1年間）。",
    note: "情報理工学域昼間コース対象。広報活動等への協力意欲も要件で、申請書類と学業成績等に基づき選考されます。",
    sourceUrl: "https://www.uec.ac.jp/campus/fee/scholarship_ruralareas.html",
    kind: "scholarship",
    label: "奨学金",
  },
  {
    university: "九州大学",
    program: "工学部 推薦入試",
    maxRank: 2,
    threshold: "上位5%",
    schoolYears: "4年",
    benefit: "推薦入試の出願資格となる席次条件。",
    sourceUrl: "https://www.eng.kyushu-u.ac.jp/script/wordpress/wp-content/uploads/74bfa7382337700d00019da71b3a9a28.pdf",
    kind: "recommendation",
  },
  {
    university: "早稲田大学",
    program: "理工・高専指定校推薦",
    maxRank: 4,
    threshold: "上位10%",
    schoolYears: "4年",
    benefit: "指定校推薦型編入の席次条件。",
    note: "推薦依頼を受けた高専・学科・コースであることが別途必要です。",
    sourceUrl: "https://www.waseda.jp/fsci/other/2023/01/13/23928/",
    kind: "recommendation",
  },
  {
    university: "千葉大学",
    program: "工学部 学校推薦枠",
    maxRank: 4,
    threshold: "上位10%程度",
    schoolYears: "原則4年",
    benefit: "学校推薦枠の出願目安となる席次条件。",
    sourceUrl: "https://www.f-eng.chiba-u.jp/admission/files/r9/r9_g3_guide.pdf",
    kind: "recommendation",
  },
  {
    university: "熊本大学",
    program: "土木建築学科",
    maxRank: 6,
    threshold: "上位15%",
    schoolYears: "4年",
    benefit: "推薦入試の出願資格となる席次条件。",
    sourceUrl: "https://www.kumamoto-u.ac.jp/nyuushi/sonota/hennyu/file/r9kou3henbosyuuyoukou.pdf",
    kind: "recommendation",
  },
  {
    university: "電気通信大学",
    program: "特別編入・推薦",
    maxRank: 8,
    threshold: "上位20%",
    schoolYears: "3・4年の席次割合の平均",
    benefit: "推薦選抜では学力試験が免除され、面接と出願書類で選抜。",
    sourceUrl: "https://www.uec.ac.jp/education/undergraduate/special-transfer/pdf/2027hennyu.pdf",
    kind: "recommendation",
  },
  {
    university: "京都工芸繊維大学",
    program: "3年次編入・推薦",
    maxRank: 8,
    threshold: "上位20%",
    schoolYears: "3年・4年とも",
    benefit: "推薦選抜の出願資格となる席次条件。",
    sourceUrl: "https://ac.web.kit.ac.jp/02/nyushi/yoko/gakubu/R09_3hen_yoko.pdf",
    kind: "recommendation",
  },
  {
    university: "滋賀大学",
    program: "データサイエンス学部 推薦型",
    maxRank: 8,
    threshold: "上位20%",
    schoolYears: "3年・4年とも",
    benefit: "推薦型編入の出願資格となる席次条件。",
    note: "TOEIC等の外部試験スコアも必要です。",
    sourceUrl: "https://www.shiga-u.ac.jp/admission/examination_info/exam_ds/exam_ds_transfer/",
    kind: "recommendation",
  },
  {
    university: "熊本大学",
    program: "機械系",
    maxRank: 8,
    threshold: "上位20%",
    schoolYears: "4年",
    benefit: "対象教育プログラムの推薦入試における席次条件。",
    sourceUrl: "https://www.kumamoto-u.ac.jp/nyuushi/sonota/hennyu/file/r9kou3henbosyuuyoukou.pdf",
    kind: "recommendation",
  },
  {
    university: "岡山大学",
    program: "工学部 推薦入試",
    maxRank: 10,
    threshold: "上位25%",
    schoolYears: "3年・4年とも",
    benefit: "推薦入試の出願資格となる席次条件。",
    sourceUrl: "https://www.engr.okayama-u.ac.jp/eng_wp/wp-content/uploads/2026/04/2027hennyubosyu03.pdf",
    kind: "recommendation",
  },
  {
    university: "熊本大学",
    program: "情報電気工学科など",
    maxRank: 10,
    threshold: "上位25%",
    schoolYears: "4年",
    benefit: "情報工学・電気・電子などの推薦入試における席次条件。",
    sourceUrl: "https://www.kumamoto-u.ac.jp/nyuushi/sonota/hennyu/file/r9kou3henbosyuuyoukou.pdf",
    kind: "recommendation",
  },
  {
    university: "熊本大学",
    program: "材料・応用化学科",
    maxRank: 12,
    threshold: "上位30%",
    schoolYears: "4年",
    benefit: "対象教育プログラムの推薦入試における席次条件。",
    sourceUrl: "https://www.kumamoto-u.ac.jp/nyuushi/sonota/hennyu/file/r9kou3henbosyuuyoukou.pdf",
    kind: "recommendation",
  },
  {
    university: "信州大学",
    program: "機械システム工学科",
    maxRank: 12,
    threshold: "上位30%目安",
    schoolYears: "成績順位",
    benefit: "推薦選抜で示されている学業成績の目安。",
    sourceUrl: "https://www.shinshu-u.ac.jp/faculty/engineering/2026/02/17/R09_3hen_bosyuyoukou_1.pdf",
    kind: "recommendation",
  },
  {
    university: "信州大学",
    program: "水環境・土木工学科",
    maxRank: 20,
    threshold: "上位50%目安",
    schoolYears: "成績順位",
    benefit: "推薦選抜で示されている学業成績の目安。",
    sourceUrl: "https://www.shinshu-u.ac.jp/faculty/engineering/2026/02/17/R09_3hen_bosyuyoukou_1.pdf",
    kind: "recommendation",
  },
];

export function getAdmissionBenefits(rank: number) {
  if (!Number.isInteger(rank) || rank < 1) return [];
  return ADMISSION_BENEFITS.filter((benefit) => benefit.maxRank === undefined || rank <= benefit.maxRank);
}

export function getNextAdmissionTarget(rank: number) {
  if (!Number.isInteger(rank) || rank < 1) return null;
  return [...ADMISSION_BENEFITS]
    .filter((benefit) => benefit.maxRank !== undefined && rank > benefit.maxRank)
    .sort((a, b) => (b.maxRank ?? 0) - (a.maxRank ?? 0))[0] ?? null;
}
