# Strings and hash — pattern recognition

LeetCode · Strings and hash

Memorize a few string/hash skeletons, then recognize them on problem statements.

## How to use this deck

1. Skim the skeletons below.
2. On each card, read the **problem** first.
3. Pick the approach: pattern name plus high-level steps.
4. A correct answer reveals a Python sketch. Open the LeetCode link to practice for real.

## Hash map / frequency count

Use when anagrams, counts, or “seen char → index” matter.

1. Build a count map (or Counter) of characters / words.
2. Walk once more comparing counts, or query while scanning.
3. Return true/false, the group, or the indices.

## Sliding window on a string

Use for longest/shortest substring under a constraint (unique chars, required counts).

1. Expand `right`, updating window state (set, counts).
2. Shrink `left` while invalid.
3. Track best length / best window; return it.

## Two pointers on characters

Use for palindromes or in-place cleanup on a string treated as an array.

1. `lo`/`hi` from ends (or expand from center for palindromes).
2. Skip non-candidates if needed; compare / expand.
3. Return boolean or the best slice.

## Stack for matching

Use for brackets, nestings, or “previous unmatched opener.”

1. Push openers (or indices).
2. On closer, pop and check match.
3. Empty stack at end ⇒ valid (or build the result from the stack).

## Curated problems (from the CSV)

| LC id | Title | Pattern |
| --- | --- | --- |
| 242 | Valid Anagram | Hash map / frequency |
| 49 | Group Anagrams | Hash map / frequency |
| 3 | Longest Substring Without Repeating Characters | Sliding window |
| 76 | Minimum Window Substring | Sliding window |
| 438 | Find All Anagrams in a String | Sliding window + hash |
| 125 | Valid Palindrome | Two pointers |
| 5 | Longest Palindromic Substring | Two pointers (expand center) |
| 20 | Valid Parentheses | Stack |
| 14 | Longest Common Prefix | Scan / vertical compare |
| 13 | Roman to Integer | Hash map walk |
| 8 | String to Integer (atoi) | Scan with rules |
| 271 | Encode and Decode Strings | Length-prefix framing |
