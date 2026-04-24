import { Router } from "express";
import { getStore } from "../store/store";

const router = Router();

router.get("/matches", (req, res) => {
  const matches = getStore().matches.map((match: any) => {
    // Transform stats to match frontend expectations
    const transformedStats = transformStats(match.stats);
    
    return {
      ...match,
      homeId: match.home?.id ?? 0,
      awayId: match.away?.id ?? 0,
      league: match.league || {
        id: 0,
        name: "Unknown League",
        country: "Unknown",
        flag: null,
      },
      stats: transformedStats,
      status: match.status === "NS" ? "upcoming" : match.status === "FT" ? "finished" : "live",
    };
  });
  res.json({ matches });
});

function transformStats(stats: any) {
  if (!stats) {
    return {
      homePossession: 0,
      awayPossession: 0,
      homeShots: 0,
      awayShots: 0,
      homeShotsOnTarget: 0,
      awayShotsOnTarget: 0,
      homeAttacks: 0,
      awayAttacks: 0,
      homeDangerousAttacks: 0,
      awayDangerousAttacks: 0,
      homeCorners: 0,
      awayCorners: 0,
      homeFouls: 0,
      awayFouls: 0,
      homeYellowCards: 0,
      awayYellowCards: 0,
      homeRedCards: 0,
      awayRedCards: 0,
    };
  }

  return {
    homePossession: stats.possession?.home ?? 0,
    awayPossession: stats.possession?.away ?? 0,
    homeShots: stats.shots?.home ?? 0,
    awayShots: stats.shots?.away ?? 0,
    homeShotsOnTarget: stats.shotsOn?.home ?? 0,
    awayShotsOnTarget: stats.shotsOn?.away ?? 0,
    homeAttacks: stats.passes?.home ? Math.floor(stats.passes.home / 10) : 0,
    awayAttacks: stats.passes?.away ? Math.floor(stats.passes.away / 10) : 0,
    homeDangerousAttacks: stats.shotsOn?.home ? Math.floor(stats.shotsOn.home * 0.6) : 0,
    awayDangerousAttacks: stats.shotsOn?.away ? Math.floor(stats.shotsOn.away * 0.6) : 0,
    homeCorners: stats.corners?.home ?? 0,
    awayCorners: stats.corners?.away ?? 0,
    homeFouls: stats.fouls?.home ?? 0,
    awayFouls: stats.fouls?.away ?? 0,
    homeYellowCards: stats.cards?.yellow?.home ?? 0,
    awayYellowCards: stats.cards?.yellow?.away ?? 0,
    homeRedCards: stats.cards?.red?.home ?? 0,
    awayRedCards: stats.cards?.red?.away ?? 0,
  };
}

router.get("/events", (req, res) => {
  res.json({ events: getStore().events });
});

router.get("/insights", (req, res) => {
  res.json({ insights: getStore().insights });
});

// Get specific match details
router.get("/match/:id", (req, res) => {
  const matchId = parseInt(req.params.id);
  const match = getStore().matches.find((m: any) => m.id === matchId);
  
  if (!match) {
    return res.status(404).json({ error: "Match not found" });
  }

  const matchEvents = getStore().events.filter((e: any) => e.matchId === matchId);
  const matchInsights = getStore().insights.filter((i: any) => i.matchId === matchId);
  const transformedStats = transformStats(match.stats);

  res.json({
    match: {
      ...match,
      homeId: match.home?.id ?? 0,
      awayId: match.away?.id ?? 0,
      stats: transformedStats,
      status: match.status === "NS" ? "upcoming" : match.status === "FT" ? "finished" : "live",
    },
    events: matchEvents,
    insights: matchInsights,
  });
});

// Mock data endpoint for testing
router.get("/matches/mock", (req, res) => {
  const mockMatches = [
    {
      id: 1,
      home: { name: "Manchester United", logo: "https://example.com/man-utd.png" },
      away: { name: "Liverpool", logo: "https://example.com/liverpool.png" },
      score: { home: 2, away: 1 },
      minute: 45,
      status: "1H",
      momentum: 65,
      insights: [{ text: "Manchester United leading 2-1", type: "positive" as const }],
    },
    {
      id: 2,
      home: { name: "Arsenal", logo: "https://example.com/arsenal.png" },
      away: { name: "Chelsea", logo: "https://example.com/chelsea.png" },
      score: { home: 1, away: 1 },
      minute: 60,
      status: "2H",
      momentum: 50,
      insights: [{ text: "Match is tied", type: "neutral" as const }],
    },
  ];
  res.json({ count: mockMatches.length, matches: mockMatches });
});

// Debug endpoint to check API setup
router.get("/debug", (req, res) => {
  const apiKey = process.env.API_KEY;
  const apiHost = process.env.API_HOST;
  
  res.json({
    status: "API Debug Info",
    env: {
      API_KEY: apiKey ? "✅ Set" : "❌ Missing",
      API_HOST: apiHost ? "✅ Set" : "❌ Missing",
    },
    store: {
      matchesCount: getStore().matches.length,
      eventsCount: getStore().events.length,
      insightsCount: getStore().insights.length,
    },
    endpoints: {
      liveMatches: "/api/matches",
      mockMatches: "/api/matches/mock",
      events: "/api/events",
      insights: "/api/insights",
    },
  });
});

export default router;