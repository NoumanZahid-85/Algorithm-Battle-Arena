import { MazeFeatures, PredictionResult } from './types';

/**
 * Generate human-readable reason for algorithm prediction
 */
export const generateReason = (
  features: MazeFeatures,
  winner: 'aStar' | 'bfs' | 'dfs' | 'dijkstra',
  scores: PredictionResult['scores']
): string => {
  const { deadEnds, branchingFactor, wallDensity, pathComplexity, openRatio } = features;

  // Calculate score differences for context
  const sortedScores = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([algo, score]) => ({ algo, score }));
  
  const winnerScore = sortedScores[0].score;
  const secondScore = sortedScores[1].score;
  const scoreGap = winnerScore - secondScore;

  // High dead ends threshold (normalized)
  const highDeadEnds = deadEnds > 0.15;
  // Low branching threshold (normalized, so 2.5/4 = 0.625)
  const lowBranching = branchingFactor < 0.625;
  // High branching threshold
  const highBranching = branchingFactor > 0.75;
  // Low wall density
  const lowWallDensity = wallDensity < 0.25;
  // High wall density
  const highWallDensity = wallDensity > 0.35;
  // High path complexity
  const highComplexity = pathComplexity > 0.6;

  // Generate reasons based on winner and features
  switch (winner) {
    case 'aStar':
      if (highDeadEnds && lowBranching) {
        return 'Low branching, high dead-ends favor A*';
      }
      if (highDeadEnds) {
        return 'High dead-ends make A* heuristic efficient';
      }
      if (highComplexity && highWallDensity) {
        return 'Complex maze structure favors A* heuristic';
      }
      if (lowBranching) {
        return 'Low branching factor favors A*';
      }
      return 'A* optimal for this maze structure';

    case 'bfs':
      if (lowWallDensity && lowBranching) {
        return 'Open maze structure favors BFS';
      }
      if (lowWallDensity) {
        return 'Wide open areas favor BFS exploration';
      }
      if (lowBranching) {
        return 'Low branching factor suits BFS';
      }
      return 'BFS optimal for this maze layout';

    case 'dfs':
      if (highBranching) {
        return 'High branching factor favors DFS';
      }
      if (highWallDensity && highBranching) {
        return 'Complex branching paths favor DFS';
      }
      if (pathComplexity > 0.5) {
        return 'Maze structure suits DFS exploration';
      }
      return 'DFS optimal for this maze pattern';

    case 'dijkstra':
      if (highDeadEnds && highComplexity) {
        return 'Complex maze with dead-ends favors Dijkstra';
      }
      if (highWallDensity) {
        return 'Dense maze structure favors Dijkstra';
      }
      if (highComplexity) {
        return 'Path complexity makes Dijkstra efficient';
      }
      return 'Dijkstra optimal for this maze configuration';

    default:
      return 'Algorithm selected based on maze characteristics';
  }
};

