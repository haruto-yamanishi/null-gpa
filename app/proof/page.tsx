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
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8">
        <p className="k-label">Privacy</p>
        <h1 className="mt-2 text-4xl font-black tracking-[-0.04em] sm:text-5xl">データの扱い</h1>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-black/55">
          公開設定がPrivateのGPA・科目点数はランキング用RPCの返却値から除外します。元データへの直接アクセスはRLSで本人に限定しています。
        </p>
      </div>

      <section className="grid gap-5 sm:grid-cols-2">
        {checks.map(([label, value, Icon], index) => (
          <div key={label} className={`k-card p-6 ${index === 0 ? "bg-[#ffd84d]" : index === 1 ? "bg-[#8fe0c0]" : "bg-white"}`}>
            <div className="grid size-11 place-items-center rounded-full border-2 border-black bg-white">
              <Icon size={20} />
            </div>
            <p className="k-label mt-6">{label}</p>
            <p className="mt-2 text-xl font-black">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-7 k-card p-6 sm:p-8">
        <h2 className="text-2xl font-black">確認できるもの</h2>
        <p className="mt-3 text-sm font-medium leading-7 text-black/55">
          実装・SQL migration・セキュリティ方針はリポジトリから確認できます。ランキング画面では、公開を許可した数値だけが表示されます。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="https://github.com/haruto-yamanishi/null-gpa" className="k-button" target="_blank" rel="noreferrer">GitHubを見る</Link>
          <Link href="/rankings" className="inline-flex min-h-12 items-center rounded-full border-2 border-black bg-white px-5 py-3 font-black shadow-[3px_3px_0_#111]">ランキングを見る</Link>
        </div>
      </section>
    </main>
  );
}
