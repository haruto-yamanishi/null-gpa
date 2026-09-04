import Link from "next/link";
import { ArrowUpRight, ChartNoAxesColumnIncreasing, ClipboardPenLine, UserRound } from "lucide-react";

const cards = [
  {
    href: "/submit",
    title: "成績を入力",
    text: "科目ごとの点数を入れるとGPAを自動計算。名前・GPA・各科目はそれぞれ公開設定を選べます。",
    icon: ClipboardPenLine,
    accent: "bg-[#ffd84d]",
  },
  {
    href: "/rankings",
    title: "ランキングを見る",
    text: "参加者内のGPA順位と科目別順位を確認。Privateの数値はランキング上では表示されません。",
    icon: ChartNoAxesColumnIncreasing,
    accent: "bg-[#8fe0c0]",
  },
  {
    href: "/me",
    title: "マイページ",
    text: "このブラウザで保存した公開設定・GPA・科目成績を確認できます。",
    icon: UserRound,
    accent: "bg-[#ff7768]",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <section className="relative overflow-hidden rounded-[40px] border-2 border-black bg-white px-6 py-12 shadow-[7px_7px_0_#111] sm:px-10 sm:py-16">
        <div className="absolute -right-8 -top-8 size-36 rounded-full border-2 border-black bg-[#2864ff]" aria-hidden />
        <div className="absolute bottom-8 right-20 hidden size-20 rotate-12 border-2 border-black bg-[#ffd84d] md:block" aria-hidden />
        <div className="relative max-w-3xl">
          <p className="k-label">2026 / Grade 4 / Self-reported</p>
          <h1 className="mt-4 text-5xl font-black leading-[0.95] tracking-[-0.05em] sm:text-7xl">
            GPA・成績
            <br />
            ランキング
          </h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-black/60 sm:text-lg">
            神山まるごと高専4年生向けの参加型ランキングです。成績を入力するとGPA、参加者内順位、科目順位、偏差値を確認できます。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/submit" className="k-button gap-2">
              成績を入力する <ArrowUpRight size={18} />
            </Link>
            <Link href="/rankings" className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-black bg-white px-5 py-3 font-black shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5">
              ランキングを見る
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {cards.map(({ href, title, text, icon: Icon, accent }) => (
          <Link key={href} href={href} className="k-card group p-6 transition hover:-translate-y-1 hover:shadow-[7px_8px_0_#111]">
            <div className={`grid size-12 place-items-center rounded-full border-2 border-black ${accent}`}>
              <Icon size={22} />
            </div>
            <div className="mt-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight">{title}</h2>
                <p className="mt-3 text-sm font-medium leading-6 text-black/55">{text}</p>
              </div>
              <ArrowUpRight className="shrink-0 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
