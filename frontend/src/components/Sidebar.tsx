"use client";

import { Match } from "@/lib/api";
import MatchList from "./MatchList";

interface SidebarProps {
  matches: Match[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function Sidebar({ matches, selectedId, onSelect }: SidebarProps) {
  const liveCount = matches.filter((m) => m.status === "live").length;
  const excitingCount = matches.filter((m) => m.status !== "live").length;

  return (
    <aside className="w-96 min-w-96 bg-white rounded-xl border border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold rounded-full text-center bg-green-100 text-green-700">Live Matches</h2> 
      </div>

      {/* Match list - unified with live on top, exciting below */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
        <MatchList
          matches={matches}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </div>
    </aside>
  );
}
