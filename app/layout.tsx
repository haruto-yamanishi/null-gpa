import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "NULL GPA",
  description: "Privacy-first participant GPA and subject ranking analytics.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        <header className="border-b border-white/10 bg-black/20">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
            <Link href="/" className="font-mono text-sm font-black tracking-[0.2em]">NULL GPA</Link>
            <nav className="flex items-center gap-5 text-sm text-zinc-400">
              <Link className="hover:text-white" href="/">Dashboard</Link>
              <Link className="hover:text-white" href="/proof">Privacy Proof</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
