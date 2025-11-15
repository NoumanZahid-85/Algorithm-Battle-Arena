# Algorithm Battle Arena 🏆

An interactive pathfinding visualization application that compares four algorithm champions: **A*** (A-Star), **BFS** (Breadth-First Search), **DFS** (Depth-First Search), and **Dijkstra**. Features automatic maze generation and ML-based algorithm prediction.

## ✨ Key Features

### 🎮 Core Features
- **🏟️ Three Arena Sizes**: 15×15, 20×20, 25×25 battle arenas
- **⚔️ Four Algorithm Champions**: A*, BFS, DFS, and Dijkstra
- **🎲 Automatic Maze Generation**: Recursive Backtracking algorithm with three difficulty levels
- **🧠 ML Auto-Selector**: Machine learning-based algorithm prediction with confidence scores
- **🏆 Performance Comparison**: Real-time results with automatic winner detection
- **📊 Data Collection**: Automatic performance data logging for ML model improvement

### 🎯 Maze Generation
- **Recursive Backtracking Algorithm**: Guarantees solvable mazes
- **Three Difficulty Levels**: Easy (20% walls), Medium (30% walls), Hard (40% walls)
- **Automatic Generation**: Maze generates after setting start and target positions
- **Path Guarantee**: Always ensures a path exists from start to target

### 🤖 Machine Learning Features
- **7 Feature Extraction**: Wall density, dead ends, branching factor, path complexity, maze size, distance, open ratio
- **Real-time Prediction**: Predicts best algorithm before execution
- **Confidence Scoring**: Shows prediction confidence (60-95%)
- **Reason Generation**: Explains why an algorithm is predicted to win
- **Data Collection**: Automatically logs performance data for future training

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 How to Use

1. **🏟️ Choose Arena Size**: Select 15×15, 20×20, or 25×25
2. **🎯 Set Start & Target**: Click "Set Start" and "Set Target" buttons, then click on grid
3. **🎲 Select Difficulty**: Choose Easy, Medium, or Hard maze difficulty
4. **🧠 View Prediction**: ML Auto-Selector shows predicted winner automatically
5. **⚔️ Run Algorithms**: Click algorithm buttons to see them in action
6. **🏆 Compare Results**: View performance metrics and see which algorithm wins

## 🏆 Algorithm Champions

| Champion | Algorithm | Best For |
|----------|-----------|----------|
| **⭐ A* (A-Star)** | Heuristic search (f(n) = g(n) + h(n)) | Dead ends, optimal paths |
| **🌊 BFS (Breadth-First)** | Level-by-level queue exploration | Open mazes, low branching |
| **🔥 DFS (Depth-First)** | Deep stack exploration | High branching, many paths |
| **⚡ Dijkstra** | Shortest path algorithm | Complex mazes, dead ends |

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **ML System**: Custom linear model with feature extraction

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── AutoSelector.tsx    # ML prediction display
│   ├── AlgorithmResults.tsx # Results comparison
│   ├── Controls.tsx         # User controls
│   └── MapGrid.tsx          # Grid visualization
├── ml/                 # Machine learning
│   ├── featureExtractor.ts  # Feature calculation
│   ├── predictor.ts          # ML prediction
│   ├── modelWeights.json     # Algorithm weights
│   └── dataCollector.ts      # Data logging
├── utils/              # Core algorithms
│   ├── pathfinding.ts        # A*, BFS, DFS, Dijkstra
│   └── mazeGenerator.ts      # Recursive backtracking
└── pages/
    └── Index.tsx             # Main application
```

## 🧠 ML Model Details

The ML system uses a linear model with:
- **7 Features**: Extracted from maze structure
- **Predefined Weights**: Based on algorithm characteristics
- **Bias Terms**: Balance algorithm selection
- **Confidence Calculation**: Based on score gaps
- **Auto Data Collection**: Logs results for training

## 📊 Winner Determination

Algorithms are compared using:
1. **Primary**: Path Length (shorter is better)
2. **Secondary**: Nodes Visited (fewer is better)

## 📝 Generating Report

To generate the final project report:

```bash
# Install Python dependencies
pip install -r requirements.txt

# Generate Word document
python generate_report.py
```

This creates `Algorithm_Battle_Arena_Final_Report.docx` with all screenshots and documentation.

## 🎓 Educational Value

This project demonstrates:
- Pathfinding algorithm implementation and visualization
- Maze generation algorithms
- Machine learning for algorithm selection
- React/TypeScript web development
- Performance analysis and comparison

## 📝 License

MIT License - feel free to use this project for learning and development!