# Linked lists - pattern recognition

LeetCode · Linked lists

## How to use this deck

Read the problem, pick the pointer pattern and steps, then study the Python sketch.

## Reverse pointers

1. `prev = None`, `curr = head`.
2. While curr: save `nxt`, point `curr.next` to prev, advance prev/curr.
3. Return prev as new head.

## Fast / slow pointers

1. Slow walks one step; fast walks two (or n ahead).
2. Detect cycle, middle, or nth-from-end.
3. Split / remove / reverse from the meeting point as needed.

## Dummy head merge

1. Dummy node before the real head.
2. Walk pointers comparing / linking nodes.
3. Return `dummy.next`.

## Curated problems

| LC id | Title | Pattern |
| --- | --- | --- |
| 206 | Reverse Linked List | Reverse pointers |
| 21 | Merge Two Sorted Lists | Dummy head merge |
| 141 | Linked List Cycle | Fast / slow |
| 19 | Remove Nth Node From End of List | Fast / slow gap |
| 2 | Add Two Numbers | Dummy head merge |
| 234 | Palindrome Linked List | Slow/fast + reverse half |
| 143 | Reorder List | Split, reverse, merge |
| 160 | Intersection of Two Linked Lists | Two pointers length align |
| 24 | Swap Nodes in Pairs | Dummy + pairwise rewires |
| 138 | Copy List with Random Pointer | Hash old→new |
| 23 | Merge k Sorted Lists | Heap / divide-conquer |
| 146 | LRU Cache | Hash + doubly linked list |
