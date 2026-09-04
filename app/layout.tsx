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
        <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
            <Link href="/" className="flex items-center gap-3 font-black tracking-[-0.02em]">
              <span className="block size-3 rounded-full bg-black" aria-hidden />
              <span>NULL GPA</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] font-bold text-black/55">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className="transition hover:text-black">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-20 border-t border-black/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-7 text-xs sm:px-6">
            <span className="font-bold">NULL GPA</span>
            <span className="text-black/40">参加者内ランキング / 学校公式順位ではありません</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
