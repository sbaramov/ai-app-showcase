package app

import org.baramov.search.tavily.QuickSearchQuery
import org.baramov.search.tavily.SearchDepth
import org.baramov.search.tavily.SearchQuery
import org.baramov.search.tavily.SearchResult
import org.springframework.shell.standard.ShellCommandGroup
import org.springframework.shell.standard.ShellComponent
import org.springframework.shell.standard.ShellMethod
import org.springframework.shell.standard.ShellOption

@ShellComponent
@ShellCommandGroup("tavily")
class SearchCommand(private val tavilyClient: TavilyClient) {

    @ShellMethod("Execute a basic search with Tavily")
    fun search(
        @ShellOption(help = "The search query string") query: String,
        @ShellOption(help = "Search depth: basic, fast, advanced, ultra-fast", defaultValue = "basic") searchDepth: String,
        @ShellOption(help = "Maximum number of results (0-20)", defaultValue = "5") maxResults: Int
    ): String {
        val searchQuery = SearchQuery(
            query = query,
            searchDepth = SearchDepth.valueOf(searchDepth.uppercase().replace('-', '_')),
            maxResults = maxResults
        )
        val result: SearchResult = tavilyClient.search(searchQuery)
        return printSearchResults(result)
    }

    @ShellMethod("Execute a quick search with Tavily")
    fun quickSearch(
        @ShellOption(help = "The search query string") query: String
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