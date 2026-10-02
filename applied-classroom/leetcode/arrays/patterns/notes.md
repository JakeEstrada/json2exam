# Arrays - pattern recognition

LeetCode · Arrays

Build muscle memory for a few array patterns. First learn the step skeleton. Then, given a problem statement, pick the pattern and its outline. Do not memorize full code yet.

## How to use this deck

1. Skim the skeletons below once so the step lists feel familiar.
2. On each quiz card, read the **problem** first (title, difficulty, statement).
3. Pick the approach: pattern name plus high-level steps (not full code).
4. After you miss one, re-read that pattern’s skeleton, then try again.
5. Only after the outlines stick, implement the same problems on LeetCode.

## Hash map / set

Use when you need fast lookup of a value you have already seen, or membership of a complement.

1. Create an empty map or set.
2. Walk the array once (or twice if you must separate phases).
3. For each element, query the map/set for the value you need (complement, prior index, duplicate).
4. If found, return the answer; otherwise insert the current element and continue.
5. If the walk finishes with no hit, return the empty / false result.

## Two pointers (opposite ends)

Use on a sorted array, or when the best pair sits at the extremes of a range (height, width, sum).

1. Sort if the problem requires ordered values and order is not already given.
2. Set `lo` to the first index and `hi` to the last.
3. While `lo < hi`, compute the candidate from both ends (sum, area, …).
4. If the candidate is too small / too large / not best, move the end that can improve it.
5. Track the best answer; return it when the pointers meet.

## Two pointers (read / write)

Use for in-place compaction: remove duplicates, move zeros, partition by value.

1. Set a write index at the start of the region you keep.
2. Scan with a read index from left to right.
3. When the read element should stay, write it at the write index and advance write.
4. Always advance read.
5. Return the write index as the new length, or leave the tail unused.

## Sliding window

Use for the best contiguous subarray / substring under a length or validity constraint.

1. Set the left edge of the window at the start.
2. Expand the right edge one step at a time, updating a running state (sum, counts, …).
3. While the window is invalid (or longer than allowed), advance the left edge and undo state.
4. When the window is valid, update the best answer.
5. Continue until right reaches the end; return the best answer.

## Binary search

Use when the array (or a derived search space) is sorted / monotonic.

1. Set `lo` and `hi` to the inclusive search bounds.
2. While `lo <= hi`, compute `mid`.
3. Compare `nums[mid]` (or a predicate at `mid`) to the target.
4. Shrink to the half that still can contain the answer (`hi = mid - 1` or `lo = mid + 1`).
5. Return the index, the boundary, or “not found” when the loop ends.

## Prefix / running aggregate

Use when each answer index depends on everything to the left, right, or a contiguous sum (prefix products, Kadane max subarray, running min price).

1. Decide what aggregate to keep (prefix product, running sum, best-so-far, min so far).
2. Initialize that aggregate from the first element or from an identity (1 for product, 0 for sum).
3. Walk the array once, updating the aggregate from the previous step.
4. At each index, derive the local answer from the aggregate (and maybe a second reverse pass).
5. Return the filled answer array or the single best aggregate.

## Curated problems (from the CSV)

| LC id | Title | Pattern to feel for |
| --- | --- | --- |
| 1 | Two Sum | Hash map / set |
| 217 | Contains Duplicate | Hash map / set |
| 11 | Container With Most Water | Two pointers (opposite ends) |
| 15 | 3Sum | Sort + two pointers (opposite ends) |
| 283 | Move Zeroes | Two pointers (read / write) |
| 26 | Remove Duplicates from Sorted Array | Two pointers (read / write) |
| 643 | Maximum Average Subarray I | Sliding window |
| 33 | Search in Rotated Sorted Array | Binary search |
| 153 | Find Minimum in Rotated Sorted Array | Binary search |
| 53 | Maximum Subarray | Prefix / running aggregate (Kadane) |
| 121 | Best Time to Buy and Sell Stock | Prefix / running aggregate (min so far) |
| 238 | Product of Array Except Self | Prefix / running aggregate |

Source file for authoring: `leetcode_dataset - lc.csv` (Array-tagged rows). This deck uses only the ids above.
