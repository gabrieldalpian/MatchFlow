import { fetchMatches } from "../services/apiFootball";
import { processMatches } from "../processors/matchProcessor";
import { updateStore } from "../store/store";
import { Server } from "socket.io";

let io: Server | null = null;

export const setSocket = (socketInstance: Server): void => {
  io = socketInstance;
};

export async function updateMatches(): Promise<void> {
  try {
    const matches = await fetchMatches();

    if (!matches || matches.length === 0) {
      console.warn("No matches fetched from API");
    }

    const processed = processMatches(matches);

    updateStore({
      matches: processed,
      events: [],
      insights: processed.flatMap((m) => m.insights || []),
    });

    if (io) {
      io.emit("matches:update", processed);
    } else {
      console.warn("Socket.IO not initialized yet");
    }

    console.log(`Updated matches: ${processed.length} matches processed`);
  } catch (error) {
    console.error("Error updating matches:", error instanceof Error ? error.message : error);
  }
}