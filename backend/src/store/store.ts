interface Match {
  id: number;
  home?: { id?: number; name?: string; logo?: string | null };
  away?: { id?: number; name?: string; logo?: string | null };
  score?: { home: number | null; away: number | null };
  minute?: number;
  status?: string;
  league?: { id: number; name: string; country: string; flag: string | null };
  stats?: any;
}

interface Event {
  matchId: number;
  [key: string]: any;
}

interface Insight {
  matchId: number;
  [key: string]: any;
}

export const store = {
  matches: [] as Match[],
  events: [] as Event[],
  insights: [] as Insight[],
};

export const getStore = () => store;

export const updateStore = (data: any) => {
  store.matches = data.matches;
  store.events = data.events;
  store.insights = data.insights;
};