"use client";

import { Eye, EyeOff } from "lucide-react";
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
    <section className="k-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="k-label">Visibility</p>
          <h2 className="mt-1 text-2xl font-black">公開設定</h2>
        </div>
        <div className="grid size-11 place-items-center rounded-full border-2 border-black bg-[#2864ff] text-white">
          {gpaVisibility === "public" ? <Eye size={20} /> : <EyeOff size={20} />}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border-2 border-black bg-[#f5f1e8] p-1.5">
        {(["named", "anonymous"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onIdentityModeChange(mode)}
            className={`rounded-xl px-3 py-2.5 text-sm font-black transition ${identityMode === mode ? "border-2 border-black bg-white shadow-[2px_2px_0_#111]" : "border-2 border-transparent text-black/45"}`}
          >
            {mode === "anonymous" ? "Anonymous" : "Name"}
          </button>
        ))}
      </div>

      {identityMode === "named" && (
        <label className="mt-5 block text-sm font-bold">
          表示名
          <input
            value={displayName}
            maxLength={32}
            placeholder="例: はると"
            onChange={(event) => onDisplayNameChange(event.target.value)}
            className="k-input mt-2"
          />
        </label>
      )}

      <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border-2 border-black bg-[#f8f7f2] p-4">
        <div>
          <p className="font-black">GPAを公開</p>
          <p className="mt-1 text-xs font-bold text-black/45">OFFの場合、順位だけ表示します</p>
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
