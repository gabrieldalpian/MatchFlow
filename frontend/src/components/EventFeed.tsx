"use client";

import { MatchEvent } from "@/lib/api";

interface EventFeedProps {
  events: MatchEvent[];
}

const eventIcons: Record<string, string> = {
  goal: "⚽",
  yellow_card: "🟨",
  red_card: "🟥",
  substitution: "🔄",
  corner: "📐",
  free_kick: "🦶",
};

export default function EventFeed({ events }: EventFeedProps) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-4">
          Event Feed
        </h3>
        <p className="text-gray-400 text-sm font-medium">No events yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-4">
        Event Feed
      </h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
        {events.slice(0, 20).map((event) => (
          <div
            key={event.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              event.type === "goal"
                ? "bg-yellow-50 border border-yellow-100"
                : "bg-gray-50 border border-gray-100"
            }`}
          >
            <span className="text-base flex-shrink-0">
              {eventIcons[event.type] || "⚡"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {event.player}
              </p>
              <p className="text-xs text-gray-500">
                {event.team} · {event.type.replace("_", " ")}
              </p>
            </div>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded tabular-nums flex-shrink-0">
              {event.minute}&apos;
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
