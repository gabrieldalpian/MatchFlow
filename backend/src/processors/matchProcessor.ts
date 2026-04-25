interface Match {
  id: number;
  home: { name: string; logo: string | null; id: number };
  away: { name: string; logo: string | null; id: number };
  score: { home: number | null; away: number | null };
  minute: number;
  status: string;
  league: any;
  stats?: any;
}

interface Insight {
  text: string;
  type: "positive" | "negative" | "neutral";
}

interface ProcessedMatch extends Match {
  home: { name: string; logo: string | null; short: string; id: number };
  away: { name: string; logo: string | null; short: string; id: number };
  momentum: number;
  insights: Insight[];
  momentumHistory: number[];
}

function getTeamShort(teamName: string): string {
  // Extract first 3 letters of team name or abbreviate it
  const words = teamName.split(" ");
  if (words.length > 1) {
    return (words[0][0] + words[1][0] + (words[1][1] || "")).toUpperCase();
  }
  return teamName.substring(0, 3).toUpperCase();
}

function calculateMomentum(stats: any): number {
  if (!stats) return 50; // Neutral if no stats
  
  // Calculate momentum based on possession and shots
  const possession = stats.possession?.home ?? 50;
  const shotsHome = stats.shots?.home ?? 0;
  const shotsAway = stats.shots?.away ?? 1;
  
  // Momentum: 0-100, where 50 is balanced
  // 40% possession + 60% shot ratio
  const possessionMomentum = possession;
  const shotRatio = (shotsHome / (shotsHome + shotsAway)) * 100;
  
  return Math.round(possessionMomentum * 0.4 + shotRatio * 0.6);
}

export function processMatches(matches: Match[]): ProcessedMatch[] {
  return matches.map((match) => {
    const momentum = calculateMomentum(match.stats);
    const insights = generateInsights(match);
    
    // Create momentum history (simulated progression, but based on actual momentum)
    const momentumHistory = generateMomentumHistory(momentum);

    return {
      ...match,
      home: {
        ...match.home,
        short: getTeamShort(match.home.name),
      },
      away: {
        ...match.away,
        short: getTeamShort(match.away.name),
      },
      momentum,
      insights,
      momentumHistory,
    };
  });
}

function generateMomentumHistory(currentMomentum: number): number[] {
  // Generate realistic momentum history trending toward current value
  const history: number[] = [];
  let value = 50; // Start neutral
  
  for (let i = 0; i < 10; i++) {
    // Trend toward current momentum with some variance
    const target = currentMomentum;
    const change = (target - value) * 0.15 + (Math.random() - 0.5) * 5;
    value = Math.max(0, Math.min(100, value + change));
    history.push(Math.round(value));
  }
  
  return history;
}

function generateInsights(match: Match): Insight[] {
  const insights: Insight[] = [];

  if (match.score.home !== null && match.score.away !== null) {
    const homeLead = match.score.home - match.score.away;
    if (homeLead > 0) {
      insights.push({
        text: `${match.home.name} leading by ${homeLead}`,
        type: "positive",
      });
    } else if (homeLead < 0) {
      insights.push({
        text: `${match.away.name} leading by ${Math.abs(homeLead)}`,
        type: "positive",
      });
    } else {
      insights.push({
        text: "Match is tied",
        type: "neutral",
      });
    }
  }

  return insights;
}