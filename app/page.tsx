import Link from "next/link";
import { ArrowUpRight, ChartNoAxesColumnIncreasing, ClipboardPenLine, UserRound } from "lucide-react";

const cards = [
  {
    href: "/submit",
    title: "成績を入力",
    text: "科目ごとの点数からGPAを計算。名前・GPA・各科目はそれぞれ公開設定を変更できます。",
    icon: ClipboardPenLine,
  },
  {
    href: "/rankings",
    title: "ランキングを見る",
    text: "参加者内のGPA順位と科目別順位を確認できます。Privateの数値は表示されません。",
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
    <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <section className="border-b border-black/15 pb-14 sm:pb-20">
        <div className="max-w-5xl">
          <p className="k-label">2026 / Grade 4 / Self-reported</p>
          <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-7xl lg:text-[96px]">
            GPA・成績
            <br />
            ランキング
          </h1>
          <p className="mt-7 max-w-2xl text-base font-medium leading-7 text-black/55 sm:text-lg">
            神山まるごと高専4年生向けの参加型ランキング。成績を入力するとGPA、参加者内順位、科目順位、偏差値を確認できます。
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
            className={`group border-b border-black/15 py-9 md:border-b-0 md:px-8 md:py-12 ${index > 0 ? "md:border-l" : "md:pl-0"}`}
          >
            <div className="flex items-start justify-between gap-5">
              <span className="grid size-11 place-items-center rounded-full border border-black/15">
                <Icon size={19} />
              </span>
              <ArrowUpRight className="text-black/35 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-black" size={19} />
            </div>
            <h2 className="mt-10 text-2xl font-black tracking-[-0.025em]">{title}</h2>
            <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-black/50">{text}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
