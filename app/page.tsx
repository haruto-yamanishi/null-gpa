import Link from "next/link";
import { ArrowUpRight, ChartNoAxesColumnIncreasing, ClipboardPenLine, UserRound } from "lucide-react";

const cards = [
  {
    href: "/submit",
    title: "成績を入力",
    text: "科目ごとの点数からGPAを計算。名前・GPA・各科目の公開設定も変更できます。",
    icon: ClipboardPenLine,
  },
  {
    href: "/rankings",
    title: "ランキングを見る",
    text: "参加者内のGPA順位、科目別順位、偏差値を確認できます。",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    href: "/me",
    title: "マイページ",
    text: "このブラウザで保存したGPA・科目成績・公開設定を確認できます。",
    icon: UserRound,
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1320px] px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
      <section className="min-h-[560px] border-b border-black/15 pb-14 sm:pb-20 lg:min-h-[650px]">
        <div className="max-w-6xl">
          <div className="k-section-tag">
            <span className="k-section-tag-mark">順位</span>
            <span className="text-lg font-bold tracking-[-0.02em]">Ranking</span>
          </div>

          <p className="mt-14 text-xl font-bold tracking-[-0.04em] sm:text-2xl lg:text-3xl">
            2026 / Grade 4 / Self-reported
          </p>

          <h1 className="k-display mt-5 text-[clamp(4rem,10vw,9.4rem)]">
            GPA・成績
            <br />
            ランキング。
          </h1>

          <p className="mt-8 max-w-2xl text-sm font-medium leading-7 text-black/55 sm:text-base">
            神山まるごと高専4年生向け。成績を入力すると、GPA・参加者内順位・科目順位・偏差値を確認できます。
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/submit" className="k-button gap-2">
              成績を入力する <ArrowUpRight size={17} />
            </Link>
            <Link href="/rankings" className="k-button-secondary">
              ランキングを見る
            </Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3">
        {cards.map(({ href, title, text, icon: Icon }, index) => (
          <Link
            key={href}
            href={href}
            className={`group border-b border-black/15 bg-white/40 px-5 py-9 backdrop-blur-[1px] transition hover:bg-white/75 sm:px-8 md:border-b-0 md:px-8 md:py-12 ${index > 0 ? "md:border-l md:border-black/15" : ""}`}
          >
            <div className="flex items-start justify-between gap-5">
              <span className="grid size-11 place-items-center rounded-full border border-black/15 bg-white/80">
                <Icon size={19} />
              </span>
              <ArrowUpRight className="text-black/35 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-black" size={19} />
            </div>
            <h2 className="mt-10 text-2xl font-black tracking-[-0.045em] sm:text-3xl">{title}</h2>
            <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-black/50">{text}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
