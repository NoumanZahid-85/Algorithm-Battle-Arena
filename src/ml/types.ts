export interface MazeFeatures {
  wallDensity: number;        // Percentage of walls (0-1)
  deadEnds: number;          // Count of dead-end cells
  branchingFactor: number;   // Average open neighbors per cell
  pathComplexity: number;    // Estimated path length / straight distance
  mazeSize: number;          // Normalized grid size (0-1)
  distance: number;          // Normalized start-target distance (0-1)
  openRatio: number;         // Percentage of open cells (0-1)
}

export interface PredictionResult {
  winner: 'aStar' | 'bfs' | 'dfs' | 'dijkstra';
  confidence: number;         // 0-100
  reason: string;
  scores: {
    aStar: number;
    bfs: number;
    dfs: number;
    dijkstra: number;
  };
}

export interface ModelWeights {
  aStar: number[];
  bfs: number[];
  dfs: number[];
  dijkstra: number[];
}

