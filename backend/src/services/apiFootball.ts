import axios from "axios";

interface Match {
  id: number;
  home: { name: string; logo: string | null; id: number };
  away: { name: string; logo: string | null; id: number };
  score: { home: number | null; away: number | null };
  minute: number;
  status: string;
  league: {
    id: number;
    name: string;
    country: string;
    logo: string | null;
    flag: string | null;
    season: number;
  };
  stats?: {
    possession?: { home: number; away: number };
    shotsOn?: { home: number; away: number };
    shots?: { home: number; away: number };
    passes?: { home: number; away: number };
    tackles?: { home: number; away: number };
    corners?: { home: number; away: number };
    fouls?: { home: number; away: number };
    cards?: {
      yellow?: { home: number; away: number };
      red?: { home: number; away: number };
    };
  };
}

function mapMatch(match: any): Match {
  return {
    id: match.fixture?.id ?? 0,
    home: {
      id: match.teams?.home?.id ?? 0,
      name: match.teams?.home?.name ?? "Unknown",
      logo: match.teams?.home?.logo ?? null,
    },
    away: {
      id: match.teams?.away?.id ?? 0,
      name: match.teams?.away?.name ?? "Unknown",
      logo: match.teams?.away?.logo ?? null,
    },
    score: {
      home: match.goals?.home ?? null,
      away: match.goals?.away ?? null,
    },
    minute: match.fixture?.status?.elapsed ?? 0,
    status: match.fixture?.status?.short ?? "NS",
    league: {
      id: match.league?.id ?? 0,
      name: match.league?.name ?? "Unknown League",
      country: match.league?.country ?? "Unknown",
      logo: match.league?.logo ?? null,
      flag: match.league?.flag ?? null,
      season: match.league?.season ?? new Date().getFullYear(),
    },
    stats: match.statistics ? mapStatistics(match.statistics) : undefined,
  };
}

function mapStatistics(stats: any): Match['stats'] {
  // stats is an array [home, away]
  const [homeStat, awayStat] = stats;
  
  return {
    possession: {
      home: extractStat(homeStat, 'Ball Possession'),
      away: extractStat(awayStat, 'Ball Possession'),
    },
    shots: {
      home: extractStat(homeStat, 'Total Shots'),
      away: extractStat(awayStat, 'Total Shots'),
    },
    shotsOn: {
      home: extractStat(homeStat, 'Shots on Goal'),
      away: extractStat(awayStat, 'Shots on Goal'),
    },
    passes: {
      home: extractStat(homeStat, 'Total Passes'),
      away: extractStat(awayStat, 'Total Passes'),
    },
    tackles: {
      home: extractStat(homeStat, 'Tackles'),
      away: extractStat(awayStat, 'Tackles'),
    },
    corners: {
      home: extractStat(homeStat, 'Corner Kicks'),
      away: extractStat(awayStat, 'Corner Kicks'),
    },
    fouls: {
      home: extractStat(homeStat, 'Fouls'),
      away: extractStat(awayStat, 'Fouls'),
    },
    cards: {
      yellow: {
        home: extractStat(homeStat, 'Yellow Cards'),
        away: extractStat(awayStat, 'Yellow Cards'),
      },
      red: {
        home: extractStat(homeStat, 'Red Cards'),
        away: extractStat(awayStat, 'Red Cards'),
      },
    },
  };
}

function extractStat(teamStat: any, statName: string): number {
  if (!teamStat?.statistics) return 0;
  const stat = teamStat.statistics.find((s: any) => s.type === statName);
  const value = stat?.value;
  // Handle percentages (possession)
  if (typeof value === 'string' && value.includes('%')) {
    return parseInt(value, 10);
  }
  return typeof value === 'number' ? value : 0;
}

export async function fetchMatches(): Promise<Match[]> {
  try {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.warn("❌ Missing API_KEY in .env");
      return [];
    }

    console.log("API KEY:", apiKey ? "✅ loaded" : "❌ missing");

    // 🔥 1. TRY LIVE MATCHES FIRST
    const liveResponse = await axios.get(
      "https://v3.football.api-sports.io/fixtures",
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        params: {
          live: "all",
        },
      }
    );

    console.log(`✅ Live API Status: ${liveResponse.status}`);

    const liveData = liveResponse.data?.response;

    if (Array.isArray(liveData) && liveData.length > 0) {
      console.log(`🔥 Live matches found: ${liveData.length}`);
      
      // Fetch statistics for each live match
      const matchesWithStats = await Promise.all(
        liveData.map(async (match) => {
          try {
            const statsResponse = await axios.get(
              `https://v3.football.api-sports.io/fixtures/statistics`,
              {
                headers: {
                  "x-apisports-key": apiKey,
                },
                params: {
                  fixture: match.fixture.id,
                },
              }
            );
            return {
              ...match,
              statistics: statsResponse.data?.response,
            };
          } catch (err) {
            console.warn(`⚠️ Could not fetch stats for match ${match.fixture.id}`);
            return match;
          }
        })
      );
      
      return matchesWithStats.map(mapMatch);
    }

    // ⚠️ 2. FALLBACK → LAST MATCHES
    console.log("⚠️ No live matches, fetching recent...");

    const season =
      new Date().getMonth() >= 7
        ? new Date().getFullYear()
        : new Date().getFullYear() - 1;

    const fallbackResponse = await axios.get(
      "https://v3.football.api-sports.io/fixtures",
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        params: {
          league: 39, // Premier League
          season,
          last: 10,
        },
      }
    );
    
    // Fetch statistics for fallback matches
    let fallbackDataWithStats = [];
    if (Array.isArray(fallbackResponse.data?.response)) {
      fallbackDataWithStats = await Promise.all(
        fallbackResponse.data.response.map(async (match: any) => {
          try {
            const statsResponse = await axios.get(
              `https://v3.football.api-sports.io/fixtures/statistics`,
              {
                headers: {
                  "x-apisports-key": apiKey,
                },
                params: {
                  fixture: match.fixture.id,
                },
              }
            );
            return {
              ...match,
              statistics: statsResponse.data?.response,
            };
          } catch (err) {
            console.warn(`⚠️ Could not fetch stats for match ${match.fixture.id}`);
            return match;
          }
        })
      );
    }

    console.log(`✅ Fallback API Status: ${fallbackResponse.status}`);

    if (Array.isArray(fallbackDataWithStats) && fallbackDataWithStats.length > 0) {
      console.log(`✅ Fallback matches found: ${fallbackDataWithStats.length}`);
      return fallbackDataWithStats.map(mapMatch);
    }

    console.warn("❌ No matches found at all");
    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "❌ API Error:",
        error.response?.status,
        error.response?.statusText
      );
      console.error("Response:", error.response?.data);

      // Check for domain restriction error
      if (error.response?.data?.errors?.Ip) {
        console.error(
          "🚫 Domain Restriction Error:",
          error.response.data.errors.Ip
        );
        console.error(
          "ℹ️  Add your backend domain to allowed domains in the API dashboard"
        );
      }
    } else {
      console.error(
        "❌ Fetch matches error:",
        error instanceof Error ? error.message : error
      );
    }

    return [];
  }
}