import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "NULL GPA",
  description: "神山まるごと高専4年生向けの参加型GPA・科目ランキング。",
};

const nav = [
  ["ホーム", "/"],
  ["成績入力", "/submit"],
  ["ランキング", "/rankings"],
  ["マイページ", "/me"],
  ["Privacy", "/proof"],
] as const;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        <header className="sticky top-0 z-40 border-b-2 border-black bg-[#f5f1e8]/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-3 font-black tracking-tight">
              <span className="grid size-9 place-items-center rounded-full border-2 border-black bg-[#ffd84d] text-sm">N</span>
              <span>NULL GPA</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className="border-b-2 border-transparent hover:border-black">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-16 border-t-2 border-black bg-white/70">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs font-bold sm:px-6">
            <span>NULL GPA</span>
            <span className="text-black/45">参加者内ランキング / 学校公式順位ではありません</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
