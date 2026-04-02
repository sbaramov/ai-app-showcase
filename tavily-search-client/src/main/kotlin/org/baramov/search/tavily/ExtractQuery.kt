package org.baramov.search.tavily

import com.fasterxml.jackson.annotation.JsonValue

/**
 * Represents an extract query for the Tavily Extract API.
 *
 * Extract web page content from one or more specified URLs using Tavily Extract.
 *
 * @property urls The URL or list of URLs to extract content from (required, max 20 URLs)
 * @property query User intent for reranking extracted content chunks (optional)
 * @property chunksPerSource Maximum number of relevant chunks returned per source (1-5, default: 3)
 *                           Only used when query is provided
 * @property extractDepth The depth of the extraction process: "basic" or "advanced" (default: "basic")
 * @property includeImages Include a list of images extracted from the URLs (default: false)
 * @property includeFavicon Whether to include the favicon URL for each result (default: false)
 * @property format The format of the extracted web page content: "markdown" or "text" (default: "markdown")
 * @property timeout Maximum time in seconds to wait for URL extraction (1.0-60.0 seconds)
 * @property includeUsage Whether to include credit usage information in the response (default: false)
 */
data class ExtractQuery(
    val urls: Any, // Can be String or List<String>
    val query: String? = null,
    val chunksPerSource: Int? = null,
    val extractDepth: ExtractDepth = ExtractDepth.BASIC,
    val includeImages: Boolean = false,
    val includeFavicon: Boolean = false,
    val format: ExtractFormat = ExtractFormat.MARKDOWN,
    val timeout: Float? = null,
    val includeUsage: Boolean = false
)

/**
 * Controls the depth and cost of the extraction process.
 *
 * **Cost Information:**
 * - BASIC: 1 credit per 5 successful URL extractions
 * - ADVANCED: 2 credits per 5 successful URL extractions
 *
 * @property BASIC Basic extraction (faster, lower cost)
 * @property ADVANCED Advanced extraction with more data including tables and embedded content
 */
enum class ExtractDepth(val value: String) {
    BASIC("basic"),
    ADVANCED("advanced");

    @JsonValue
    fun toValue(): String = this.value
}

/**
 * Controls the format of extracted web page content.
 *
 * @property MARKDOWN Returns content in markdown format (default)
 * @property TEXT Returns plain text (may increase latency)
 */
enum class ExtractFormat(val value: String) {
    MARKDOWN("markdown"),
    TEXT("text");

    @JsonValue
    fun toValue(): String = this.value
}
