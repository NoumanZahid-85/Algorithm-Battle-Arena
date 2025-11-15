import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AlgorithmResult {
  pathLength: number;
  visitedCount: number;
  hasRun: boolean;
}

interface AlgorithmResultsProps {
  aStarResult: AlgorithmResult;
  bfsResult: AlgorithmResult;
  dfsResult: AlgorithmResult;
  dijkstraResult: AlgorithmResult;
}

const AlgorithmResults = ({ aStarResult, bfsResult, dfsResult, dijkstraResult }: AlgorithmResultsProps) => {
  const algorithms = [
    { name: 'A* (A-Star)', result: aStarResult },
    { name: 'BFS (Breadth-First)', result: bfsResult },
    { name: 'DFS (Depth-First)', result: dfsResult },
    { name: 'Dijkstra', result: dijkstraResult },
  ];

  // Check if all algorithms have been run
  const allAlgorithmsRun = aStarResult.hasRun && bfsResult.hasRun && dfsResult.hasRun && dijkstraResult.hasRun;

  // Find the winner (algorithm with best performance: shortest path first, then least nodes visited)
  const getWinner = () => {
    const results = [
      { name: 'A* (A-Star)', result: aStarResult },
      { name: 'BFS (Breadth-First)', result: bfsResult },
      { name: 'DFS (Depth-First)', result: dfsResult },
      { name: 'Dijkstra', result: dijkstraResult },
    ].filter(({ result }) => result.hasRun);

    if (results.length === 0) return null;

    // Sort by path length first (ascending), then by nodes visited (ascending)
    const sortedResults = [...results].sort((a, b) => {
      // Ensure we're comparing numbers
      const pathLengthA = Number(a.result.pathLength) || 0;
      const pathLengthB = Number(b.result.pathLength) || 0;
      const visitedCountA = Number(a.result.visitedCount) || 0;
      const visitedCountB = Number(b.result.visitedCount) || 0;

      // First priority: path length (lower is better)
      if (pathLengthA !== pathLengthB) {
        return pathLengthA - pathLengthB;
      }
      // Second priority: nodes visited (lower is better)
      return visitedCountA - visitedCountB;
    });

    // Winner is the first one after sorting
    return sortedResults[0].name;
  };

  const winner = getWinner();

  return (
    <Card className="w-full gaming-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl md:text-2xl font-bold text-gray-800">🏆 Battle Results</CardTitle>
        <CardDescription className="text-gray-600 text-sm md:text-base">Champion performance comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="font-bold text-gray-800 text-xs md:text-sm">⚔️ Champion</TableHead>
              <TableHead className="text-center font-bold text-gray-800 text-xs md:text-sm">🎯 Path Length</TableHead>
              <TableHead className="text-center font-bold text-gray-800 text-xs md:text-sm">👁️ Nodes Visited</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {algorithms.map(({ name, result }) => {
              const isWinner = winner === name;
              return (
                <TableRow 
                  key={name} 
                  className={isWinner ? "winner-glow bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400" : "hover:bg-gray-50"}
                >
                  <TableCell className="font-bold text-gray-800 text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{name}</span>
                      {isWinner && <span className="text-yellow-600">🏆</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-gray-700 text-xs md:text-sm">
                    {result.hasRun ? `${result.pathLength} steps` : '-'}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-gray-700 text-xs md:text-sm">
                    {result.hasRun ? result.visitedCount : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AlgorithmResults;
