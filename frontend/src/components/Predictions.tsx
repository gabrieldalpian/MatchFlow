"use client";

import { MatchStats } from "@/lib/api";

interface PredictionsProps {
  stats: MatchStats;
  score: { home: number; away: number };
  momentum: number;
  homeTeam: string;
  awayTeam: string;
  minute: number;
}

// ============================================================================
// PREDICTION STATE MACHINE
// ============================================================================

type PredictionStatus = "ACTIVE" | "WON" | "LOST" | "EXPIRED";
type ConfidenceLevel = "Low" | "Medium" | "High" | "Very High";

interface PredictionBase {
  id: string;
  label: string;
  status: PredictionStatus;
  confidence: ConfidenceLevel;
  insight: string;
  createdAtMinute: number;
}

interface ActivePrediction extends PredictionBase {
  status: "ACTIVE";
  value: string;
}

interface ResolvedPrediction extends PredictionBase {
  status: "WON" | "LOST";
  value: string;
  resolvedAtMinute: number;
}

type Prediction = ActivePrediction | ResolvedPrediction;

// ============================================================================
// MARKET VALIDATION LAYER
// ============================================================================

interface MarketState {
  bttsResolved: boolean;
  bttsWon: boolean;
  over25Resolved: boolean;
  over25Won: boolean;
  under25Resolved: boolean;
  under25Won: boolean;
  matchResultResolved: boolean;
  matchResultWinner: string | null;
}

function validateMarkets(
  score: { home: number; away: number },
  minute: number
): MarketState {
  const totalGoals = score.home + score.away;
  const homeLeading = score.home > score.away;
  const awayLeading = score.away > score.home;

  return {
    // BTTS: resolved when both have scored OR one team is mathematically eliminated
    bttsResolved: score.home > 0 && score.away > 0,
    bttsWon: score.home > 0 && score.away > 0,

    // Over 2.5: resolved when goals ≥ 3
    over25Resolved: totalGoals >= 3,
    over25Won: totalGoals >= 3,

    // Under 2.5: resolved when goals ≤ 2 AND match approaching end
    under25Resolved: totalGoals === 0 && minute > 80, // Only very late with no goals
    under25Won: totalGoals <= 2 && minute > 85,

    // Match result: only very certain if large lead at late stage
    matchResultResolved:
      (homeLeading && score.home - score.away >= 2 && minute > 75) ||
      (awayLeading && score.away - score.home >= 2 && minute > 75),
    matchResultWinner: homeLeading ? "HOME" : awayLeading ? "AWAY" : null,
  };
}

function calculateMomentumLabel(momentumValue: number): string {
  const absolute = Math.abs(momentumValue);
  if (absolute >= 80) return "Very High";
  if (absolute >= 60) return "High";
  if (absolute >= 40) return "Medium";
  return "Low";
}

function calculateConfidence(
  signals: number[],
  weights: number[] = []
): ConfidenceLevel {
  if (signals.length === 0) return "Low";

  // Use equal weights if not provided
  if (weights.length === 0) {
    weights = Array(signals.length).fill(1);
  }

  // Normalize signals to 0-1 range
  const normalizedSignals = signals.map((s) => Math.max(0, Math.min(1, s)));

  // Calculate weighted average
  const weightedSum = normalizedSignals.reduce((sum, sig, i) => sum + sig * weights[i], 0);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const confidence = (weightedSum / totalWeight) * 100;

  // Check signal agreement (variance)
  const variance =
    normalizedSignals.reduce((sum, sig, i) => {
      const expectedValue = weightedSum / totalWeight;
      return sum + (sig - expectedValue) ** 2 * weights[i];
    }, 0) / totalWeight;

  // High agreement + high confidence = Very High
  if (confidence >= 80 && variance < 0.1) return "Very High";
  if (confidence >= 70) return "High";
  if (confidence >= 50) return "Medium";
  return "Low";
}

