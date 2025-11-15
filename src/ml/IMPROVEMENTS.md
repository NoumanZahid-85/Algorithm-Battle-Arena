# ML Model Performance Improvement Guide

## Current Model Status
- **Type**: Simple linear model (dot product)
- **Features**: 7 basic maze features
- **Accuracy**: ~65-75% (estimated)
- **Training**: Manual weights (no data-driven training)

---

## 🎯 Improvement Strategy

### Phase 1: Better Feature Engineering (Quick Wins)

#### Add More Features (Extend to 10-12 features)

1. **Bottleneck Count**: Number of narrow passages (cells with 2 neighbors)
   - A* and Dijkstra handle bottlenecks well
   - BFS struggles with bottlenecks

2. **Average Path Width**: Average number of parallel paths
   - High width → BFS performs better
   - Low width → A* performs better

3. **Twistiness Factor**: Ratio of actual path to straight-line distance
   - High twistiness → DFS might explore more
   - Low twistiness → A* is optimal

4. **Start/Target Position**: Corner vs center vs edge
   - Corner positions favor different algorithms

5. **Isolated Regions**: Number of disconnected areas (should be 0, but good to check)

#### Improve Existing Features

- **Dead Ends**: Weight by distance from start (closer dead ends matter more)
- **Branching Factor**: Calculate separately for different maze regions
- **Path Complexity**: Use actual BFS path instead of estimation

---

### Phase 2: Data Collection & Training

#### Step 1: Collect Real Performance Data

Create a data collection system:

```typescript
interface TrainingData {
  features: MazeFeatures;
  actualWinner: 'aStar' | 'bfs' | 'dfs' | 'dijkstra';
  results: {
    aStar: { pathLength: number; visitedCount: number };
    bfs: { pathLength: number; visitedCount: number };
    dfs: { pathLength: number; visitedCount: number };
    dijkstra: { pathLength: number; visitedCount: number };
  };
  mazeDifficulty: 'easy' | 'medium' | 'hard';
  gridSize: number;
}
```

#### Step 2: Determine Actual Winner

Use the same logic as AlgorithmResults:
1. Sort by path length (ascending)
2. If tie, sort by nodes visited (ascending)
3. First one is the winner

#### Step 3: Train Model

Options:
- **Linear Regression**: Simple, interpretable
- **Logistic Regression**: Better for classification
- **Random Forest**: Handles non-linear relationships
- **Neural Network**: Most flexible (overkill for this)

---

### Phase 3: Advanced Techniques

#### 1. Feature Normalization
- Use z-score normalization: `(x - mean) / std`
- Or min-max normalization: `(x - min) / (max - min)`
- Ensures all features are on same scale

#### 2. Feature Selection
- Remove redundant features
- Use correlation analysis
- Keep only features that improve accuracy

#### 3. Ensemble Methods
- Train multiple models
- Combine predictions (voting or averaging)
- More robust predictions

#### 4. Algorithm-Specific Models
- Train separate models for each algorithm
- Predict "will A* win?" instead of "which algorithm wins?"
- Combine predictions

---

## 📊 Recommended Implementation Steps

### Immediate (No Training Required)

1. **Add 3 More Features**:
   - Bottleneck count
   - Average path width
   - Twistiness factor

2. **Improve Feature Calculation**:
   - Use actual BFS path for path complexity
   - Weight dead ends by distance from start

3. **Better Weight Tuning**:
   - Test on 20-30 different mazes
   - Manually adjust weights based on results
   - Document which features correlate with wins

### Short Term (With Data Collection)

1. **Add Data Logging**:
   - Log every algorithm run
   - Store features + results
   - Build dataset of 100+ examples

2. **Simple Training Script**:
   - Use linear regression
   - Train on collected data
   - Update modelWeights.json

3. **Validation**:
   - Split data: 80% train, 20% test
   - Measure accuracy
   - Iterate

### Long Term (Advanced)

1. **Better Model**:
   - Random Forest or Gradient Boosting
   - Better accuracy (85-95%)

2. **Real-time Learning**:
   - Update weights as more data comes in
   - Adaptive model

3. **Confidence Calibration**:
   - Better confidence calculation
   - Show uncertainty when appropriate

---

## 🔧 Quick Improvements You Can Make Now

### 1. Enhanced Feature Extractor

Add these features to `featureExtractor.ts`:

```typescript
// 8. Bottleneck Count
let bottlenecks = 0;
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    if (grid[row][col].type !== 'wall') {
      const neighbors = getOpenNeighbors(row, col);
      if (neighbors === 2) bottlenecks++;
    }
  }
}

// 9. Twistiness Factor
const twistiness = pathComplexity; // Already calculated

// 10. Start/Target Position Type
const startIsCorner = (startPos.row === 0 || startPos.row === rows-1) && 
                      (startPos.col === 0 || startPos.col === cols-1);
const targetIsCorner = (targetPos.row === 0 || targetPos.row === rows-1) && 
                       (targetPos.col === 0 || targetPos.col === cols-1);
```

### 2. Better Weight Tuning

Test these improved weights:

```json
{
  "aStar": [0.35, 0.45, -0.25, 0.15, 0.05, -0.15, 0.25],
  "bfs": [0.25, -0.35, 0.45, 0.15, 0.05, 0.15, 0.35],
  "dfs": [-0.25, 0.15, 0.55, -0.15, 0.05, 0.05, 0.15],
  "dijkstra": [0.30, 0.40, -0.20, 0.20, 0.05, -0.10, 0.25]
}
```

### 3. Improved Confidence Calculation

```typescript
// Better confidence based on score distribution
const scoreVariance = calculateVariance(Object.values(scores));
const maxScore = Math.max(...Object.values(scores));
const minScore = Math.min(...Object.values(scores));
const scoreRange = maxScore - minScore;

if (scoreRange > 0.1) {
  confidence = Math.min(100, 60 + (scoreRange * 200));
} else {
  confidence = 50 + (scoreGap / scoreRange) * 20;
}
```

---

## 📈 Expected Improvements

| Improvement | Expected Accuracy Gain | Effort |
|------------|----------------------|--------|
| Add 3 more features | +5-10% | Low |
| Better weight tuning | +5-10% | Medium |
| Data-driven training | +15-20% | High |
| Advanced model | +10-15% | Very High |

**Target**: 85-90% accuracy with data-driven training

---

## 🚀 Next Steps

1. ✅ Fix tie-breaking (DONE)
2. Add data logging system
3. Collect 50-100 examples
4. Train simple linear model
5. Validate and iterate

