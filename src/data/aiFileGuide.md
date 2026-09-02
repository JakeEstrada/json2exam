# Getting a question file fast

You don't have to write these by hand. Upload your textbook chapter or lecture slides to an LLM and have it generate the questions for you in the JSON format used by example.json.

Two things to watch for, because models get both wrong by default:

- **Balance the answer key.** Left alone, an LLM will pile most of the correct answers onto one or two letters and never use the last couple at all. Tell it to spread the correct answers evenly across every option.
- **Watch the answer length.** The correct answer tends to come out as the longest, most detailed option while the distractors are short fragments. That makes the whole thing guessable without reading the question. Tell it to keep every option about the same length.

I've had good results with Claude for this. It handles the format well and does a decent job keeping things balanced if you ask it to.
