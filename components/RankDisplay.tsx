import { Crown, Medal } from "lucide-react";

const podiumThemes = {
  1: {
    row: "bg-[linear-gradient(90deg,#fff0a6_0%,#fffdf3_72%)] shadow-[inset_4px_0_0_#d49b00]",
    badge: "border-[#9f7200] bg-[#f7c948] text-black",
  },
  2: {
    row: "bg-[linear-gradient(90deg,#e8ebef_0%,#fbfbfb_72%)] shadow-[inset_4px_0_0_#8c96a3]",
    badge: "border-[#77818c] bg-[#dce1e7] text-black",
  },
  3: {
    row: "bg-[linear-gradient(90deg,#f4cfb2_0%,#fffaf6_72%)] shadow-[inset_4px_0_0_#a95f2f]",
    badge: "border-[#8e4e27] bg-[#d99665] text-black",
  },
} as const;

export function getPodiumTheme(rank: number) {
  return podiumThemes[rank as keyof typeof podiumThemes] ?? null;
}

export function RankDisplay({ rank, total }: { rank: number; total?: number }) {
  const theme = getPodiumTheme(rank);
  const Icon = rank === 1 ? Crown : Medal;

  if (!theme) {
    return <span className="whitespace-nowrap font-mono font-black">#{rank}{total ? ` / ${total}` : ""}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs font-black ${theme.badge}`}>
      <Icon size={14} strokeWidth={2.5} aria-hidden />
      #{rank}{total ? ` / ${total}` : ""}
    </span>
  );
}
