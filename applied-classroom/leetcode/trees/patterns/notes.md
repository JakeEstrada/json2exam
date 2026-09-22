# Trees — pattern recognition

LeetCode · Trees

## How to use this deck

Read the problem, pick DFS/BFS skeleton + steps, then study the Python sketch.

## DFS recurse

1. Base case on null (and sometimes leaf).
2. Recurse left/right (or children).
3. Combine results on the way back (height, sum, validity).

## BFS level order

1. Queue starting at root.
2. Process level size; push children.
3. Collect per-level answers (or rightmost / first).

## BST order

1. Inorder is sorted for a BST.
2. Keep bounds (low, high) while DFS validating.
3. Or walk inorder comparing to previous value.

## Curated problems

| LC id | Title | Pattern |
| --- | --- | --- |
| 226 | Invert Binary Tree | DFS recurse |
| 104 | Maximum Depth of Binary Tree | DFS recurse |
| 100 | Same Tree | DFS recurse |
| 112 | Path Sum | DFS recurse |
| 543 | Diameter of Binary Tree | DFS recurse |
| 102 | Binary Tree Level Order Traversal | BFS level order |
| 199 | Binary Tree Right Side View | BFS level order |
| 98 | Validate Binary Search Tree | BST order |
| 235/236 | LCA | DFS recurse |
| 572 | Subtree of Another Tree | DFS recurse |
| 105 | Construct from Preorder/Inorder | DFS divide |
| 297 | Serialize and Deserialize | DFS/BFS encode |
