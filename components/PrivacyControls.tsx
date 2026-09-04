"use client";

import { Eye, EyeOff } from "lucide-react";
import type { IdentityMode, Visibility } from "@/lib/types";
import { Toggle } from "./Toggle";

const SEAT_NUMBERS = Array.from({ length: 40 }, (_, index) => 401 + index);

export function PrivacyControls({
  identityMode,
  displayName,
  gpaVisibility,
  seatNumber,
  seatNumberVisibility,
  onIdentityModeChange,
  onDisplayNameChange,
  onGpaVisibilityChange,
  onSeatNumberChange,
  onSeatNumberVisibilityChange,
}: {
  identityMode: IdentityMode;
  displayName: string;
  gpaVisibility: Visibility;
  seatNumber: number | null;
  seatNumberVisibility: Visibility;
  onIdentityModeChange: (mode: IdentityMode) => void;
  onDisplayNameChange: (value: string) => void;
  onGpaVisibilityChange: (visibility: Visibility) => void;
  onSeatNumberChange: (seatNumber: number | null) => void;
  onSeatNumberVisibilityChange: (visibility: Visibility) => void;
}) {
  return (
    <section className="k-card p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="k-label">Visibility</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.025em]">公開設定</h2>
        </div>
        <div className="grid size-10 place-items-center rounded-[4px] border border-black/15">
          {gpaVisibility === "public" ? <Eye size={18} /> : <EyeOff size={18} />}
        </div>
      </div>

      <label className="mt-6 block text-sm font-bold">
        出席番号 <span className="text-black/40">401–440</span>
        <select
          value={seatNumber ?? ""}
          required
          onChange={(event) => onSeatNumberChange(event.target.value ? Number(event.target.value) : null)}
          className="k-input mt-2"
        >
          <option value="">選択してください</option>
          {SEAT_NUMBERS.map((number) => (
            <option key={number} value={number}>{number}</option>
          ))}
        </select>
      </label>
      <p className="mt-2 text-xs font-medium leading-5 text-black/40">同じ出席番号は1人だけ登録できます。本人確認は行いません。</p>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-black/10 pt-5">
        <div>
          <p className="font-bold">出席番号を公開</p>
          <p className="mt-1 text-xs font-medium text-black/40">OFFの場合、ランキングには表示しません</p>
        </div>
        <Toggle
          checked={seatNumberVisibility === "public"}
          onChange={(value) => onSeatNumberVisibilityChange(value ? "public" : "private")}
          label="Seat number visibility"
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-[6px] bg-neutral-100 p-1">
        {(["named", "anonymous"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onIdentityModeChange(mode)}
            className={`rounded-[4px] px-3 py-2.5 text-sm font-bold transition ${identityMode === mode ? "bg-black text-white" : "text-black/45 hover:text-black"}`}
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

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-black/10 pt-5">
        <div>
          <p className="font-bold">GPAを公開</p>
          <p className="mt-1 text-xs font-medium text-black/40">OFFの場合、順位だけ表示します</p>
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
