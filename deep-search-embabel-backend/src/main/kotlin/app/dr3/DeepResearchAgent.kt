package app.dr3

import app.AppProperties
import com.embabel.agent.api.annotation.AchievesGoal
import com.embabel.agent.api.annotation.Action
import com.embabel.agent.api.annotation.Agent
import com.embabel.agent.api.common.OperationContext
import com.embabel.agent.api.event.ProgressUpdateEvent
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Profile
import java.util.*
import java.util.stream.Stream

@Agent(
    name = "Deep Research Agent",
    description = "An agent to research a given topic and product a detailed report."
)
@Profile("!test")
class DeepResearchAgent(
    val appProperties: AppProperties,
    val searchService: SearchTool
) {

    // =======================================
    //        Plan
    // =======================================

    @Action
    fun planSearch(userInput: UserResearchRequest, context: OperationContext): WebSearchPlan {
        log.info("[${context.agentProcess.id}] Starting to plan a research on: '${userInput.researchTopic}'")
        context.processContext.onProcessEvent(
            ProgressUpdateEvent(
                agentProcess = context.agentProcess,
                name = "Planning search queries",
                current = 0,
                total = 3
            )
        )

        return context.ai()
            .withAutoLlm()
            .withSystemPrompt(appProperties.systemPrompts.plan)
            .createObject(
                "Research topic: ${userInput.researchTopic} ",
                WebSearchPlan::class.java
            )
    }

    // =======================================
    //        Search
    // =======================================
    @Action
    fun searchPlanToItem(webSearchPlan: WebSearchPlan, context: OperationContext): Stream<WebSearchItem> {
        return webSearchPlan.searches.stream()
    }

    @Action
    fun searchPlantToSummary(searchItem: WebSearchItem, context: OperationContext): SearchSummary {
        log.info("[${context.agentProcess.id}] Executing a search for ${searchItem.query} and creating executive summary")
        context.processContext.onProcessEvent(
            ProgressUpdateEvent(
                agentProcess = context.agentProcess,
                name = "Searching: ${searchItem.query}",
                current = 1,
                total = 3
            )
        )
        val summary = context.ai()
            .withAutoLlm()
            .withSystemPrompt(appProperties.systemPrompts.search)
            .withToolObject(searchService)
            .createObject(
                "Search term: ${searchItem.query}\nReason for searching: ${searchItem.reason}",
                SearchSummary::class.java
            )
        return summary
    }

    // =======================================
    //        Report
    // =======================================

    @Action
    fun steamOfSearchSummary(stream: Stream<SearchSummary>, context: OperationContext): SearchSummaryList {
        return SearchSummaryList(stream.toList())
    }

    @Action
    @AchievesGoal(description = "Creates the final deep research report on the given topic")
    fun finalSearchReport(
        userResearchRequest: UserResearchRequest,
        researchResults: SearchSummaryList,
        context: OperationContext
    ): ResearchReport {
        val researchResultsText = researchResults.results.joinToString("\n---\n")
        val prompt =
            "Original query: $${userResearchRequest.researchTopic}\nSummarized search results: \n${researchResultsText}"

        log.info("[${context.agentProcess.id}] Summarizing research")
        context.processContext.onProcessEvent(
            ProgressUpdateEvent(
                agentProcess = context.agentProcess,
                name = "Generating final report",
                current = 2,
                total = 3
            )
        )
        return context.ai()
            .withAutoLlm()
            .withSystemPrompt(appProperties.systemPrompts.report)
            .createObject(
                prompt,
                ResearchReport::class.java
            )
    }

    companion object {
        private val log = LoggerFactory.getLogger(DeepResearchAgent::class.java)
    }
}