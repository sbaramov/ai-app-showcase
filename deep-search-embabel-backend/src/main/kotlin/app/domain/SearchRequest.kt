package app.domain

/**
 * User's search request with optional refinement parameters.
 *
 * @property query The search query string
 * @property maxDepth Maximum number of refinement iterations (default: 3)
 * @property includeSources Whether to include source URLs in response (default: true)
 * @property topic Optional topic filter for Tavily search
 */
data class SearchRequest(
    val query: String,
    val maxDepth: Int = 3,
    val includeSources: Boolean = true,
    val topic: String? = null
)
