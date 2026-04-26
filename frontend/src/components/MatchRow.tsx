"use client";

import { Match } from "@/lib/api";

interface MatchRowProps {
  match: Match;
  isSelected: boolean;
  onClick: () => void;
  isLive?: boolean;
}

export default function MatchRow({ match, isSelected, onClick, isLive = false }: MatchRowProps) {
  const statusColor =
    match.status === "live"
      ? "bg-green-500"
      : match.status === "finished"
      ? "bg-gray-400"
      : "bg-blue-400";

  const statusText =
    match.status === "live"
      ? `${match.minute}'`
      : match.status === "finished"
      ? "FT"
      : "—";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg transition-all duration-200 ${
        isLive
          ? isSelected
            ? "bg-blue-50 border border-blue-300 shadow-md px-5 py-5"
            : "bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 px-5 py-5"
          : isSelected
          ? "bg-blue-50 border border-blue-300 shadow-sm px-3.5 py-3"
          : "bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 px-3.5 py-3"
      }`}
    >
      <div className={`flex items-center ${isLive ? "gap-4" : "gap-3"}`}>
        {/* Status indicator */}
        <div className="flex flex-col items-center min-w-[48px]">
          <span
            className={`inline-block ${isLive ? "w-3 h-3" : "w-2 h-2"} rounded-full ${statusColor} ${
              match.status === "live" ? "animate-pulse" : ""
            }`}
          />
          <span className={`font-semibold mt-2 ${isLive ? "text-sm text-gray-500" : "text-xs text-gray-500"}`}>
            {statusText}
          </span>
        </div>

        {/* Teams */}
        <div className="flex-1 min-w-0">
          <div className={`flex items-center justify-between ${isLive ? "mb-2.5" : "mb-1.5"}`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img
                src={match.home.logo || "https://via.placeholder.com/32"}
                alt={match.home.name}
                className={`object-contain flex-shrink-0 ${isLive ? "w-9 h-9" : "w-7 h-7"}`}
              />
              <span className={`font-medium text-gray-800 truncate ${isLive ? "text-base" : "text-sm"}`}>
                {match.home.name}
              </span>
            </div>
            <span className={`font-bold text-gray-900 tabular-nums flex-shrink-0 ml-2 ${isLive ? "text-xl" : "text-sm"}`}>
              {match.status !== "upcoming" ? match.score.home : ""}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img
                src={match.away.logo || "https://via.placeholder.com/32"}
                alt={match.away.name}
                className={`object-contain flex-shrink-0 ${isLive ? "w-9 h-9" : "w-7 h-7"}`}
              />
              <span className={`font-medium text-gray-800 truncate ${isLive ? "text-base" : "text-sm"}`}>
                {match.away.name}
              </span>
            </div>
            <span className={`font-bold text-gray-900 tabular-nums flex-shrink-0 ml-2 ${isLive ? "text-xl" : "text-sm"}`}>
              {match.status !== "upcoming" ? match.score.away : ""}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
