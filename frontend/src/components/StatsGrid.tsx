"use client";

import { MatchStats } from "@/lib/api";

interface StatsGridProps {
  stats: MatchStats;
  homeTeam: string;
  awayTeam: string;
}

interface StatRowProps {
  label: string;
  home: number;
  away: number;
  isPercentage?: boolean;
}

function StatRow({ label, home, away, isPercentage }: StatRowProps) {
  const total = home + away || 1;
  const homePercent = (home / total) * 100;
  const awayPercent = (away / total) * 100;

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-bold text-gray-900 tabular-nums w-10 text-left">
          {home}{isPercentage ? "%" : ""}
        </span>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-widest flex-1 text-center">
          {label}
        </span>
        <span className="font-bold text-gray-900 tabular-nums w-10 text-right">
          {away}{isPercentage ? "%" : ""}
        </span>
      </div>
      <div className="flex h-1.5 rounded-sm overflow-hidden bg-gray-100">
        {/* Left side - home team */}
        <div className="flex-1 relative">
          <div
            className="absolute right-0 top-0 bottom-0 bg-blue-500 transition-all duration-700"
            style={{ width: `${homePercent}%` }}
          />
        </div>
        {/* Right side - away team */}
        <div className="flex-1 relative">
          <div
            className="absolute left-0 top-0 bottom-0 bg-blue-500 transition-all duration-700"
            style={{ width: `${awayPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function StatsGrid({ stats, homeTeam, awayTeam }: StatsGridProps) {
  // Check if stats are actually available (not all zeros)
  const hasStats = stats && (
    stats.homePossession > 0 ||
    stats.homeShots > 0 ||
    stats.homeCorners > 0 ||
    stats.homeFouls > 0
  );

  if (!hasStats) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-3">
          Match Statistics
        </h3>
        <div className="flex items-center justify-center py-6">
          <p className="text-gray-400 text-xs font-medium text-center">
            Statistics not available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">
        Match Statistics
      </h3>

      <div className="flex items-center justify-between text-xs font-bold text-gray-600 uppercase tracking-widest mb-3 px-1">
        <span>{homeTeam}</span>
        <span>{awayTeam}</span>
      </div>

      <div className="divide-y divide-gray-100">
        <StatRow
          label="Possession"
          home={stats.homePossession}
          away={stats.awayPossession}
          isPercentage
        />
        <StatRow label="Shots" home={stats.homeShots} away={stats.awayShots} />
        <StatRow
          label="Shots on Target"
          home={stats.homeShotsOnTarget}
          away={stats.awayShotsOnTarget}
        />
        <StatRow
          label="Dangerous Attacks"
          home={stats.homeDangerousAttacks}
          away={stats.awayDangerousAttacks}
        />
        <StatRow
          label="Corners"
          home={stats.homeCorners}
          away={stats.awayCorners}
        />
        <StatRow label="Fouls" home={stats.homeFouls} away={stats.awayFouls} />
        <StatRow
          label="Yellow Cards"
          home={stats.homeYellowCards}
          away={stats.awayYellowCards}
        />
      </div>
    </div>
  );
}
