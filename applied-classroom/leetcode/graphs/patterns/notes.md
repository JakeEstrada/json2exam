# Graphs — pattern recognition

LeetCode · Graphs

## How to use this deck

Pick BFS/DFS/union-find/topo skeleton for the graph problem, then read the Python sketch.

## Grid DFS / BFS

1. Walk cells; on a land/start, flood fill or queue neighbors.
2. Mark visited (mutate grid or set).
3. Count components or collect reaches.

## Graph BFS / DFS

1. Build adjacency list if needed.
2. BFS for shortest unweighted paths / cloning; DFS for cycles / components.
3. Track visited to avoid rework.

## Topological order

1. Indegree counts + queue of zeros (Kahn), or DFS cycle colors.
2. Emit nodes as indegree hits zero.
3. If not all emitted ⇒ cycle.

## Union-Find

1. Parent array with path compression.
2. Unite edges; count components or detect cycles.
3. Answer connectivity queries.

## Curated problems

| LC id | Title | Pattern |
| --- | --- | --- |
| 200 | Number of Islands | Grid DFS/BFS |
| 994 | Rotting Oranges | Grid BFS multi-source |
| 130 | Surrounded Regions | Grid DFS from borders |
| 417 | Pacific Atlantic Water Flow | Multi-source DFS |
| 133 | Clone Graph | Graph BFS/DFS + map |
| 207 | Course Schedule | Topological order |
| 127 | Word Ladder | BFS on implicit graph |
| 323 | Number of Connected Components | Union-Find / DFS |
| 261 | Graph Valid Tree | Union-Find / DFS |
| 743 | Network Delay Time | Dijkstra (heap BFS) |
| 721 | Accounts Merge | Union-Find |
| 79 | Word Search | Grid backtracking DFS |
