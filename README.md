# Search Extract

Runtime-agnostic web search and page content extraction engine extracted from Deep Search.

It gives you one package for:

- Web search via Brave, Exa, Serper, Tavily, and SearXNG
- Generic web page extraction from HTML
- Custom extractors for Amazon, Shopify, and Reddit
- Optional rendered-page extraction through a host-provided renderer
- Optional summarization through a host-provided LLM callback
- AI SDK tool adapters for chat/tool-calling apps
- Tauri-style adapter helpers for desktop apps

## Status

This package currently exports TypeScript source directly:

```json
{
  "exports": {
    ".": "./src/index.ts"
  }
}
```

Use it from a bundler/runtime that can consume TypeScript source, such as Vite or a TypeScript-aware app setup. A compiled npm publishing setup should be added before publishing to npm.

## Install

From GitHub:

```bash
npm install github:florianherrengt/search-extract
```

Local sibling checkout during development:

```bash
npm install ../search-extract
```

The package declares `ai` as a peer dependency because AI SDK tool types are branded. Your app should provide the `ai` package when using the AI SDK adapters.

## Quick Start

```ts
import { createSearchExtractEngine } from "@deep-search/search-extract";

const engine = createSearchExtractEngine({
  fetch: globalThis.fetch,
  searchProviders: {
    brave: { apiKey: process.env.BRAVE_API_KEY ?? "" },
  },
});

const results = await engine.search("brave", "best standing desk reviews");
const page = await engine.extract(results[0].url, { summarize: false });

console.log(results);
console.log(page.content);
```

## Passing Provider Credentials

Credentials are passed when creating the engine, under `searchProviders`.

```ts
import { createSearchExtractEngine } from "@deep-search/search-extract";

const engine = createSearchExtractEngine({
  fetch: globalThis.fetch,
  searchProviders: {
    brave: {
      apiKey: process.env.BRAVE_API_KEY ?? "",
    },
    exa: {
      apiKey: process.env.EXA_API_KEY ?? "",
    },
    serper: {
      apiKey: process.env.SERPER_API_KEY ?? "",
    },
    tavily: {
      apiKey: process.env.TAVILY_API_KEY ?? "",
    },
    searxng: {
      baseUrl: process.env.SEARXNG_BASE_URL ?? "http://localhost:8080",
    },
  },
});
```

Provider credentials are validated lazily. Creating the engine with an empty key is allowed, but calling that provider throws `SearchProviderConfigError`.

Do not expose provider API keys in a public browser app. For browser-hosted apps, call this package from your backend or proxy the provider requests through your own server. For local desktop apps and private agent runtimes, passing runtime credentials directly can be appropriate.

Credential map:

| Provider | Config | Notes |
| --- | --- | --- |
| Brave | `{ apiKey }` | Sent as `x-subscription-token` |
| Exa | `{ apiKey }` | Sent as `x-api-key` |
| Serper | `{ apiKey }` | Sent as `X-API-KEY` |
| Tavily | `{ apiKey }` | Sent as `Authorization: Bearer ...` |
| SearXNG | `{ baseUrl }` | Uses the self-hosted `/search?format=json&q=...` endpoint |

You can also pass a provider-specific `fetch` implementation:

```ts
const engine = createSearchExtractEngine({
  fetch: globalThis.fetch,
  searchProviders: {
    brave: {
      apiKey: braveApiKey,
      fetch: customFetch,
    },
  },
});
```

If both top-level `fetch` and provider-level `fetch` are provided, the provider-level function wins for that provider.

## Searching

Search one provider:

```ts
const results = await engine.search("brave", "lightweight hiking tent");
```

Search all configured providers:

```ts
const results = await engine.searchAll("lightweight hiking tent");
```

Search only selected providers:

```ts
const results = await engine.searchAll("lightweight hiking tent", {
  providers: ["brave", "exa"],
});
```

Allow partial results if one provider fails:

```ts
const results = await engine.searchAll("lightweight hiking tent", {
  partial: true,
});
```

Search returns structured data:

```ts
type SearchResult = {
  title: string;
  url: string;
  description: string;
  snippet?: string;
};
```

To format results for a chat response or text output:

```ts
import { formatSearchResults } from "@deep-search/search-extract";

const text = formatSearchResults(results);
```

## Extraction

Basic extraction uses `fetch` to load HTML and then strips scripts, styles, hidden UI, and common boilerplate.

```ts
const result = await engine.extract("https://example.com/article", {
  summarize: false,
});

console.log(result.content);
```

Extraction returns structured data:

```ts
type ExtractResult = {
  url: string;
  content: string;
  summary?: string;
  html?: string | null;
  usedCustomExtractor: boolean;
  extractorName?: string;
  method: "fetch" | "render" | "custom";
  warnings?: string[];
};
```

Extraction methods:

| Method | Behavior |
| --- | --- |
| `auto` | Try `fetchHtml` first, then `renderHtml` if extracted content is too short |
| `fetch` | Use HTTP/fetch only, never render |
| `render` | Use the host-provided renderer directly |

Example:

```ts
const result = await engine.extract("https://example.com", {
  method: "auto",
  summarize: false,
});
```

## Page Loading

The engine can work with only `fetch`, but you can provide a `PageLoader` for more control.

```ts
const engine = createSearchExtractEngine({
  fetch: globalThis.fetch,
  pageLoader: {
    fetchHtml: async (url, { signal }) => {
      const response = await fetch(url, { signal });
      if (!response.ok) return null;
      return response.text();
    },
    renderHtml: async (url, { signal }) => {
      return renderWithYourBrowserOrWebView(url, signal);
    },
  },
});
```

