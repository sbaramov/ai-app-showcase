package app.dr3

import com.embabel.agent.api.annotation.Action
import com.embabel.agent.api.annotation.Agent
import com.embabel.agent.api.common.ActionContext
import com.embabel.agent.api.common.OperationContext
import com.embabel.agent.api.common.TransformationActionContext
import com.embabel.agent.api.common.workflow.control.ResultList
import com.embabel.agent.api.common.workflow.control.ScatterGatherBuilder
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.function.Supplier

@Agent(name = "SearchAgent", description = "An agent that executed a web search and produces a summary of the results.")
class SearchAgent(val searchService: SearchTool) {

    private final val systemPrompt = """
            You are a research assistant. Given a search term, you search the web for that term and 
            produce a concise summary of the results. The summary must 2-3 paragraphs and less than 300 
            words. Capture the main points. Write succinctly, no need to have complete sentences or good 
            grammar. This will be consumed by someone synthesizing a report, so its vital you capture the 
            essence and ignore any fluff. Do not include any additional commentary other than the summary itself.
            """.trimIndent()

    @Action
    fun searchPlantToSummary(searchPlan: WebSearchPlan, context: ActionContext): SearchSummaryList {
        val searchSummaryList: List<Supplier<SearchSummary>> = searchPlan.searches.map { searchItem ->
            Supplier<SearchSummary> {
                context.ai()
                    .withLlm(LLModelId.SEARCH.modelId)
                    .withSystemPrompt(systemPrompt)
                    .withToolObject(searchService)
                    .createObject(
                        "Search term: ${searchItem.query}\nReason for searching: ${searchItem.reason}",
                        SearchSummary::class.java
                    )
            }
        }
        val reconciler = { ctx: TransformationActionContext<ResultList<SearchSummary>, SearchSummaryList> ->
            SearchSummaryList(results = ctx.input.results)
        }

        return ScatterGatherBuilder
            .returning(SearchSummaryList::class.java)
            .fromElements(SearchSummary::class.java)
            .generatedBy(searchSummaryList)
            .consolidatedBy(reconciler)
            .asSubProcess(context)
    }

    companion object {
        val log: Logger = LoggerFactory.getLogger(SearchAgent::class.java)
    }
}

data class SearchSummary(val title: String, val summary: String)

data class SearchSummaryList(val results: List<SearchSummary>)