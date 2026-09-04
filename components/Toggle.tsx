"use client";

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition ${checked ? "border-lime-300/60 bg-lime-300/20" : "border-white/15 bg-white/5"}`}
    >
      <span className={`h-5 w-5 rounded-full transition ${checked ? "translate-x-6 bg-lime-200" : "translate-x-1 bg-zinc-500"}`} />
    </button>
  );
}
