const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://matchflow-idnb.onrender.com";

export interface Team {
  id: number;
  name: string;
  short: string;
  logo: string;
}

export interface League {
  id: number;
  name: string;
  country: string;
  flag: string;
}

export interface MatchStats {
  homePossession: number;
  awayPossession: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeAttacks: number;
  awayAttacks: number;
  homeDangerousAttacks: number;
  awayDangerousAttacks: number;
  homeCorners: number;
  awayCorners: number;
  homeFouls: number;
  awayFouls: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
}

export interface Match {
  id: number;
  homeId: number;
  awayId: number;
  home: Team;
  away: Team;
  league: League;
  status: "live" | "finished" | "upcoming";
  minute: number;
  score: { home: number; away: number };
  stats: MatchStats;
  momentum: number;
  momentumHistory: number[];
}

export interface MatchEvent {
  id: string;
  matchId: number;
  type: string;
  team: string;
  teamShort: string;
  teamLogo: string;
  player: string;
  minute: number;
  isHome: boolean;
  timestamp: string;
}

export interface Insight {
  id: string;
  matchId: number;
  text: string;
  type: "positive" | "negative";
  category: string;
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getMatches(): Promise<Match[]> {
  const data = await fetchJSON<{ matches: Match[] }>("/api/matches");
  return data.matches;
}

export async function getMatch(id: number): Promise<{
  match: Match;
  events: MatchEvent[];
  insights: Insight[];
}> {
  return fetchJSON(`/api/match/${id}`);
}

export async function getEvents(): Promise<MatchEvent[]> {
  const data = await fetchJSON<{ events: MatchEvent[] }>("/api/events");
  return data.events;
}

export async function getInsights(): Promise<Insight[]> {
  const data = await fetchJSON<{ insights: Insight[] }>("/api/insights");
  return data.insights;
}

export async function refreshMatches(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/matches/refresh`, { method: "POST" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
}