`fetchHtml` is for plain HTTP loading.

`renderHtml` is for JavaScript-rendered pages. You can implement it with Tauri WebView, Playwright, Puppeteer, a browser extension, an MCP host, or another renderer.

## Tauri Page Loader Adapter

For Tauri apps, keep the actual Tauri commands in your app and pass callbacks into `createTauriPageLoader`.

```ts
import { createSearchExtractEngine, createTauriPageLoader } from "@deep-search/search-extract";

const pageLoader = createTauriPageLoader({
  fetchHtml: async (url, signal) => {
    return invoke<string | null>("fetch_html", { url });
  },
  renderHtml: async (url, signal) => {
    return openWebViewAndReadOuterHtml(url, signal);
  },
});

const engine = createSearchExtractEngine({
  fetch: tauriFetch,
  pageLoader,
});
```

The adapter does not import Tauri. It only adapts your callbacks to the package `PageLoader` interface.

## Built-In And Custom Extractors

The package includes built-in extractor classes for:

- `RedditExtractor`
- `AmazonExtractor`
- `ShopifyExtractor`

The engine does not register these automatically. If you do not pass extractors, extraction uses the generic HTML cleanup pipeline only.

To enable the built-in extractors, pass them when creating the engine:

```ts
import {
  AmazonExtractor,
  RedditExtractor,
  ShopifyExtractor,
  createSearchExtractEngine,
} from "@deep-search/search-extract";

const engine = createSearchExtractEngine({
  extractors: [new RedditExtractor(), new AmazonExtractor(), new ShopifyExtractor()],
});
```

Extractors run before generic extraction. If an extractor returns `null`, the engine falls back to generic extraction.

Custom extractor shape:

```ts
import { PageExtractor, type ExtractorInput, type ExtractorResult } from "@deep-search/search-extract";

class ExampleExtractor extends PageExtractor {
  canHandle(url: URL): boolean {
    return url.hostname === "example.com";
  }

  async extract(input: ExtractorInput): Promise<ExtractorResult | null> {
    const html = await input.loader.fetchHtml?.(input.url.toString(), {
      signal: input.signal,
    });

    if (!html) return null;

    return {
      html,
      content: "Extracted content here",
    };
  }
}
```

## Summarization

The core engine does not call an LLM by itself. Pass a `summarizer` callback.

```ts
const engine = createSearchExtractEngine({
  summarizer: async ({ content, query, signal }) => {
    return summarizeWithYourModel({ content, query, signal });
  },
});

const result = await engine.extract("https://example.com/article", {
  summarize: true,
});

console.log(result.summary);
```

Providing a `query` also requests focused summarization:

```ts
const result = await engine.extract("https://example.com/product", {
  query: "price, availability, and warranty",
});
```

Core summarization rules:

- `summarize: true` calls the summarizer.
- `query` calls the summarizer and passes the query.
- No summarizer means no summary is produced.
- Summarization failures are returned in `warnings` unless the failure is an abort.

## AI SDK Adapter

If your app uses the Vercel AI SDK, use the adapter helpers.

```ts
import {
  createAiSdkExtractPageContentTool,
  createAiSdkSearchTool,
  createAiSdkSummarizer,
  createSearchExtractEngine,
} from "@deep-search/search-extract";

const engine = createSearchExtractEngine({
  fetch: globalThis.fetch,
  searchProviders: {
    brave: { apiKey: process.env.BRAVE_API_KEY ?? "" },
  },
});

const tools = {
  brave_search: createAiSdkSearchTool(
    engine,
    "brave",
    "Search the web with Brave Search",
  ),
  extract_page_content: createAiSdkExtractPageContentTool(engine, {
    summarizer: createAiSdkSummarizer(model),
  }),
};
```

The AI SDK extraction tool accepts `method: "webview"` for app-facing compatibility and maps it to the core engine's `method: "render"`.

## Abort Signals

Search and extraction methods accept `AbortSignal`.

```ts
const controller = new AbortController();

const results = await engine.search("brave", "kayak reviews", {
  signal: controller.signal,
});
```

Abort errors propagate. They are not converted into warnings.

## URL Validation And Security

Extraction only allows HTTPS URLs by default.

Blocked examples include:

- `file:` URLs
- `data:` URLs
- `javascript:` URLs
- `tauri:` URLs
- localhost names
- `.local` and `.localhost` names
- private, loopback, link-local, multicast, and other non-unicast IP literals

This is intended to reduce SSRF risk when the package is used in desktop, backend, MCP, or agent environments.

SearXNG `baseUrl` is separate from extraction URL validation because SearXNG is commonly self-hosted on `http://localhost:8080`.

## Errors

Useful exported error classes:

```ts
import {
  SearchProviderConfigError,
  SearchProviderError,
  SearchProviderResponseError,
  UrlValidationError,
} from "@deep-search/search-extract";
```

Common cases:

- `SearchProviderConfigError`: missing API key or provider config
- `SearchProviderError`: provider HTTP error
- `SearchProviderResponseError`: provider returned an unexpected response shape
- `UrlValidationError`: invalid or blocked extraction URL

`searchAll` can also throw an aggregate-style error if every configured provider fails and `partial: true` was not set.

## Development

```bash
npm install
npm test
npm run typecheck
```

## Publishing Notes

This repository is public, but the package is not yet compiled for npm publishing. Before publishing to npm, add a build step that emits JavaScript and declaration files, then update `exports` to point at the compiled output.
