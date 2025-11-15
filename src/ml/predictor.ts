import { MazeFeatures, PredictionResult, ModelWeights } from './types';
import modelWeights from './modelWeights.json';
import { generateReason } from './reasonGenerator';

/**
 * Predict the best algorithm for a given maze
 */
export const predictWinner = (features: MazeFeatures): PredictionResult => {
  const weights = modelWeights as ModelWeights;

  // Feature array in order: [wallDensity, deadEnds, branchingFactor, pathComplexity, mazeSize, distance, openRatio]
  const featureArray = [
    features.wallDensity,
    features.deadEnds,
    features.branchingFactor,
    features.pathComplexity,
    features.mazeSize,
    features.distance,
    features.openRatio,
  ];

  // Calculate score for each algorithm using dot product with bias
  const calculateScore = (algorithmWeights: number[], bias: number): number => {
    let score = bias; // Start with bias term
    for (let i = 0; i < featureArray.length; i++) {
      score += algorithmWeights[i] * featureArray[i];
    }
    return score;
  };

  // Bias terms to balance algorithms - A* should win by default
  // A* and Dijkstra are generally better in most mazes, so they get very strong positive bias
  // BFS and DFS get very strong negative bias (need extremely strong evidence to win)
  const biases = {
    aStar: 0.50,      // Very strong positive - A* is default winner
    bfs: -0.40,       // Very strong negative - BFS needs extremely strong evidence
    dfs: -0.45,       // Very strong negative - DFS needs strongest evidence
    dijkstra: 0.35,   // Strong positive - similar to A*, generally good
  };

  const scores = {
    aStar: calculateScore(weights.aStar, biases.aStar),
    bfs: calculateScore(weights.bfs, biases.bfs),
    dfs: calculateScore(weights.dfs, biases.dfs),
    dijkstra: calculateScore(weights.dijkstra, biases.dijkstra),
  };

  // Find winner (highest score)
  const winner = Object.entries(scores).reduce((a, b) => 
    scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b
  )[0] as 'aStar' | 'bfs' | 'dfs' | 'dijkstra';

  // Calculate confidence
  const sortedScores = Object.values(scores).sort((a, b) => b - a);
  const winnerScore = sortedScores[0];
  const secondScore = sortedScores[1];
  const minScore = Math.min(...Object.values(scores));
  const maxScore = Math.max(...Object.values(scores));
  const scoreRange = maxScore - minScore;
  
  // Confidence based on score gap and range
  let confidence = 0;
  if (scoreRange > 0) {
    const scoreGap = winnerScore - secondScore;
    // Normalize gap relative to range
    const normalizedGap = scoreGap / scoreRange;
    // Convert to confidence percentage (60-95% range, never 100%)
    confidence = Math.min(95, Math.max(60, 60 + (normalizedGap * 35)));
  } else {
    confidence = 50; // All scores equal
  }

  // Round confidence
  confidence = Math.round(confidence);

  // Generate reason
  const reason = generateReason(features, winner, scores);

  return {
    winner,
    confidence,
    reason,
    scores,
  };
};

