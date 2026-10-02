# URL shortener

Read **System Design Interview - An Insider's Guide** Chapter 8 (PDF ~p. 149-163). Classic interview system that forces API design, hashing/IDs, redirects, and scale math.

## Scope reminders

- Shorten long URL → short alias
- Redirect short → long
- Clarify: charset (base62), delete/update?, traffic, analytics

## Design sparks

- POST shorten / GET redirect
- **301** vs **302** (cache vs analytics)
- Hash / base62 ID generation; collision handling
- Cache hot redirects; shard storage for billions of rows
