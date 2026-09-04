export const dynamic = "force-dynamic";

export default function EnvCheckPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-black">Environment Check</h1>
      <p className="mt-2 text-zinc-500">値そのものは表示せず、Vercel runtime から見えているかだけ確認します。</p>

      <div className="mt-8 space-y-4">
        <Check label="NEXT_PUBLIC_SUPABASE_URL" ok={Boolean(url)} detail={url ? new URL(url).host : "missing"} />
        <Check label="NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" ok={Boolean(key)} detail={key ? `${key.slice(0, 14)}…` : "missing"} />
      </div>
    </main>
  );
}

function Check({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <p className="font-mono text-xs text-zinc-500">{label}</p>
      <p className={`mt-2 text-xl font-black ${ok ? "text-lime-200" : "text-rose-300"}`}>
        {ok ? "FOUND" : "MISSING"}
      </p>
      <p className="mt-1 font-mono text-sm text-zinc-400">{detail}</p>
    </div>
  );
}
