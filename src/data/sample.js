export const SAMPLE_SNIPPET = `{
  "title": "Requirements Engineering, Chapter 1",
  "questions": [
    // multiple choice — one correct letter
    {
      "type": "multiple_choice",
      "question": "What is a business requirement?",
      "choices": {
        "A": "A restriction on the design or implementation choices open to the developer",
        "F": "A high-level objective explaining why the organization wants the product"
      },
      "answer": "F",
      "explanation": "optional, shown after you check"
    },

    // true / false
    {
      "type": "true_false",
      "question": "A feature and a functional requirement mean the same thing.",
      "choices": { "A": "True", "B": "False" },
      "answer": "B"
    },

    // select all — answer is an array of letters
    {
      "type": "select_all",
      "question": "Which of these are functional requirements for Discord? Select all that apply.",
      "choices": {
        "B": "Discord shall remove a message when a moderator with permission deletes it",
        "C": "Discord wants to raise the number of servers a typical user stays active in"
      },
      "answer": ["B"]
    }
  ]
}`;

export const PASTE_PLACEHOLDER = `// Paste your JSON file here. Don’t worry, no one else will see it. It is only stored in your own local memory.

[
  {
    "question": "...",
    "options": ["...", "..."],
    "answer": "a"
  }
]`;
