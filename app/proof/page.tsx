import { AlertTriangle, CheckCircle2, GitCommit, KeyRound, ShieldCheck } from "lucide-react";

const checks = [
  ["Attestation status", "UNVERIFIED — LOCAL DEMO", false],
  ["PCR0 / Image SHA-384", "not connected", false],
  ["Source commit", process.env.NEXT_PUBLIC_GIT_SHA ?? "development", true],
  ["Frontend bundle SHA-256", "generated in production release manifest", true],
  ["KMS policy hash", "generated in production release manifest", true],
] as const;

export default function ProofPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="font-mono text-xs font-bold tracking-[.2em] text-lime-200">PRIVACY PROOF</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">暗号化を「説明」ではなく検証対象にする。</h1>
      <p className="mt-4 max-w-3xl text-zinc-400">
        ProductionではブラウザがNitro Enclaveのattestation document、nonce、期待PCRを検証してからのみPrivateデータ送信を許可します。現在は実Enclave未接続のため未検証扱いです。
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {checks.map(([label, value, informational]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold tracking-[.12em] text-zinc-500">{label}</p>
                <p className="mt-2 break-all font-mono text-sm font-bold">{value}</p>
              </div>
              {informational ? <CheckCircle2 className="text-zinc-500" /> : <AlertTriangle className="text-amber-300" />}
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <h2 className="text-xl font-black">Production trust chain</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          <ProofStep icon={<GitCommit />} title="Public source" text="Git commit / immutable release" />
          <ProofStep icon={<ShieldCheck />} title="Build provenance" text="GitHub Artifact Attestation" />
          <ProofStep icon={<KeyRound />} title="Enclave measurement" text="PCR / ImageSha384" />
          <ProofStep icon={<CheckCircle2 />} title="KMS constraint" text="approved measurement only" />
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-6">
        <h2 className="font-black text-amber-100">Security claim boundary</h2>
        <p className="mt-2 text-sm leading-6 text-amber-50/70">
          単独製作者モデルでは、将来悪意あるfrontendを公開すること自体を暗号だけで不可能にはできません。証明対象は稼働artifactと公開source/build provenanceの対応、Privateデータが承認済みEnclave外で復号できないこと、production変更が公開履歴へ残ることです。
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
