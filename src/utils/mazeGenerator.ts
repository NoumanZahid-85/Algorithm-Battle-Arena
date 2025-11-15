import { Cell } from '@/types/grid';

export type MazeDifficulty = 'easy' | 'medium' | 'hard';

// Get difficulty-based wall density
const getWallDensity = (difficulty: MazeDifficulty): number => {
  switch (difficulty) {
    case 'easy':
      return 0.20; // 20% walls - more open paths
    case 'medium':
      return 0.30; // 30% walls - balanced
    case 'hard':
      return 0.40; // 40% walls - more constrained
    default:
      return 0.30;
  }
};

// Find a guaranteed path from start to target using A* approach
const findGuaranteedPath = (
  startPos: { row: number; col: number },
  targetPos: { row: number; col: number },
  rows: number,
  cols: number
): Set<string> => {
  const pathCells = new Set<string>();
  const queue: { row: number; col: number; path: { row: number; col: number }[] }[] = [];
  const visited = new Set<string>();
  
  queue.push({ row: startPos.row, col: startPos.col, path: [{ row: startPos.row, col: startPos.col }] });
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
      // Found target, mark all cells in path
      for (const cell of current.path) {
        pathCells.add(`${cell.row},${cell.col}`);
      }
      break;
    }
    
    // Get neighbors, prioritizing those closer to target
    const neighbors = directions
      .map(([dr, dc]) => ({
        row: current.row + dr,
        col: current.col + dc,
        dist: Math.abs(current.row + dr - targetPos.row) + Math.abs(current.col + dc - targetPos.col),
      }))
      .filter(
        (n) =>
          n.row >= 0 &&
          n.row < rows &&
          n.col >= 0 &&
          n.col < cols &&
          !visited.has(`${n.row},${n.col}`)
      )
      .sort((a, b) => a.dist - b.dist); // Sort by distance to target
    
    for (const neighbor of neighbors) {
      const key = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(key)) {
        visited.add(key);
        queue.push({
          row: neighbor.row,
          col: neighbor.col,
          path: [...current.path, { row: neighbor.row, col: neighbor.col }],
        });
      }
    }
  }
  
  return pathCells;
};

// Recursive Backtracking Maze Generation Algorithm
export const generateMaze = (
  grid: Cell[][],
  startPos: { row: number; col: number },
  targetPos: { row: number; col: number },
  difficulty: MazeDifficulty,
  gridSize: number
): Cell[][] => {
  // Create a new grid copy, initially all empty
  const newGrid = grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      type: 'default' as const,
    }))
  );

  const rows = gridSize;
  const cols = gridSize;
  
  // STEP 1: Create a GUARANTEED path from start to target
  // This path will NEVER be blocked by walls
  const guaranteedPath = findGuaranteedPath(startPos, targetPos, rows, cols);
  
  // Mark guaranteed path cells as visited (they will remain open)
  const visited: boolean[][] = [];
  for (let row = 0; row < rows; row++) {
    visited[row] = [];
    for (let col = 0; col < cols; col++) {
      visited[row][col] = guaranteedPath.has(`${row},${col}`);
    }
  }

  // STEP 2: Use Recursive Backtracking to create additional paths
  const stack: { row: number; col: number }[] = [];
  
  // Start from start position
  const startCell = { row: startPos.row, col: startPos.col };
  stack.push(startCell);

  const getUnvisitedNeighbors = (row: number, col: number): { row: number; col: number }[] => {
    const neighbors: { row: number; col: number }[] = [];
    const directions = [
      [-1, 0], // up
      [1, 0],  // down
      [0, -1], // left
      [0, 1],  // right
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        !visited[newRow][newCol]
      ) {
        neighbors.push({ row: newRow, col: newCol });
      }
    }

    return neighbors;
  };

  // Generate additional paths using recursive backtracking
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(current.row, current.col);

    if (neighbors.length > 0) {
      // Randomly choose a neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      visited[next.row][next.col] = true;
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  // STEP 3: Add walls based on difficulty, but NEVER block the guaranteed path
  const wallDensity = getWallDensity(difficulty);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Skip start and target positions
      if (
        (row === startPos.row && col === startPos.col) ||
        (row === targetPos.row && col === targetPos.col)
      ) {
        continue;
      }

      // NEVER add walls to guaranteed path cells
      if (guaranteedPath.has(`${row},${col}`)) {
        continue;
      }

      // Add walls based on difficulty
      // Cells not visited in maze generation are more likely to be walls
      // But we also add some randomness based on difficulty
      if (!visited[row][col] || Math.random() < wallDensity) {
        newGrid[row][col].type = 'wall';
      }
    }
  }

  // Ensure start and target are clear
  newGrid[startPos.row][startPos.col].type = 'start';
  newGrid[targetPos.row][targetPos.col].type = 'target';

  // STEP 4: Safety check - ensure immediate neighbors of start and target are clear
  const clearAroundCell = (row: number, col: number) => {
    const directions = [
      [-1, 0], // up
      [1, 0],  // down
      [0, -1], // left
      [0, 1],  // right
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        (newRow !== startPos.row || newCol !== startPos.col) &&
        (newRow !== targetPos.row || newCol !== targetPos.col)
      ) {
        // Always clear at least one neighbor to ensure connectivity
        // For guaranteed path cells, always clear
        if (guaranteedPath.has(`${newRow},${newCol}`)) {
          newGrid[newRow][newCol].type = 'default';
        } else {
          // For other cells, clear based on difficulty (easier = more cleared)
          const clearProbability = difficulty === 'easy' ? 0.9 : difficulty === 'medium' ? 0.7 : 0.5;
          if (Math.random() < clearProbability) {
            newGrid[newRow][newCol].type = 'default';
          }
        }
      }
    }
  };

  clearAroundCell(startPos.row, startPos.col);
  clearAroundCell(targetPos.row, targetPos.col);

  return newGrid;
};

