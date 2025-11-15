import { Cell } from '@/types/grid';
import { MazeFeatures } from './types';

/**
 * Extract 7 key features from a maze grid
 */
export const extractMazeFeatures = (
  grid: Cell[][],
  startPos: { row: number; col: number },
  targetPos: { row: number; col: number },
  gridSize: number
): MazeFeatures => {
  const rows = grid.length;
  const cols = grid[0].length;
  const totalCells = rows * cols;

  // Helper to check if cell is open (not a wall)
  const isOpen = (row: number, col: number): boolean => {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
    return grid[row][col].type !== 'wall';
  };

  // Helper to get open neighbors count
  const getOpenNeighbors = (row: number, col: number): number => {
    let count = 0;
    const directions = [
      [-1, 0], // up
      [1, 0],  // down
      [0, -1], // left
      [0, 1],  // right
    ];

    for (const [dr, dc] of directions) {
      if (isOpen(row + dr, col + dc)) count++;
    }
    return count;
  };

  // 1. Wall Density
  let wallCount = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col].type === 'wall') wallCount++;
    }
  }
  const wallDensity = wallCount / totalCells;

  // 2. Dead Ends (cells with exactly 1 open neighbor)
  let deadEnds = 0;
  let totalOpenNeighbors = 0;
  let openCellCount = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (grid[row][col].type !== 'wall') {
        const neighbors = getOpenNeighbors(row, col);
        totalOpenNeighbors += neighbors;
        openCellCount++;
        
        if (neighbors === 1) {
          deadEnds++;
        }
      }
    }
  }

  // 3. Branching Factor (average open neighbors per open cell)
  const branchingFactor = openCellCount > 0 ? totalOpenNeighbors / openCellCount : 0;

  // 4. Path Complexity (estimated path length / straight-line distance)
  const manhattanDistance = 
    Math.abs(startPos.row - targetPos.row) + Math.abs(startPos.col - targetPos.col);
  
  // Estimate path length using BFS-like exploration
  const estimatedPathLength = estimatePathLength(grid, startPos, targetPos, rows, cols);
  const pathComplexity = manhattanDistance > 0 
    ? estimatedPathLength / manhattanDistance 
    : 1.0;

  // 5. Maze Size (normalized: 15=0.5, 20=0.67, 25=1.0)
  const mazeSize = (gridSize - 15) / 10; // Normalize to 0-1 range

  // 6. Start-Target Distance (normalized)
  const maxDistance = (rows - 1) + (cols - 1);
  const distance = maxDistance > 0 ? manhattanDistance / maxDistance : 0;

  // 7. Open Area Ratio
  const openRatio = openCellCount / totalCells;

  return {
    wallDensity,
    deadEnds: deadEnds / totalCells, // Normalize dead ends
    branchingFactor: branchingFactor / 4, // Normalize (max 4 neighbors)
    pathComplexity: Math.min(pathComplexity, 3.0) / 3.0, // Cap and normalize
    mazeSize: Math.min(mazeSize, 1.0), // Cap at 1.0
    distance,
    openRatio,
  };
};

/**
 * Estimate path length using simple BFS exploration
 */
const estimatePathLength = (
  grid: Cell[][],
  startPos: { row: number; col: number },
  targetPos: { row: number; col: number },
  rows: number,
  cols: number
): number => {
  const queue: { row: number; col: number; dist: number }[] = [];
  const visited = new Set<string>();
  
  queue.push({ row: startPos.row, col: startPos.col, dist: 0 });
  visited.add(`${startPos.row},${startPos.col}`);

  const directions = [
    [-1, 0], // up
    [1, 0],  // down
    [0, -1], // left
    [0, 1],  // right
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.row === targetPos.row && current.col === targetPos.col) {
      return current.dist;
    }

    for (const [dr, dc] of directions) {
      const newRow = current.row + dr;
      const newCol = current.col + dc;

      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        grid[newRow][newCol].type !== 'wall' &&
        !visited.has(`${newRow},${newCol}`)
      ) {
        visited.add(`${newRow},${newCol}`);
        queue.push({ row: newRow, col: newCol, dist: current.dist + 1 });
      }
    }
  }

  // If no path found, return a large estimate
  return Math.abs(startPos.row - targetPos.row) + Math.abs(startPos.col - targetPos.col) * 2;
};

