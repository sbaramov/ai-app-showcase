package app

import org.baramov.search.tavily.QuickSearchQuery
import org.baramov.search.tavily.SearchDepth
import org.baramov.search.tavily.SearchQuery
import org.baramov.search.tavily.SearchResult
import org.springframework.shell.core.command.annotation.Command
import org.springframework.shell.core.command.annotation.CommandGroup
import org.springframework.shell.core.command.annotation.Option

@CommandGroup(name = "tavily")
class SearchCommand(private val tavilyClient: TavilyClient) {

    @Command(description = "Execute a basic search with Tavily")
    fun search(
        @Option(description = "The search query string") query: String,
        @Option(description = "Search depth: basic, fast, advanced, ultra-fast", defaultValue = "basic") searchDepth: String,
        @Option(description = "Maximum number of results (0-20)", defaultValue = "5") maxResults: Int
    ): String {
        val searchQuery = SearchQuery(
            query = query,
            searchDepth = SearchDepth.valueOf(searchDepth.uppercase().replace('-', '_')),
            maxResults = maxResults
        )
        val result: SearchResult = tavilyClient.search(searchQuery)
        return printSearchResults(result)
    }

    @Command(description = "Execute a quick search with Tavily")
    fun quickSearch(
        @Option(description = "The search query string") query: String
    ): String {
        val result: SearchResult = tavilyClient.quickSearch(QuickSearchQuery(query))
        return printSearchResults(result)
    }

    private fun printSearchResults(result: SearchResult): String {
        return buildString {
            appendLine("Query: ${result.query}")
            result.answer?.let { appendLine("Answer: $it") }
            appendLine("Results:")
            result.results.forEach { item ->
                appendLine("  - ${item.title}")
                appendLine("    URL: ${item.url}")
                appendLine("    Score: ${item.score}")
            }
        }
    }
}