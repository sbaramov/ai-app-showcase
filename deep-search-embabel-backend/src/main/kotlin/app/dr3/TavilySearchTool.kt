package app.dr3

import org.baramov.search.tavily.*
import org.slf4j.LoggerFactory
import org.springframework.ai.tool.annotation.Tool
import org.springframework.ai.tool.annotation.ToolParam
import org.springframework.aot.hint.MemberCategory
import org.springframework.aot.hint.annotation.RegisterReflection
import org.springframework.stereotype.Component
import java.util.*


@Component
class TavilySearchTool(val tavilySearchService: TavilySearchService) : SearchTool {

    // @Register
    // see https://docs.spring.io/spring-ai/reference/api/tools.html#_methods_as_tools
    @RegisterReflection(memberCategories = [MemberCategory.INVOKE_DECLARED_METHODS])
    @Tool(
        name = "search_internet",
        description = "Searches the Internet for relevant pages to the given query text."
    )
    fun search(
        @ToolParam(description = "The search query string to execute")
        queryText: String,

        @ToolParam(
            description = """
            Controls the latency vs. relevance tradeoff and how `results[].content` is generated:
            
                - `ADVANCED`: Highest relevance with increased latency. Best
                for detailed, high-precision queries. Returns multiple
                semantically relevant snippets per URL (configurable via
                `chunks_per_source`).

                - `BASIC`: A balanced option for relevance and latency.
                Ideal for general-purpose searches. Returns one NLP summary
                per URL.

                - `FAST`: Prioritizes lower latency while maintaining good
                relevance. Returns multiple semantically relevant snippets
                per URL (configurable via `chunks_per_source`).

                - `ULTRA_FAST`: Minimizes latency above all else. Best for
                time-critical use cases. Returns one NLP summary per URL.
                
            Prefer `basic` option if possible.
            """
        )
        searchDepth: String?,

        @ToolParam(description = "The maximum number of search results to return.")
        maxResults: Int?,

        @ToolParam(
            description = """
                Will return all results after the specified start date based
                on publish date or last updated date. Required to be written
                in the format YYYY-MM-DD.
            """,
            required = false
        )
        startDate: String?,

        @ToolParam(
            description = """
                Will return all results before the specified end date based
                on publish date or last updated date. Required to be written
                in the format YYYY-MM-DD.
            """,
            required = false
        )
        endDate: String?
    ): SearchResult {
        val searchId = UUID.randomUUID().toString()
        val searchDepthEnum = searchDepth?.let { SearchDepth.valueOf(it.uppercase()) } ?: SearchDepth.BASIC
        log.info("Starting a search ID: $searchId, query: $queryText")
        val query = SearchQuery(
            query = queryText,
            searchDepth = searchDepthEnum,
            maxResults = maxResults ?: 5,
            includeRawContent = "markdown",
            includeImages = false,
            startDate = startDate,
            endDate = endDate
        )
        val result = tavilySearchService.search(query)
        log.info("Search ID $searchId complete, request ID ${result.requestId}, response time: ${result.responseTime}, usage: ${result.usage?.credits ?: "unknown"}")
        return result
    }

    @RegisterReflection(memberCategories = [MemberCategory.INVOKE_DECLARED_METHODS])
    @Tool(
        name = "extract_web_content",
        description = "Extracts raw web page content from one or more specified URLs using Tavily Extract. Supports flexible input: provide a single URL as a string or multiple URLs as a list."
    )
    fun extract(
        @ToolParam(
            description = """
                The URL or list of URLs to extract content from. Can be:
                - A single URL as a string: "https://example.com"
                - A list of URLs: ["https://example.com", "https://other.com"]
                Maximum 20 URLs allowed.
            """
        )
        urls: Any,

        @ToolParam(
            description = """
                User intent for reranking extracted content chunks. When provided, 
                content chunks are reranked based on relevance to this query.
            """,
            required = false
        )
        query: String?,

        @ToolParam(
            description = """
                The depth of the extraction process:
                
                - `basic`: Cost 1 credit per 5 successful URL extractions. 
                  Default timeout: 10 seconds.
                  
                - `advanced`: Retrieves more data including tables and embedded content.
                  Cost 2 credits per 5 successful URL extractions.
                  Default timeout: 30 seconds.
            """,
            required = false
        )
        extractDepth: ExtractDepth?,

        @ToolParam(
            description = "Include a list of images extracted from the URLs in the response.",
            required = false
        )
        includeImages: Boolean?,

        @ToolParam(
            description = """
                The format of the extracted web page content:
                - `markdown`: Returns content in markdown format (default)
                - `text`: Returns plain text (may increase latency)
            """,
            required = false
        )
        format: ExtractFormat?,

        @ToolParam(
            description = """
                Maximum number of relevant chunks returned per source (1-5).
                Only used when query is provided. Default: 3.
                Chunks are short content snippets (max 500 chars each).
            """,
            required = false
        )
        chunksPerSource: Int?,

        @ToolParam(
            description = """
                Maximum time in seconds to wait for URL extraction (1.0-60.0 seconds).
                If not specified, defaults are applied based on extract_depth:
                - 10 seconds for basic extraction
                - 30 seconds for advanced extraction
            """,
            required = false
        )
        timeout: Float?
    ): ExtractResult {
        val extractId = UUID.randomUUID().toString()
        log.info("Starting extract ID: $extractId, urls: $urls")

        val extractQuery = ExtractQuery(
            urls = urls,
            query = query,
            extractDepth = extractDepth ?: ExtractDepth.BASIC,
            includeImages = includeImages ?: false,
            includeFavicon = false,
            format = format ?: ExtractFormat.MARKDOWN,
            chunksPerSource = chunksPerSource,
            timeout = timeout,
            includeUsage = true
        )

        val result = tavilySearchService.extract(extractQuery)
        log.info("Extract ID $extractId complete, request ID ${result.requestId}, response time: ${result.responseTime}, usage: ${result.usage?.credits ?: "unknown"}")
        return result
    }

    override fun getId(): String {
        return TavilySearchTool::class.simpleName!!
    }

    companion object {
        private val log = LoggerFactory.getLogger(TavilySearchTool::class.java)
    }

}