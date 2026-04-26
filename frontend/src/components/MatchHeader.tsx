"use client";

import { Match } from "@/lib/api";

interface MatchHeaderProps {
  match: Match;
}

export default function MatchHeader({ match }: MatchHeaderProps) {
  const statusBadge =
    match.status === "live" ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-lg font-bold">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        LIVE {match.minute}&apos;
      </span>
    ) : match.status === "finished" ? (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold">
        FULL TIME
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-100 text-blue-600 text-xs font-bold">
        UPCOMING
      </span>
    );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      {/* League + Status */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <img
            src={match.league.flag}
            alt={match.league.country}
            className="w-5 h-4 object-contain"
          />
          <span className="text-lg font-medium text-gray-600">
            {match.league.name}
          </span>
        </div>
        {statusBadge}
      </div>

      {/* Score */}
      <div className="flex items-center justify-center">
        {/* Home */}
        <div className="flex flex-col items-center gap-3 flex-1">
          <img
            src={match.home.logo || "https://via.placeholder.com/64"}
            alt={match.home.name}
            className="w-28 h-24 object-contain"
          />
          <span className="text-base font-bold text-gray-900 text-center">{match.home.name}</span>
          <span className="text-lg text-gray-400">{match.home.short}</span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2">
          <span className="text-5xl font-black text-gray-900 tabular-nums">
            {match.status !== "upcoming" ? match.score.home : "-"}
          </span>
          <span className="text-4xl font-light text-gray-300">:</span>
          <span className="text-5xl font-black text-gray-900 tabular-nums">
            {match.status !== "upcoming" ? match.score.away : "-"}
          </span>
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-3 flex-1">
          <img
            src={match.away.logo || "https://via.placeholder.com/64"}
            alt={match.away.name}
            className="w-28 h-24 object-contain"
          />
          <span className="text-base font-bold text-gray-900 text-center">{match.away.name}</span>
          <span className="text-lg text-gray-400">{match.away.short}</span>
        </div>
      </div>
    </div>
  );
}
