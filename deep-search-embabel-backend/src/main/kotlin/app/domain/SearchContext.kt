package app.domain

import org.baramov.search.tavily.SearchResult as TavilySearchResult

/**
 * Search context maintained on the Embabel blackboard during agent execution.
 *
 * @property request The original user search request
 * @property queries List of refined queries generated during the search process
 * @property rawResults Raw search results from Tavily API
 * @property synthesizedSummary Optional synthesized summary from LLM
 */
data class SearchContext(
    val request: SearchRequest,
    val queries: List<RefinedQuery> = emptyList(),
    val rawResults: List<TavilySearchResult> = emptyList(),
    val synthesizedSummary: String? = null
)
