package app.agent

import app.TavilyClient
import app.domain.DeepSearchResult
import app.domain.RefinedQuery
import app.domain.SearchContext
import app.domain.SearchRequest
import app.domain.SourceReference
import com.embabel.agent.api.annotation.AchievesGoal
import com.embabel.agent.api.annotation.Action
import com.embabel.agent.api.annotation.Agent
import com.embabel.agent.api.common.OperationContext
import org.baramov.search.tavily.SearchDepth
import org.baramov.search.tavily.SearchQuery
import org.baramov.search.tavily.TavilyClientConfig
import org.baramov.search.tavily.TavilySearchService

@Agent(description = "Performs deep, multi-iteration web search with query refinement and result synthesis")
class DeepSearchAgent(
    private val tavilyClient: TavilyClient
) {

    @Action
    fun initializeContext(request: SearchRequest, context: OperationContext): SearchContext {
        return SearchContext(request = request)
    }

    @Action
    fun executeSearch(searchContext: SearchContext, context: OperationContext): SearchContext {
        val query = searchContext.queries.lastOrNull()?.refinedQuery
            ?: searchContext.request.query

        val tavilyQuery = SearchQuery(
            query = query,
            searchDepth = SearchDepth.ADVANCED,
            maxResults = 10,
            includeAnswer = true,
            topic = searchContext.request.topic ?: "general"
        )
        val result = tavilyClient.search(tavilyQuery)
        return searchContext.copy(
            rawResults = searchContext.rawResults + result
        )
    }

    @Action
    fun refineQuery(searchContext: SearchContext, context: OperationContext): RefinedQuery {
        val prompt = buildRefinementPrompt(searchContext)
        return context.ai()
            .withLlm("llama3.1:8b")
            .createObject(prompt, RefinedQuery::class.java)
    }

    @Action
    fun synthesizeResults(
        searchContext: SearchContext,
        context: OperationContext
    ): DeepSearchResult {
        val prompt = buildSynthesisPrompt(searchContext)
        return context.ai()
            .withLlm("llama3.1:8b")
            .createObject(prompt, DeepSearchResult::class.java)
    }

    @AchievesGoal(description = "Complete deep search with synthesized answer and sources")
    @Action
    fun completeSearch(searchContext: SearchContext): DeepSearchResult {
        val allResults = searchContext.rawResults.flatMap { r ->
            r.results.map { SourceReference(it.title, it.url, it.score) }
        }
        return searchContext.synthesizedSummary?.let { summary ->
            DeepSearchResult(
                query = searchContext.request.query,
                summary = summary,
                sources = allResults,
                iterations = searchContext.queries.size,
                confidence = 0.85
            )
        } ?: DeepSearchResult(
            query = searchContext.request.query,
            summary = "No results found.",
            sources = allResults,
            iterations = 0,
            confidence = 0.0
        )
    }

    private fun buildRefinementPrompt(context: SearchContext): String {
        val queriesSoFar = context.queries.joinToString("\n") { "- ${it.refinedQuery}: ${it.rationale}" }
        val resultsSummary = context.rawResults.flatMap { it.results }
            .take(5)
            .joinToString("\n") { "- ${it.title}: ${it.content.take(100)}" }

        return """
            You are a search query refinement expert.
            Original query: ${context.request.query}
            
            Queries already tried:
            $queriesSoFar
            
            Results found so far:
            $resultsSummary
            
            Generate a refined search query that explores a different angle or deeper aspect of the original topic.
            Return a JSON object with fields: originalQuery, refinedQuery, rationale.
        """.trimIndent()
    }

    private fun buildSynthesisPrompt(context: SearchContext): String {
        val allResults = context.rawResults.flatMap { it.results }
        val resultsFormatted = allResults.joinToString("\n\n") {
            "Title: ${it.title}\nURL: ${it.url}\nContent: ${it.content}"
        }
        val answers = context.rawResults.mapNotNull { it.answer }
            .joinToString("\n\n")

        return """
            Synthesize a comprehensive answer to the following query based on the search results.
            
            Query: ${context.request.query}
            
            ${if (answers.isNotEmpty()) "AI-generated answers from searches:\n$answers" else ""}
            
            Search results:
            $resultsFormatted
            
            Return a JSON object with fields: query, summary, sources (array of {title, url, relevance}), iterations, confidence.
        """.trimIndent()
    }
}
