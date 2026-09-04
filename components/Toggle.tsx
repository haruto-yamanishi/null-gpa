"use client";

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full border border-black transition ${checked ? "bg-black" : "bg-neutral-200"}`}
    >
      <span
        className={`absolute top-1/2 size-5 -translate-y-1/2 rounded-full border border-black bg-white transition ${checked ? "left-7" : "left-1"}`}
      />
    </button>
  );
}
