# Dynamic programming - pattern recognition

LeetCode · Dynamic programming

## How to use this deck

Name the DP state and transition at a high level, then study the Python sketch.

## 1D climb / decide

1. Define `dp[i]` = best/ways for prefix i.
2. Transition from a few prior states.
3. Answer at `dp[n]` (or rolling variables).

## Unbounded / knapsack style

1. State over capacity or remaining target.
2. Try taking an item and staying, or moving index.
3. Minimize coins / decide reachable sums.

## Sequence LIS-style

1. `dp[i]` = best ending at i.
2. Look back at valid j < i.
3. Optionally patience-sort / binary search length.

## Grid paths

1. `dp[r][c]` from top/left (or obstacles).
2. Fill row-by-row.
3. Bottom-right is the answer.

## Curated problems

| LC id | Title | Pattern |
| --- | --- | --- |
| 70 | Climbing Stairs | 1D climb |
| 198 | House Robber | 1D decide |
| 322 | Coin Change | Unbounded knapsack |
| 416 | Partition Equal Subset Sum | 0/1 knapsack |
| 300 | Longest Increasing Subsequence | Sequence LIS |
| 139 | Word Break | 1D reachable |
| 62 | Unique Paths | Grid paths |
| 55 | Jump Game | Greedy / 1D reach |
| 91 | Decode Ways | 1D climb |
| 152 | Maximum Product Subarray | 1D with min/max |
| 72 | Edit Distance | 2D string DP |
| 39 | Combination Sum | Backtracking (related) |
