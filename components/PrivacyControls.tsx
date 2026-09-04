"use client";

import { ShieldCheck } from "lucide-react";
import type { IdentityMode, Visibility } from "@/lib/types";
import { Toggle } from "./Toggle";

export function PrivacyControls({
  identityMode,
  displayName,
  gpaVisibility,
  onIdentityModeChange,
  onDisplayNameChange,
  onGpaVisibilityChange,
}: {
  identityMode: IdentityMode;
  displayName: string;
  gpaVisibility: Visibility;
  onIdentityModeChange: (mode: IdentityMode) => void;
  onDisplayNameChange: (value: string) => void;
  onGpaVisibilityChange: (visibility: Visibility) => void;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[.14em] text-zinc-500">PRIVACY</p>
          <h2 className="mt-1 text-xl font-black">公開設定</h2>
        </div>
        <ShieldCheck className="text-lime-200" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-black/20 p-1">
        {(["anonymous", "named"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onIdentityModeChange(mode)}
            className={`rounded-lg px-3 py-2 text-sm font-bold ${identityMode === mode ? "bg-white text-black" : "text-zinc-400"}`}
          >
            {mode === "anonymous" ? "Anonymous" : "Named"}
          </button>
        ))}
      </div>

      {identityMode === "named" && (
        <label className="mt-4 block text-sm text-zinc-400">
          Display name
          <input
            value={displayName}
            maxLength={32}
            onChange={(event) => onDisplayNameChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-base text-white outline-none focus:border-lime-200/50"
          />
        </label>
      )}

      <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-white/10 p-4">
        <div>
          <p className="font-bold">GPA</p>
          <p className="text-sm text-zinc-500">数値をランキングへ公開するか</p>
        </div>
        <Toggle
          checked={gpaVisibility === "public"}
          onChange={(value) => onGpaVisibilityChange(value ? "public" : "private")}
          label="GPA visibility"
        />
      </div>
    </section>
  );
}
