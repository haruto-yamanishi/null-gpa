import { ArrowUpRight, BadgeCheck, GraduationCap, Sparkles } from "lucide-react";
import { getAdmissionBenefits, getNextAdmissionTarget } from "@/lib/admission-benefits";

export function AdmissionBenefits({ rank }: { rank: number }) {
  const benefits = getAdmissionBenefits(rank);
  const nextTarget = getNextAdmissionTarget(rank);

  return (
    <section className="mt-7 overflow-hidden rounded-[8px] border border-black/15 bg-white">
      <div className="bg-black p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Rank opportunities</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.035em]">今の順位で見える進路</h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/55">
              現在の順位を40人クラスの正式な4年席次と仮定した参考表示です。順位条件のある編入・特待に加え、順位以外の要件で申請できる奨学金も掲載しています。
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/25 px-4 py-2">
            <Sparkles size={16} />
            <span className="font-mono text-sm font-black">CURRENT #{rank}</span>
          </div>
        </div>
      </div>

      {benefits.length > 0 ? (
        <div className="grid gap-px bg-black/10 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <a
              key={`${benefit.university}-${benefit.program}`}
              href={benefit.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="group bg-white p-6 transition hover:bg-neutral-50"
            >
              <div className="flex items-start justify-between gap-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${benefit.kind === "scholarship" ? "bg-[#f7c948] text-black" : "bg-black text-white"}`}>
                  {benefit.kind === "scholarship" ? <Sparkles size={12} /> : <BadgeCheck size={12} />}
                  {benefit.label ?? (benefit.kind === "scholarship" ? "特待候補" : "推薦条件圏")}
                </span>
                <ArrowUpRight className="text-black/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black" size={17} />
              </div>
              <p className="mt-5 text-xs font-black text-black/45">{benefit.university}</p>
              <h3 className="mt-1 text-xl font-black tracking-[-0.025em]">{benefit.program}</h3>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-full border border-black/15 px-2.5 py-1">
                  {benefit.maxRank === undefined ? benefit.threshold : `${benefit.threshold} · 40人なら${benefit.maxRank}位以内`}
                </span>
                <span className="rounded-full border border-black/15 px-2.5 py-1 text-black/55">{benefit.schoolYears}</span>
              </div>
              <p className="mt-4 text-sm font-bold leading-6">{benefit.benefit}</p>
              {benefit.note && <p className="mt-2 text-xs font-medium leading-5 text-black/45">{benefit.note}</p>}
            </a>
          ))}
        </div>
      ) : (
        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-neutral-100"><GraduationCap size={19} /></span>
            <div>
              <h3 className="font-black">まずは次のラインへ</h3>
              <p className="mt-1 text-sm font-medium leading-6 text-black/50">
                {nextTarget
                  ? `${nextTarget.maxRank}位以内で「${nextTarget.university} ${nextTarget.program}」の席次目安に入ります。`
                  : "数値基準のない推薦・一般編入もあります。募集要項から自分に合う方式を探してみましょう。"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-black/10 bg-neutral-50 px-6 py-4 text-[11px] font-medium leading-5 text-black/45 sm:px-8">
        2027年度の公式情報を基にした目安です。表示順位は自己申告データによるもので、出願資格を保証しません。対象学科、学校推薦、3年次席次、英語資格などの追加条件を必ず最新の募集要項で確認してください。
      </div>
    </section>
  );
}
