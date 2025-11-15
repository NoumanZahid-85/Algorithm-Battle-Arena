import { Mode } from '@/types/grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, RotateCcw, MapPin, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MazeDifficulty } from '@/utils/mazeGenerator';

interface ControlsProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onRunAStar: () => void;
  onRunBFS: () => void;
  onRunDFS: () => void;
  onRunDijkstra: () => void;
  onClearGrid: () => void;
  isRunning: boolean;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  mazeDifficulty: MazeDifficulty;
  onMazeDifficultyChange: (difficulty: MazeDifficulty) => void;
}

const Controls = ({
  mode,
  onModeChange,
  onRunAStar,
  onRunBFS,
  onRunDFS,
  onRunDijkstra,
  onClearGrid,
  isRunning,
  gridSize,
  onGridSizeChange,
  mazeDifficulty,
  onMazeDifficultyChange,
}: ControlsProps) => {
  const modes: { value: Mode; label: string; icon: React.ReactNode }[] = [
    { value: 'start', label: 'Set Start', icon: <MapPin className="w-4 h-4" /> },
    { value: 'target', label: 'Set Target', icon: <Target className="w-4 h-4" /> },
  ];

  return (
    <Card className="w-full gaming-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800">🎮 Battle Controls</CardTitle>
        <CardDescription className="text-gray-600">Set start and target, then maze will be generated automatically</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid Size Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            🏟️ Arena Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[15, 20, 25].map((size) => (
              <Button
                key={size}
                variant={gridSize === size ? 'default' : 'outline'}
                onClick={() => onGridSizeChange(size)}
                disabled={isRunning}
                className="interactive-button mobile-button flex items-center justify-center gap-2 font-bold text-sm md:text-base"
              >
                {size}×{size}
              </Button>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            🎯 Battle Setup
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {modes.map(({ value, label, icon }) => (
              <Button
                key={value}
                variant={mode === value ? 'default' : 'outline'}
                onClick={() => onModeChange(value)}
                disabled={isRunning}
                className="interactive-button mobile-button flex items-center justify-center gap-2 font-bold text-sm md:text-base"
              >
                {icon}
                <span className="text-xs sm:text-sm">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Maze Difficulty Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            🎲 Maze Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as MazeDifficulty[]).map((difficulty) => (
              <Button
                key={difficulty}
                variant={mazeDifficulty === difficulty ? 'default' : 'outline'}
                onClick={() => onMazeDifficultyChange(difficulty)}
                disabled={isRunning}
                className="interactive-button mobile-button flex items-center justify-center gap-2 font-bold text-sm md:text-base capitalize"
              >
                {difficulty}
              </Button>
            ))}
          </div>
        </div>

        {/* Algorithm Buttons */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            ⚔️ Choose Your Champion
          </label>
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={onRunAStar}
              disabled={isRunning}
              className="interactive-button mobile-button flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-sm md:text-base py-3"
            >
              <Play className="w-4 h-4" />
              ⭐ A* (Smart Warrior)
            </Button>
            <Button
              onClick={onRunBFS}
              disabled={isRunning}
              className="interactive-button mobile-button flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold text-sm md:text-base py-3"
            >
              <Play className="w-4 h-4" />
              🌊 BFS (Wave Rider)
            </Button>
            <Button
              onClick={onRunDFS}
              disabled={isRunning}
              className="interactive-button mobile-button flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-sm md:text-base py-3"
            >
              <Play className="w-4 h-4" />
              🔥 DFS (Deep Explorer)
            </Button>
            <Button
              onClick={onRunDijkstra}
              disabled={isRunning}
              className="interactive-button mobile-button flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-sm md:text-base py-3"
            >
              <Play className="w-4 h-4" />
              ⚡ Dijkstra (Path Master)
            </Button>
          </div>
        </div>

        {/* Clear Button */}
        <Button
          onClick={onClearGrid}
          variant="outline"
          disabled={isRunning}
          className="interactive-button mobile-button flex items-center justify-center gap-2 w-full font-bold border-2 border-red-300 hover:bg-red-50 text-sm md:text-base py-3"
        >
          <RotateCcw className="w-4 h-4" />
          🗑️ Reset Arena
        </Button>


        {/* Legend */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Legend:</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[hsl(var(--cell-start))] border border-border rounded" />
              <span>Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[hsl(var(--cell-target))] border border-border rounded" />
              <span>Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[hsl(var(--cell-wall))] border border-border rounded" />
              <span>Wall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[hsl(var(--cell-visited))] border border-border rounded" />
              <span>Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[hsl(var(--cell-path))] border border-border rounded" />
              <span>Path</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Controls;
