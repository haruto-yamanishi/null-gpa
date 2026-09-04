import { AlertTriangle, CheckCircle2, Database, GitCommit, ShieldCheck } from "lucide-react";

const checks = [
  ["Source code", "PUBLIC", true],
  ["Source commit", process.env.NEXT_PUBLIC_GIT_SHA ?? "set by deployment", true],
  ["Database access control", "Supabase RLS", true],
  ["Public API redaction", "Private GPA / scores are not returned by leaderboard RPC", true],
  ["Operator blindness", "NOT GUARANTEED", false],
] as const;

export default function ProofPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-xs font-bold tracking-[.2em] text-lime-200">PRIVACY PROOF</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">保証できる範囲を、そのまま公開する。</h1>
      <p className="mt-4 max-w-3xl text-zinc-400">
        今日公開する無料MVPはVercel + Supabase構成です。他の参加者から生点数を守るRLSと、Private値を返さないRPCをコードで検証できます。一方、Supabaseプロジェクト管理者まで暗号学的に排除する構成ではありません。
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {checks.map(([label, value, passed]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-[.12em] text-zinc-500">{label}</p>
                <p className="mt-2 break-all font-mono text-sm font-bold">{value}</p>
              </div>
              {passed ? <CheckCircle2 className="text-lime-200" /> : <AlertTriangle className="text-amber-300" />}
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <h2 className="text-xl font-black">Current trust chain</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          <ProofStep icon={<GitCommit />} title="Public source" text="GitHub上の実装を誰でも確認可能" />
          <ProofStep icon={<ShieldCheck />} title="RLS" text="本人以外の直接SELECTを拒否" />
          <ProofStep icon={<Database />} title="Safe RPC" text="ランキングには公開許可された値だけ返す" />
          <ProofStep icon={<CheckCircle2 />} title="CI" text="lint / test / buildをGitHub Actionsで実行" />
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-6">
        <h2 className="font-black text-amber-100">Security claim boundary</h2>
        <p className="mt-2 text-sm leading-6 text-amber-50/70">
          「製作者本人も絶対に成績を見られない」「完全匿名」とは主張しません。無料MVPではSupabaseプロジェクト管理者はtrust boundary内です。将来Nitro Enclave / MPC等へ移行すればoperator blindnessを強化できますが、今日の公開版では未実装として明示します。
        </p>
      </section>
    </main>
  );
}

function ProofStep({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-lime-200">{icon}</div>
      <p className="mt-3 font-bold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">{text}</p>
    </div>
  );
}
