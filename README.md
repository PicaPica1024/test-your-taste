# Test Your Taste

Test Your Taste is a minimal scientific judgment game. Pick a field, read the year, title, and abstract of a real older paper, then guess its journal and current OpenAlex citation range. The journal and citation metadata are revealed only after both guesses are submitted.

## Technology

- Next.js / Vinext, React, and TypeScript
- Tailwind CSS
- OpenAlex Topics and Works APIs (API key required in production)
- Browser `localStorage` for session statistics and duplicate prevention

No database or player account is required. OpenAlex now requires an API key for
production use; free keys are available from the OpenAlex account settings.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Open the local URL printed by the development server. A network connection is required while playing because papers and citation counts are retrieved from OpenAlex.

Local development may use OpenAlex's small anonymous testing allowance. For a
production deployment, configure `OPENALEX_API_KEY` as a secret environment
variable. Do not commit the key to the repository or expose it to client code.

For a production build:

```bash
npm run build
npm start
```

## How the scholarly data works

The server resolves each game field to one of several curated OpenAlex Topic labels, then requests works classified under the resolved Topic. Eligible papers must be articles or reviews, have a substantial reconstructable abstract, identify a journal, expose a citation count, and have been published at least ten years ago. Papers are sampled across four citation strata so the game is not limited to famous classics.

Citation counts are the current `cited_by_count` returned by OpenAlex and therefore can change over time. The result view records the retrieval date.

## Configuration

- `config/disciplines.ts` contains the user-facing field taxonomy and assigns every field to a journal-pool family.
- `config/openAlexMappings.ts` contains the curated OpenAlex Topic search labels for each field.
- `config/journalPools.ts` contains field-family journal pools, approximate reputation tiers, and establishment years used for plausible distractors.
- `config/journalPrestige.ts` contains the fallback approximation for a retrieved journal not already present in its local pool.

The reputation tiers are editorial approximations for option ordering. They are not official CAS quartiles, impact factors, or a reproduction of Clarivate Web of Science categories.

## Known MVP limitations

- OpenAlex topic classification, abstract coverage, and citation counts can contain source-data errors or omissions.
- Journal distractors come from curated field-family pools; very niche papers may have less precise alternatives.
- The game depends on OpenAlex availability and the configured API key's daily allowance.
- Statistics and seen-paper IDs are device-local and limited to the current browser.
- The current answer is kept in transient client state after retrieval so the no-database MVP can reveal instantly; it is hidden by the interface until submission but is not an anti-cheat system.