function generatePredictions(
  stats: MatchStats,
  score: { home: number; away: number },
  momentum: number,
  homeTeam: string,
  awayTeam: string,
  minute: number
): Prediction[] {
  const predictions: Prediction[] = [];
  const markets = validateMarkets(score, minute);

  if (markets.bttsResolved) {
    if (markets.bttsWon) {
      predictions.push({
        id: "btts",
        label: "Both Teams To Score",
        status: "WON",
        value: "Yes ✅",
        confidence: "Very High",
        insight: `Both teams scored (${score.home}-${score.away})`,
        createdAtMinute: 0,
        resolvedAtMinute: minute,
      });
    }
  }

  if (!markets.bttsResolved && score.home === 0 && score.away === 0) {
    const homeThreat =
      (stats.homeShotsOnTarget * 2 +
        stats.homeDangerousAttacks * 1.5 +
        stats.homeCorners * 0.5) /
      5;
    const awayThreat =
      (stats.awayShotsOnTarget * 2 +
        stats.awayDangerousAttacks * 1.5 +
        stats.awayCorners * 0.5) /
      5;

    const bttsSignals = [
      Math.min(homeThreat / 3, 1), // Home threat normalized
      Math.min(awayThreat / 3, 1), // Away threat normalized
      stats.homeShotsOnTarget > 0 ? 1 : 0, // Home has SOT
      stats.awayShotsOnTarget > 0 ? 1 : 0, // Away has SOT
    ];

    const avgThreat = (homeThreat + awayThreat) / 2;
    const bttsPredicted = avgThreat > 2;
    const bttsConfidence = calculateConfidence(
      bttsPredicted ? bttsSignals : bttsSignals.map((s) => 1 - s),
      [0.25, 0.25, 0.25, 0.25]
    );

    predictions.push({
      id: "btts",
      label: "BTTS",
      status: "ACTIVE",
      value: bttsPredicted ? "Yes" : "No",
      confidence: bttsConfidence,
      insight: bttsPredicted
        ? `Both attacking (${stats.homeShotsOnTarget} & ${stats.awayShotsOnTarget} SOT)`
        : "Low attacking output",
      createdAtMinute: minute,
    });
  } else if (!markets.bttsResolved && score.home === 0) {
    // Home team hasn't scored yet - only predict if away is scoring easily
    const awayThreat = stats.awayShotsOnTarget > 2 ? 1 : 0.3;
    if (awayThreat > 0.5) {
      predictions.push({
        id: "btts",
        label: "BTTS",
        status: "ACTIVE",
        value: "Unlikely",
        confidence: "Medium",
        insight: `${homeTeam} hasn't broken through yet`,
        createdAtMinute: minute,
      });
    }
  } else if (!markets.bttsResolved && score.away === 0) {
    // Away team hasn't scored yet
    const homeGoals = score.home;
    const awayThreat = stats.awayShotsOnTarget;
    if (homeGoals >= 2 && awayThreat < 1) {
      predictions.push({
        id: "btts",
        label: "BTTS",
        status: "ACTIVE",
        value: "Unlikely",
        confidence: "High",
        insight: `${homeTeam} dominant (${score.home}-0), ${awayTeam} toothless`,
        createdAtMinute: minute,
      });
    }
  }

  if (!markets.over25Resolved) {
    const totalGoals = score.home + score.away;
    const shotsOnTargetFactor = Math.min(
      (stats.homeShotsOnTarget + stats.awayShotsOnTarget) / 6,
      1
    );
    const dangerousAttacksFactor = Math.min(
      (stats.homeDangerousAttacks + stats.awayDangerousAttacks) / 20,
      1
    );
    const momentumIntensity = Math.min(Math.abs(momentum) / 100, 1);

    const goalsProjection = (shotsOnTargetFactor * 0.5 + dangerousAttacksFactor * 0.3 + momentumIntensity * 0.2) * 5;

    let overUnderValue = "";
    let overUnderConfidence: ConfidenceLevel = "Low";

    if (totalGoals < 2 && goalsProjection > 3.5) {
      overUnderValue = "Over 2.5";
      overUnderConfidence = calculateConfidence(
        [shotsOnTargetFactor, dangerousAttacksFactor, momentumIntensity],
        [0.5, 0.3, 0.2]
      );
    } else if (totalGoals < 2 && goalsProjection > 2) {
      overUnderValue = "Over 1.5";
      overUnderConfidence = calculateConfidence(
        [shotsOnTargetFactor, dangerousAttacksFactor],
        [0.6, 0.4]
      );
    } else if (totalGoals < 2 && goalsProjection < 1.5) {
      overUnderValue = "Under 2.5";
      overUnderConfidence = calculateConfidence([1 - shotsOnTargetFactor]);
    }

    if (overUnderValue) {
      predictions.push({
        id: "over_under",
        label: overUnderValue,
        status: "ACTIVE",
        value: "Likely",
        confidence: overUnderConfidence,
        insight: `${stats.homeShotsOnTarget + stats.awayShotsOnTarget} SOT, ${goalsProjection.toFixed(1)} expected`,
        createdAtMinute: minute,
      });
    }
  } else if (markets.over25Won) {
    predictions.push({
      id: "over_25",
      label: "Over 2.5 Goals",
      status: "WON",
      value: "Yes ✅",
      confidence: "Very High",
      insight: `Match reached 3+ goals (${score.home + score.away} total)`,
      createdAtMinute: 0,
      resolvedAtMinute: minute,
    });
  }

  if (!markets.matchResultResolved) {
    const homeGoals = score.home;
    const awayGoals = score.away;
    const goalDiff = homeGoals - awayGoals;

    // Score dominance (VERY HIGH WEIGHT)
    const scoreSignal = goalDiff > 0 ? 1 : goalDiff < 0 ? 0 : 0.5;

    // Shots on target (HIGH WEIGHT)
    const totalSOT = stats.homeShotsOnTarget + stats.awayShotsOnTarget || 1;
    const sotSignal = stats.homeShotsOnTarget / totalSOT;

    // Momentum (MEDIUM WEIGHT)
    const momentumSignal = (momentum + 100) / 200; // Normalize to 0-1

    // Possession (LOW WEIGHT)
    const possessionSignal = stats.homePossession / 100;

    // Calculate weighted score
    const homeWinScore =
      scoreSignal * 0.4 +
      sotSignal * 0.35 +
      momentumSignal * 0.15 +
      possessionSignal * 0.1;

    let resultLean = "Draw";
    let resultConfidence: ConfidenceLevel = "Low";

    if (homeWinScore > 0.62) {
      resultLean = "Home Win";
      resultConfidence = calculateConfidence(
        [scoreSignal, sotSignal, momentumSignal, possessionSignal],
        [0.4, 0.35, 0.15, 0.1]
      );
    } else if (homeWinScore < 0.38) {
      resultLean = "Away Win";
      resultConfidence = calculateConfidence(
        [1 - scoreSignal, 1 - sotSignal, 1 - momentumSignal, 1 - possessionSignal],
        [0.4, 0.35, 0.15, 0.1]
      );
    } else {
      resultLean = "Draw";
      resultConfidence = Math.abs(homeWinScore - 0.5) < 0.15 ? "High" : "Medium";
    }

    const resultInsight =
      goalDiff !== 0
        ? `${goalDiff > 0 ? homeTeam : awayTeam} leading ${Math.abs(goalDiff)}-0`
        : `Balanced: ${stats.homeShotsOnTarget}-${stats.awayShotsOnTarget} SOT`;

    predictions.push({
      id: "match_result",
      label: "Match Result",
      status: "ACTIVE",
      value: resultLean,
      confidence: resultConfidence,
      insight: resultInsight,
      createdAtMinute: minute,
    });
  } else if (markets.matchResultWinner) {
    const winner = markets.matchResultWinner === "HOME" ? homeTeam : awayTeam;
    predictions.push({
      id: "match_result",
      label: "Match Result",
      status: "WON",
      value: `${winner} Win ✅`,
      confidence: "Very High",
      insight: `${score.home}-${score.away} in ${minute}'`,
      createdAtMinute: 0,
      resolvedAtMinute: minute,
    });
  }

  if (score.home === score.away && score.home + score.away < 5) {
    const homeNextGoalScore =
      stats.homeShotsOnTarget * 2 +
      stats.homeDangerousAttacks * 1.5 +
      stats.homeCorners * 0.5;
    const awayNextGoalScore =
      stats.awayShotsOnTarget * 2 +
      stats.awayDangerousAttacks * 1.5 +
      stats.awayCorners * 0.5;

    const nextGoalTeam = homeNextGoalScore > awayNextGoalScore ? homeTeam : awayTeam;
    const maxScore = Math.max(homeNextGoalScore, awayNextGoalScore);
    const nextGoalSignal = Math.min(maxScore / 10, 1);

    if (nextGoalSignal > 0.5) {
      predictions.push({
        id: "next_goal",
        label: "Next Goal",
        status: "ACTIVE",
        value: nextGoalTeam,
        confidence: calculateConfidence([nextGoalSignal]),
        insight:
          homeNextGoalScore > awayNextGoalScore
            ? `${homeTeam} more pressure (${stats.homeShotsOnTarget} SOT)`
            : `${awayTeam} more pressure (${stats.awayShotsOnTarget} SOT)`,
        createdAtMinute: minute,
      });
    }
  }

  const momentumLabel = calculateMomentumLabel(momentum);
  const momentumTeam = momentum > 0 ? homeTeam : momentum < 0 ? awayTeam : "Neither";

  predictions.push({
    id: "momentum",
    label: "Momentum",
    status: "ACTIVE",
    value: `${momentumTeam} (${momentumLabel})`,
    confidence: calculateConfidence([Math.min(Math.abs(momentum) / 100, 1)]),
    insight:
      momentum > 0
        ? `${homeTeam} dominant`
        : momentum < 0
          ? `${awayTeam} dominant`
          : "Even match",
    createdAtMinute: minute,
  });

  return predictions;
}

