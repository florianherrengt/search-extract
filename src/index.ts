export {
  SEARCH_PROVIDER_NAMES,
  searchResultSchema,
  searchQueryInputSchema,
} from "./core/types.ts";
export type {
  SearchProviderName,
  SearchResult,
  SearchOptions,
  SearchAllOptions,
  PageLoader,
  PageLoadOptions,
  PageRenderOptions,
  Summarizer,
  ExtractOptions,
  ExtractResult,
} from "./core/types.ts";

export {
  SearchProviderConfigError,
  SearchProviderError,
  SearchProviderResponseError,
  UrlValidationError,
} from "./core/errors.ts";

export {
  rateLimit,
  setRateLimiter,
  resetRateLimiter,
  getRateLimiter,
} from "./core/rate-limit.ts";
export type { RateLimiter } from "./core/rate-limit.ts";

export { createSearchExtractEngine } from "./core/engine.ts";
export type { SearchExtractEngine, CreateEngineConfig } from "./core/engine.ts";

export { createSearchProvider, formatSearchHttpError } from "./search/create-search-provider.ts";
export { formatSearchResults } from "./search/format.ts";

export { createBraveSearch } from "./search/brave.ts";
export { createExaSearch } from "./search/exa.ts";
export { createSerperSearch } from "./search/serper.ts";
export { createTavilySearch } from "./search/tavily.ts";
export { createSearXNGFetchSearch } from "./search/searxng.ts";

export type { BraveConfig, BraveSearchFn } from "./search/brave.ts";
export type { ExaConfig, ExaSearchFn } from "./search/exa.ts";
export type { SerperConfig, SerperSearchFn } from "./search/serper.ts";
export type { TavilyConfig, TavilySearchFn } from "./search/tavily.ts";
export type { SearXNGConfig, SearXNGFetchSearchFn } from "./search/searxng.ts";

export { sanitizeHtml, extractVisibleTextFromHtml, MIN_CONTENT_LENGTH } from "./extract/sanitize-html.ts";
export { loadPageHtml, validateUrl } from "./extract/page-loader.ts";

export { PageExtractor } from "./extract/extractors/base.ts";
export type { ExtractorInput, ExtractorResult } from "./extract/extractors/base.ts";
export { extractors } from "./extract/extractors/registry.ts";

export { parseRedditJson } from "./extract/extractors/reddit-json-parser.ts";
export type { RedditPost, RedditComment } from "./extract/extractors/reddit-json-parser.ts";

export {
  RedditExtractor,
  isRedditChallengeHtml,
  parseOldRedditHtml,
} from "./extract/extractors/reddit.ts";

export {
  AmazonExtractor,
  isAmazonChallengePage,
  parseAmazonProductHtml,
} from "./extract/extractors/amazon.ts";

export { ShopifyExtractor } from "./extract/extractors/shopify.ts";

export { extractPage } from "./extract/extract-page.ts";
export type { ExtractPageDeps } from "./extract/extract-page.ts";

export {
  createAiSdkSummarizer,
  createAiSdkSearchTool,
  createAiSdkExtractPageContentTool,
} from "./adapters/ai-sdk.ts";

export { createTauriPageLoader } from "./adapters/tauri.ts";
export type { TauriLoaderCallbacks } from "./adapters/tauri.ts";
