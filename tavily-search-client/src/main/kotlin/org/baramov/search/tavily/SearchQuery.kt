package org.baramov.search.tavily

import com.fasterxml.jackson.annotation.JsonValue

/**
 * Represents a search query for the Tavily Search API.
 *
 * This data class encapsulates all the parameters needed to execute a search query
 * using Tavily Search, a powerful search engine optimized for LLM agents.
 *
 * @property query The search query string to execute with Tavily
 * @property searchDepth Controls the latency vs. relevance tradeoff (default: BASIC)
 * @property chunksPerSource Maximum number of relevant chunks returned per source (1-3, default: 3)
 * @property maxResults Maximum number of search results to return (0-20, default: 5)
 * @property topic The category of the search - "general", "news", or "finance" (default: "general")
 * @property timeRange Time range filter: "day", "week", "month", "year" or short forms "d", "w", "m", "y"
 * @property startDate Filter results after this date (format: YYYY-MM-DD)
 * @property endDate Filter results before this date (format: YYYY-MM-DD)
 * @property includeAnswer Include LLM-generated answer (false, true/"basic", or "advanced")
 * @property includeRawContent Include cleaned HTML content (false, true/"markdown", or "text")
 * @property includeImages Whether to perform image search and include results
 * @property includeImageDescriptions Add descriptive text for each image when includeImages is true
 * @property includeFavicon Whether to include favicon URL for each result
 * @property includeDomains List of domains to specifically include (max 300 domains)
 * @property excludeDomains List of domains to specifically exclude (max 150 domains)
 * @property country Boost results from specific country (available only for "general" topic)
 */
data class SearchQuery(
    val query: String,
    val searchDepth: SearchDepth = SearchDepth.BASIC,
    val chunksPerSource: Int = 3,
    val maxResults: Int = 5,
    val topic: String = "general",
    val timeRange: String? = null,
    val startDate: String? = null,
    val endDate: String? = null,
    val includeAnswer: Any = false,
    val includeRawContent: Any = false,
    val includeImages: Boolean = false,
    val includeImageDescriptions: Boolean = false,
    val includeFavicon: Boolean = false,
    val includeDomains: List<String> = emptyList(),
    val excludeDomains: List<String> = emptyList(),
    val country: String? = null
)

/**
 * Controls the latency vs. relevance tradeoff and how search result content is generated.
 *
 * **Cost Information:**
 * - BASIC, FAST, ULTRA_FAST: 1 API Credit
 * - ADVANCED: 2 API Credits
 *
 * @property ADVANCED Highest relevance with increased latency. Best for detailed, high-precision queries.
 *                   Returns multiple semantically relevant snippets per URL (configurable via chunksPerSource).
 * @property BASIC A balanced option for relevance and latency. Ideal for general-purpose searches.
 *                Returns one NLP summary per URL.
 * @property FAST Prioritizes lower latency while maintaining good relevance.
 *               Returns multiple semantically relevant snippets per URL (configurable via chunksPerSource).
 * @property ULTRA_FAST Minimizes latency above all else. Best for time-critical use cases.
 *                     Returns one NLP summary per URL.
 */
enum class SearchDepth(val value: String) {
    BASIC("basic"),
    FAST("fast"),
    ADVANCED("advanced"),
    ULTRA_FAST("ultra-fast");

    @JsonValue
    fun toValue(): String = this.value
}

data class QuickSearchQuery(
    val query: String,
    val searchDepth: SearchDepth = SearchDepth.BASIC
)