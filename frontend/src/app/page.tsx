"use client";

import { useCallback, useEffect, useState } from "react";
import { getMatches } from "@/lib/api";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [liveCount, setLiveCount] = useState(0);

  const fetchMatches = useCallback(async () => {
    try {
      const data = await getMatches();
      const liveMatches = data.filter((m) => m.status === "live").length;
      setLiveCount(liveMatches);
    } catch (error) {
      console.error("Failed to fetch live matches count:", error);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 900000); 
    return () => clearInterval(interval);
  }, [fetchMatches]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header / Navbar */}
      <header className="bg-white px-8 py-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-10 mx-4 mt-4 rounded-t-xl">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-5">
          <span className="text-5xl">⚽</span>
          <h1 className="text-5xl font-black tracking-tight text-gray-900">MatchFlow</h1>
        </div>

        {/* Right: Live Status + Icons */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xl font-medium">{liveCount} MATCHES</span>
          </div>
        </div>
      </header>

      {/* Dashboard - Content area */}
      <div className="flex-1 overflow-hidden">
        <Dashboard />
      </div>
    </div>
  );
}
