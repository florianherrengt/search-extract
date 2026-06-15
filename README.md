# Search Extract

Runtime-agnostic web search and page content extraction engine extracted from Deep Search.

## Features

- Search providers: Brave, Exa, Serper, Tavily, SearXNG
- Generic page extraction from HTML
- Custom extractors for Amazon, Shopify, and Reddit
- Injectable page loading via `fetchHtml` and `renderHtml`
- Injectable summarization callback
- AI SDK and Tauri-style adapter helpers

## Development

```bash
npm install
npm test
npm run typecheck
```

## Example

```ts
import { createSearchExtractEngine } from "@deep-search/search-extract";

const engine = createSearchExtractEngine({
  fetch: globalThis.fetch,
  searchProviders: {
    brave: { apiKey: process.env.BRAVE_API_KEY },
  },
});

const results = await engine.search("brave", "latest AI research tools");
const page = await engine.extract(results[0].url, { summarize: false });
```

The package currently exports TypeScript source. A compiled npm publishing setup can be added before publishing to npm.