function getStatusColor(
  status: PredictionStatus,
  confidence: ConfidenceLevel
): string {
  if (status === "WON") return "bg-green-50 border-green-300 text-green-900";
  if (status === "LOST") return "bg-red-50 border-red-200 text-red-700";

  switch (confidence) {
    case "Very High":
      return "bg-emerald-50 border-emerald-200 text-emerald-900";
    case "High":
      return "bg-green-50 border-green-200 text-green-800";
    case "Medium":
      return "bg-amber-50 border-amber-200 text-amber-800";
    case "Low":
      return "bg-gray-50 border-gray-200 text-gray-600";
  }
}

export default function Predictions({
  stats,
  score,
  momentum,
  homeTeam,
  awayTeam,
  minute,
}: PredictionsProps) {
  const predictions = generatePredictions(stats, score, momentum, homeTeam, awayTeam, minute);

  // Separate active vs resolved
  const activePredictions = predictions.filter((p) => p.status === "ACTIVE");
  const pinnedHits = predictions.filter((p) => p.status === "WON");

  // Check if stats are available
  const hasStats = stats && (
    stats.homePossession > 0 ||
    stats.homeShots > 0 ||
    stats.homeCorners > 0 ||
    stats.homeFouls > 0
  );

  if (!hasStats) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-600 uppercase tracking-widest mb-4">
          Predictions
        </h3>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-400 text-sm font-medium text-center">
            Predictions unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-6">
        Predictions
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {/* Pinned Hits First */}
        {pinnedHits.map((pred: Prediction) => (
          <div
            key={pred.id}
            className={`flex-shrink-0 w-80 rounded-lg border p-5 ${getStatusColor(pred.status, pred.confidence)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-700">
                {pred.label}
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white bg-opacity-70">
                {pred.confidence}
              </span>
            </div>
            <div className="mb-3">
              <span className="text-xl font-bold">{(pred as ResolvedPrediction).value}</span>
            </div>
            <span className="text-sm opacity-70 leading-relaxed">{pred.insight}</span>
          </div>
        ))}

        {/* Then Active Predictions */}
        {activePredictions.slice(0, 5).map((pred: Prediction) => (
          <div
            key={pred.id}
            className={`flex-shrink-0 w-80 rounded-lg border p-5 ${getStatusColor(pred.status, pred.confidence)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-700">
                {pred.label}
              </span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white bg-opacity-70">
                {pred.confidence}
              </span>
            </div>
            <div className="mb-3">
              <span className="text-xl font-bold">{(pred as ActivePrediction).value}</span>
            </div>
            <span className="text-sm opacity-70 leading-relaxed">{pred.insight}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 font-medium">
        <span>{minute > 0 ? `${minute}'` : "Pre-match"}</span>
        <span className="mx-2">•</span>
        <span>{activePredictions.length} active</span>
        {pinnedHits.length > 0 && (
          <>
            <span className="mx-2">•</span>
            <span>{pinnedHits.length} hit</span>
          </>
        )}
      </div>
    </div>
  );
}
