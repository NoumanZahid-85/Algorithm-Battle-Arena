import { MazeFeatures } from './types';
import { Cell } from '@/types/grid';

/**
 * Data collection utility for ML model training
 * Logs algorithm performance to help improve predictions
 */

export interface AlgorithmPerformance {
  pathLength: number;
  visitedCount: number;
}

export interface CollectedData {
  features: MazeFeatures;
  results: {
    aStar: AlgorithmPerformance;
    bfs: AlgorithmPerformance;
    dfs: AlgorithmPerformance;
    dijkstra: AlgorithmPerformance;
  };
  actualWinner: 'aStar' | 'bfs' | 'dfs' | 'dijkstra';
  mazeDifficulty: 'easy' | 'medium' | 'hard';
  gridSize: number;
  timestamp: number;
}

/**
 * Determine actual winner based on results
 * Priority: 1) Path length (lower is better), 2) Nodes visited (lower is better)
 */
export const determineWinner = (
  results: CollectedData['results']
): 'aStar' | 'bfs' | 'dfs' | 'dijkstra' => {
  const algorithms = [
    { name: 'aStar' as const, result: results.aStar },
    { name: 'bfs' as const, result: results.bfs },
    { name: 'dfs' as const, result: results.dfs },
    { name: 'dijkstra' as const, result: results.dijkstra },
  ];

  // Sort by path length first, then by nodes visited
  const sorted = algorithms.sort((a, b) => {
    if (a.result.pathLength !== b.result.pathLength) {
      return a.result.pathLength - b.result.pathLength;
    }
    return a.result.visitedCount - b.result.visitedCount;
  });

  return sorted[0].name;
};

/**
 * Collect and store training data
 */
export const collectData = (
  features: MazeFeatures,
  results: CollectedData['results'],
  mazeDifficulty: 'easy' | 'medium' | 'hard',
  gridSize: number
): CollectedData => {
  const actualWinner = determineWinner(results);

  const data: CollectedData = {
    features,
    results,
    actualWinner,
    mazeDifficulty,
    gridSize,
    timestamp: Date.now(),
  };

  // Store in localStorage for now (can be exported later)
  const existingData = localStorage.getItem('ml_training_data');
  const dataArray: CollectedData[] = existingData ? JSON.parse(existingData) : [];
  dataArray.push(data);
  localStorage.setItem('ml_training_data', JSON.stringify(dataArray));

  console.log('📊 Data collected:', {
    winner: actualWinner,
    totalSamples: dataArray.length,
  });

  return data;
};

/**
 * Export collected data as JSON
 */
export const exportTrainingData = (): string => {
  const data = localStorage.getItem('ml_training_data');
  if (!data) {
    return JSON.stringify([], null, 2);
  }
  return data;
};

/**
 * Clear collected data
 */
export const clearTrainingData = (): void => {
  localStorage.removeItem('ml_training_data');
  console.log('🗑️ Training data cleared');
};

/**
 * Get data statistics
 */
export const getDataStats = (): {
  totalSamples: number;
  winners: Record<string, number>;
  byDifficulty: Record<string, number>;
} => {
  const data = localStorage.getItem('ml_training_data');
  if (!data) {
    return { totalSamples: 0, winners: {}, byDifficulty: {} };
  }

  const dataArray: CollectedData[] = JSON.parse(data);
  const winners: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};

  dataArray.forEach((sample) => {
    winners[sample.actualWinner] = (winners[sample.actualWinner] || 0) + 1;
    byDifficulty[sample.mazeDifficulty] = (byDifficulty[sample.mazeDifficulty] || 0) + 1;
  });

  return {
    totalSamples: dataArray.length,
    winners,
    byDifficulty,
  };
};

