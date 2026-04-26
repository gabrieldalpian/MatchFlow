"use client";

import { Match } from "@/lib/api";
import MatchRow from "./MatchRow";

interface MatchListProps {
  matches: Match[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

function calculateExcitement(match: Match): number {
  // Close scores get high excitement
  const scoreDiff = Math.abs(match.score.home - match.score.away);
  const scoreExcitement = 100 - scoreDiff * 20; // 1-goal diff = high excitement
  
  return scoreExcitement;
}

export default function MatchList({
  matches,
  selectedId,
  onSelect,
}: MatchListProps) {
  // Separate live and finished/upcoming
  const liveMatches = matches.filter((m) => m.status === "live");
  const otherMatches = matches.filter((m) => m.status !== "live");

  // 1. Close scores (higher excitement)
  // 2. Recent (higher minute for finished, higher minute for live that just ended)
  const sortedExciting = otherMatches.sort((a, b) => {
    const excitementA = calculateExcitement(a);
    const excitementB = calculateExcitement(b);
    
    if (excitementB !== excitementA) {
      return excitementB - excitementA;
    }
    
    // If excitement is same, sort by minute (recent first)
    return b.minute - a.minute;
  });

  const allMatches = [
    ...liveMatches,
    ...sortedExciting,
  ];

  if (allMatches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-lg">No matches available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div className="pb-4">
          <div className="space-y-3">
            {liveMatches.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                isSelected={selectedId === match.id}
                onClick={() => onSelect(match.id)}
                isLive={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
