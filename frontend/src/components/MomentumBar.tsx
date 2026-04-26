"use client";

interface MomentumBarProps {
  momentum: number; // -100 to 100
  homeTeam: string;
  awayTeam: string;
}

export default function MomentumBar({ momentum, homeTeam, awayTeam }: MomentumBarProps) {
  // Convert momentum (-100 to 100) to percentage (0 to 100)
  const homeWidth = Math.max(5, 50 + momentum / 2);
  const awayWidth = 100 - homeWidth;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2">
        Momentum
      </h3>

      <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2">
        <span>{homeTeam}</span>
        <span>{awayTeam}</span>
      </div>

      <div className="flex h-5 rounded-lg overflow-hidden bg-gray-100">
        <div
          className="bg-blue-500 transition-all duration-1000 ease-out rounded-l-lg flex items-center justify-end pr-2.5"
          style={{ width: `${homeWidth}%` }}
        >
          <span className="text-xs font-bold text-white">
            {Math.round(homeWidth)}%
          </span>
        </div>
        <div
          className="bg-red-500 transition-all duration-1000 ease-out rounded-r-lg flex items-center pl-2.5"
          style={{ width: `${awayWidth}%` }}
        >
          <span className="text-xs font-bold text-white">
            {Math.round(awayWidth)}%
          </span>
        </div>
      </div>

      {/* Momentum indicator */}
      <div className="flex justify-center mt-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            momentum > 20
              ? "bg-blue-100 text-blue-700"
              : momentum < -20
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {momentum > 20
            ? `${homeTeam} pressing`
            : momentum < -20
            ? `${awayTeam} pressing`
            : "Balanced"}
        </span>
      </div>
    </div>
  );
}
