import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell } from '@/types/grid';
import { extractMazeFeatures } from '@/ml/featureExtractor';
import { predictWinner } from '@/ml/predictor';
import { PredictionResult } from '@/ml/types';

interface AutoSelectorProps {
  grid: Cell[][];
  start: { row: number; col: number } | null;
  target: { row: number; col: number } | null;
  gridSize: number;
  onPredict?: (winner: 'aStar' | 'bfs' | 'dfs' | 'dijkstra') => void;
}

const AutoSelector = ({ grid, start, target, gridSize, onPredict }: AutoSelectorProps) => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Auto-predict when maze is ready
  useEffect(() => {
    if (start && target && grid.length > 0) {
      setIsCalculating(true);
      
      // Small delay to ensure grid is fully rendered
      const timer = setTimeout(() => {
        try {
          const features = extractMazeFeatures(grid, start, target, gridSize);
          const result = predictWinner(features);
          setPrediction(result);
          
          // Optional callback
          if (onPredict) {
            onPredict(result.winner);
          }
        } catch (error) {
          console.error('Prediction error:', error);
        } finally {
          setIsCalculating(false);
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setPrediction(null);
    }
  }, [grid, start, target, gridSize, onPredict]);

  if (!start || !target) {
    return null;
  }

  const getWinnerDisplayName = (winner: string): string => {
    const names: Record<string, string> = {
      aStar: 'A* (A-Star)',
      bfs: 'BFS (Breadth-First)',
      dfs: 'DFS (Depth-First)',
      dijkstra: 'Dijkstra',
    };
    return names[winner] || winner;
  };

  const getWinnerIcon = (winner: string): string => {
    const icons: Record<string, string> = {
      aStar: '⭐',
      bfs: '🌊',
      dfs: '🔥',
      dijkstra: '⚡',
    };
    return icons[winner] || '🎯';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 65) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <Card className="w-full gaming-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl md:text-2xl font-bold text-gray-800">
          🧠 ML Auto-Selector
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm md:text-base">
          AI predicts the best algorithm for this maze
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isCalculating ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Analyzing maze...</span>
          </div>
        ) : prediction ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{getWinnerIcon(prediction.winner)}</span>
                <div>
                  <div className="text-sm text-gray-600 font-medium">Predicted Winner</div>
                  <div className="text-lg font-bold text-gray-800">
                    {getWinnerDisplayName(prediction.winner)}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 font-medium">Confidence</span>
                  <span className={`text-lg font-bold ${getConfidenceColor(prediction.confidence)}`}>
                    {prediction.confidence}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      prediction.confidence >= 80
                        ? 'bg-green-500'
                        : prediction.confidence >= 65
                        ? 'bg-yellow-500'
                        : 'bg-orange-500'
                    }`}
                    style={{ width: `${prediction.confidence}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-purple-200">
                <div className="text-sm text-gray-600 font-medium mb-1">Reason</div>
                <div className="text-sm text-gray-700 italic">"{prediction.reason}"</div>
              </div>
            </div>

            {/* Optional: Show all scores for debugging */}
            {process.env.NODE_ENV === 'development' && (
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer">Debug: All Scores</summary>
                <div className="mt-2 space-y-1">
                  <div>A*: {prediction.scores.aStar.toFixed(3)}</div>
                  <div>BFS: {prediction.scores.bfs.toFixed(3)}</div>
                  <div>DFS: {prediction.scores.dfs.toFixed(3)}</div>
                  <div>Dijkstra: {prediction.scores.dijkstra.toFixed(3)}</div>
                </div>
              </details>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            Set start and target to get prediction
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoSelector;

