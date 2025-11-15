import { useState, useCallback, useEffect, useRef } from 'react';
import MapGrid from '@/components/MapGrid';
import Controls from '@/components/Controls';
import AlgorithmResults from '@/components/AlgorithmResults';
import AutoSelector from '@/components/AutoSelector';
import { Cell, Mode, GridState } from '@/types/grid';
import { findPath, findPathBFS, findPathDFS, findPathDijkstra } from '@/utils/pathfinding';
import { generateMaze, MazeDifficulty } from '@/utils/mazeGenerator';
import { extractMazeFeatures } from '@/ml/featureExtractor';
import { collectData } from '@/ml/dataCollector';
import { useToast } from '@/hooks/use-toast';

const GRID_SIZES = [15, 20, 25] as const;
type GridSize = typeof GRID_SIZES[number];

// Initialize grid with default cells
const createEmptyGrid = (size: number): Cell[][] => {
  const grid: Cell[][] = [];
  for (let row = 0; row < size; row++) {
    grid[row] = [];
    for (let col = 0; col < size; col++) {
      grid[row][col] = {
        row,
        col,
        type: 'default',
        f: Infinity,
        g: Infinity,
        h: 0,
        parent: null,
      };
    }
  }
  return grid;
};

const Index = () => {
  const [gridSize, setGridSize] = useState<GridSize>(20);
  const [gridState, setGridState] = useState<GridState>({
    grid: createEmptyGrid(20),
    start: null,
    target: null,
    isRunning: false,
    isComplete: false,
  });
  const [mode, setMode] = useState<Mode>('start');
  const [mazeDifficulty, setMazeDifficulty] = useState<MazeDifficulty>('medium');
  const [algorithmResults, setAlgorithmResults] = useState({
    aStar: { pathLength: 0, visitedCount: 0, hasRun: false },
    bfs: { pathLength: 0, visitedCount: 0, hasRun: false },
    dfs: { pathLength: 0, visitedCount: 0, hasRun: false },
    dijkstra: { pathLength: 0, visitedCount: 0, hasRun: false },
  });
  const { toast } = useToast();

  const clearAlgorithmResults = useCallback(() => {
    setAlgorithmResults({
      aStar: { pathLength: 0, visitedCount: 0, hasRun: false },
      bfs: { pathLength: 0, visitedCount: 0, hasRun: false },
      dfs: { pathLength: 0, visitedCount: 0, hasRun: false },
      dijkstra: { pathLength: 0, visitedCount: 0, hasRun: false },
    });
  }, []);

  const handleGridSizeChange = useCallback((newSize: GridSize) => {
    setGridSize(newSize);
    setGridState({
      grid: createEmptyGrid(newSize),
      start: null,
      target: null,
      isRunning: false,
      isComplete: false,
    });
    clearAlgorithmResults();
  }, [clearAlgorithmResults]);

  // Track previous difficulty and gridSize to regenerate maze when they change
  const prevDifficultyRef = useRef(mazeDifficulty);
  const prevGridSizeRef = useRef(gridSize);

  // Generate maze when difficulty or gridSize changes and both start and target are set
  useEffect(() => {
    const difficultyChanged = prevDifficultyRef.current !== mazeDifficulty;
    const gridSizeChanged = prevGridSizeRef.current !== gridSize;
    
    if ((difficultyChanged || gridSizeChanged) && gridState.start && gridState.target && !gridState.isRunning) {
      const baseGrid = createEmptyGrid(gridSize);
      const newGrid = generateMaze(
        baseGrid,
        gridState.start,
        gridState.target,
        mazeDifficulty,
        gridSize
      );
      setGridState((prev) => ({
        ...prev,
        grid: newGrid,
        isComplete: false,
      }));
      clearAlgorithmResults();
    }
    
    prevDifficultyRef.current = mazeDifficulty;
    prevGridSizeRef.current = gridSize;
  }, [mazeDifficulty, gridSize, gridState.start, gridState.target, gridState.isRunning, clearAlgorithmResults]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (gridState.isRunning || gridState.isComplete) return;

      // Clear algorithm results when grid changes
      clearAlgorithmResults();

      setGridState((prev) => {
        const newGrid = prev.grid.map((r) => r.map((c) => ({ ...c })));
        const cell = newGrid[row][col];

        // Clear previous states if setting start/target
        if (mode === 'start') {
          if (prev.start) {
            newGrid[prev.start.row][prev.start.col].type = 'default';
          }
          cell.type = 'start';
          const newStart = { row, col };
          // Generate maze if target is already set
          let finalGrid = newGrid;
          if (prev.target) {
            finalGrid = generateMaze(newGrid, newStart, prev.target, mazeDifficulty, gridSize);
          }
          return { ...prev, grid: finalGrid, start: newStart };
        } else if (mode === 'target') {
          if (prev.target) {
            newGrid[prev.target.row][prev.target.col].type = 'default';
          }
          cell.type = 'target';
          const newTarget = { row, col };
          // Generate maze if start is already set
          let finalGrid = newGrid;
          if (prev.start) {
            finalGrid = generateMaze(newGrid, prev.start, newTarget, mazeDifficulty, gridSize);
          }
          return { ...prev, grid: finalGrid, target: newTarget };
        }

        return prev;
      });
    },
    [mode, gridState.isRunning, gridState.isComplete, clearAlgorithmResults, mazeDifficulty, gridSize]
  );

  const runAlgorithm = useCallback(async (algorithm: 'aStar' | 'bfs' | 'dfs' | 'dijkstra') => {
    if (!gridState.start || !gridState.target) {
      toast({
        title: 'Error',
        description: 'Please set both start and target points',
        variant: 'destructive',
      });
      return;
    }

    setGridState((prev) => ({ ...prev, isRunning: true }));

    // Clear previous path and visited cells but keep start, target, and walls
    const clearedGrid = gridState.grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        type: cell.type === 'visited' || cell.type === 'path' ? 'default' : cell.type,
      }))
    );

    // Run selected algorithm
    let result;
    switch (algorithm) {
      case 'aStar':
        result = findPath(clearedGrid, gridState.start, gridState.target);
        break;
      case 'bfs':
        result = findPathBFS(clearedGrid, gridState.start, gridState.target);
        break;
      case 'dfs':
        result = findPathDFS(clearedGrid, gridState.start, gridState.target);
        break;
      case 'dijkstra':
        result = findPathDijkstra(clearedGrid, gridState.start, gridState.target);
        break;
    }

    if (!result.found) {
      toast({
        title: 'No Path Found',
        description: 'There is no path between start and target',
        variant: 'destructive',
      });
      setGridState((prev) => ({ ...prev, isRunning: false }));
      return;
    }

    // Animate visited cells
    for (let i = 0; i < result.visited.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      const visitedCell = result.visited[i];
      
      setGridState((prev) => {
        const newGrid = prev.grid.map((r) => r.map((c) => ({ ...c })));
        if (
          newGrid[visitedCell.row][visitedCell.col].type !== 'start' &&
          newGrid[visitedCell.row][visitedCell.col].type !== 'target'
        ) {
          newGrid[visitedCell.row][visitedCell.col].type = 'visited';
        }
        return { ...prev, grid: newGrid };
      });
    }

    // Animate path
    for (let i = 0; i < result.path.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const pathCell = result.path[i];
      
      setGridState((prev) => {
        const newGrid = prev.grid.map((r) => r.map((c) => ({ ...c })));
        if (
          newGrid[pathCell.row][pathCell.col].type !== 'start' &&
          newGrid[pathCell.row][pathCell.col].type !== 'target'
        ) {
          newGrid[pathCell.row][pathCell.col].type = 'path';
        }
        return { ...prev, grid: newGrid };
      });
    }

    // Update algorithm results
    const newResults = {
      ...algorithmResults,
      [algorithm]: {
        pathLength: result.path.length,
        visitedCount: result.visited.length,
        hasRun: true,
      },
    };
    setAlgorithmResults(newResults);

    // Collect data for ML training when all algorithms have run
    if (
      gridState.start &&
      gridState.target &&
      (newResults.aStar.hasRun || newResults.bfs.hasRun || newResults.dfs.hasRun || newResults.dijkstra.hasRun)
    ) {
      // Check if we have results from all algorithms
      const allRun =
        newResults.aStar.hasRun &&
        newResults.bfs.hasRun &&
        newResults.dfs.hasRun &&
        newResults.dijkstra.hasRun;

      if (allRun) {
        try {
          const features = extractMazeFeatures(
            gridState.grid,
            gridState.start,
            gridState.target,
            gridSize
          );
          collectData(
            features,
            {
              aStar: {
                pathLength: newResults.aStar.pathLength,
                visitedCount: newResults.aStar.visitedCount,
              },
              bfs: {
                pathLength: newResults.bfs.pathLength,
                visitedCount: newResults.bfs.visitedCount,
              },
              dfs: {
                pathLength: newResults.dfs.pathLength,
                visitedCount: newResults.dfs.visitedCount,
              },
              dijkstra: {
                pathLength: newResults.dijkstra.pathLength,
                visitedCount: newResults.dijkstra.visitedCount,
              },
            },
            mazeDifficulty,
            gridSize
          );
        } catch (error) {
          console.error('Data collection error:', error);
        }
      }
    }

    setGridState((prev) => ({ ...prev, isRunning: false, isComplete: true }));

    toast({
      title: 'Path Found!',
      description: `Found path with ${result.path.length} steps using ${algorithm.toUpperCase()}`,
    });
  }, [gridState.grid, gridState.start, gridState.target, toast]);

  const handleRunAStar = useCallback(() => runAlgorithm('aStar'), [runAlgorithm]);
  const handleRunBFS = useCallback(() => runAlgorithm('bfs'), [runAlgorithm]);
  const handleRunDFS = useCallback(() => runAlgorithm('dfs'), [runAlgorithm]);
  const handleRunDijkstra = useCallback(() => runAlgorithm('dijkstra'), [runAlgorithm]);

  const handleClearGrid = useCallback(() => {
    setGridState({
      grid: createEmptyGrid(gridSize),
      start: null,
      target: null,
      isRunning: false,
      isComplete: false,
    });
    clearAlgorithmResults();
    setMode('start');
  }, [clearAlgorithmResults, gridSize]);

  return (
    <div className="min-h-screen py-4 md:py-8 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="battle-arena-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Algorithm Battle Arena
          </h1>
          <div className="text-base md:text-lg text-gray-600 font-medium">
            🏆 Choose Your Algorithm Champion 🏆
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 md:gap-8 items-start justify-items-center">
          {/* Controls */}
          <div className="w-full max-w-md lg:max-w-lg order-2 lg:order-1 space-y-3 md:space-y-4">
            <Controls
              mode={mode}
              onModeChange={setMode}
              onRunAStar={handleRunAStar}
              onRunBFS={handleRunBFS}
              onRunDFS={handleRunDFS}
              onRunDijkstra={handleRunDijkstra}
              onClearGrid={handleClearGrid}
              isRunning={gridState.isRunning}
              gridSize={gridSize}
              onGridSizeChange={handleGridSizeChange}
              mazeDifficulty={mazeDifficulty}
              onMazeDifficultyChange={setMazeDifficulty}
            />
            <AutoSelector
              grid={gridState.grid}
              start={gridState.start}
              target={gridState.target}
              gridSize={gridSize}
            />
            <AlgorithmResults
              aStarResult={algorithmResults.aStar}
              bfsResult={algorithmResults.bfs}
              dfsResult={algorithmResults.dfs}
              dijkstraResult={algorithmResults.dijkstra}
            />
          </div>

          {/* Grid */}
          <div className="order-1 lg:order-2 flex justify-center w-full">
            <div className="mobile-grid">
              <MapGrid
                grid={gridState.grid}
                onCellClick={handleCellClick}
                gridSize={gridSize}
              />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-lg font-bold text-gray-700">
            🎮 Algorithm Battle Arena - Where Champions Compete! 🎮
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Watch A*, BFS, DFS, and Dijkstra algorithms battle for supremacy in pathfinding efficiency
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
