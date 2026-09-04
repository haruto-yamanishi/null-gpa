import Link from "next/link";
import { CheckCircle2, Code2, Database, ShieldCheck } from "lucide-react";

const checks = [
  ["Source", "GitHubで公開", Code2],
  ["Database", "Row Level Security", Database],
  ["Private values", "ランキングRPCでは数値を返さない", ShieldCheck],
  ["Build", "GitHub Actionsでlint / test / build", CheckCircle2],
] as const;

export default function ProofPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 border-b border-black/15 pb-8">
        <p className="k-label">Privacy</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] sm:text-6xl">データの扱い</h1>
        <p className="mt-5 max-w-3xl text-sm font-medium leading-7 text-black/50">
          公開設定がPrivateのGPA・科目点数はランキング用RPCの返却値から除外します。元データへの直接アクセスはRLSで本人に限定しています。
        </p>
      </div>

      <section className="grid border-t border-black/15 sm:grid-cols-2">
        {checks.map(([label, value, Icon], index) => (
          <div key={label} className={`border-b border-black/15 p-6 sm:p-8 ${index % 2 === 1 ? "sm:border-l" : ""}`}>
            <div className="grid size-10 place-items-center rounded-full border border-black/15">
              <Icon size={18} />
            </div>
            <p className="k-label mt-7">{label}</p>
            <p className="mt-2 text-xl font-black tracking-[-0.02em]">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 k-card p-6 sm:p-8">
        <h2 className="text-2xl font-black tracking-[-0.025em]">確認できるもの</h2>
        <p className="mt-3 text-sm font-medium leading-7 text-black/50">
          実装・SQL migration・セキュリティ方針はリポジトリから確認できます。ランキング画面では、公開を許可した数値だけが表示されます。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="https://github.com/haruto-yamanishi/null-gpa" className="k-button" target="_blank" rel="noreferrer">GitHubを見る</Link>
          <Link href="/rankings" className="k-button-secondary">ランキングを見る</Link>
        </div>
      </section>
    </main>
  );
}
