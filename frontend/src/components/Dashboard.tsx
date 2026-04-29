"use client";

import { useCallback, useEffect, useState } from "react";
import { Match, MatchEvent, Insight, getMatches, getMatch, refreshMatches } from "@/lib/api";
import { usePolling } from "@/lib/usePolling";
import Sidebar from "@/components/Sidebar";
import MatchHeader from "@/components/MatchHeader";
import MomentumBar from "@/components/MomentumBar";
import StatsGrid from "@/components/StatsGrid";
import Predictions from "@/components/Predictions";

export default function Dashboard() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const matchesFetcher = useCallback(() => getMatches(), []);
  const { data: matches, loading: matchesLoading } = usePolling(matchesFetcher, 900000); // 15 minutes

  // Refresh matches when page loads
  useEffect(() => {
    const refresh = async () => {
      try {
        await refreshMatches();
      } catch (err) {
        console.log("Auto-refresh on load failed, using cached data");
      }
    };

    refresh();
  }, []);

  // Auto-select first live match
  useEffect(() => {
    if (matches && matches.length > 0 && selectedId === null) {
      const live = matches.find((m) => m.status === "live");
      setSelectedId(live?.id ?? matches[0].id);
    }
  }, [matches, selectedId]);

  // Fetch match detail when selection changes or on interval
  const fetchDetail = useCallback(async () => {
    if (!selectedId) return;
    setDetailLoading(true);
    try {
      const data = await getMatch(selectedId);
      setSelectedMatch(data.match);
    } catch {
      // Silently fail — will retry
    } finally {
      setDetailLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchDetail();
    const interval = setInterval(fetchDetail, 900000);
    return () => clearInterval(interval);
  }, [fetchDetail]);

  // Loading state
  if (matchesLoading && !matches) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full p-6 bg-gray-100">
      {/* LEFT SIDEBAR - with gray background gap */}
      <div className="bg-white rounded-lg overflow-hidden">
        <Sidebar
          matches={matches || []}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* CENTER PANEL - with gray background gap */}
      <main className="flex-1 min-w-0 overflow-y-auto space-y-4 scrollbar-thin bg-white rounded-lg p-6">
        {selectedMatch ? (
          <>
            <MatchHeader match={selectedMatch} />
            <MomentumBar
              momentum={selectedMatch.momentum}
              homeTeam={selectedMatch.home.short}
              awayTeam={selectedMatch.away.short}
            />
            <StatsGrid
              stats={selectedMatch.stats}
              homeTeam={selectedMatch.home.short}
              awayTeam={selectedMatch.away.short}
            />
            <Predictions
              stats={selectedMatch.stats}
              score={selectedMatch.score}
              momentum={selectedMatch.momentum}
              homeTeam={selectedMatch.home.name}
              awayTeam={selectedMatch.away.name}
              minute={selectedMatch.minute}
            />
            {/* Match Timeline */}
          </>
        ) : detailLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-medium">
            Select a match to view details
          </div>
        )}
      </main>
    </div>
  );
}
