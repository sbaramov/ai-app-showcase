package app.dr3

import com.embabel.agent.api.annotation.AchievesGoal
import com.embabel.agent.api.annotation.Action
import com.embabel.agent.api.annotation.Agent
import com.embabel.agent.api.common.OperationContext
import org.springframework.context.annotation.Profile

@Agent(
    name = "Test Deep Research Agent",
    description = "Deterministic stub agent for integration tests."
)
@Profile("test")
class TestDeepResearchAgent {

    @Action
    fun planSearch(userInput: UserResearchRequest, context: OperationContext): WebSearchPlan =
        WebSearchPlan(searches = listOf(WebSearchItem(reason = "test", query = "${userInput.researchTopic} test")))

    @Action
    fun executeSearches(plan: WebSearchPlan, context: OperationContext): SearchSummaryList =
        SearchSummaryList(plan.searches.map { SearchSummary(title = it.query, summary = "stub summary") })

    @Action
    @AchievesGoal(description = "Creates the final deep research report on the given topic")
    fun finalSearchReport(
        userResearchRequest: UserResearchRequest,
        researchResults: SearchSummaryList,
        context: OperationContext
    ): ResearchReport = ResearchReport(
        shortSummary = "Test summary for: ${userResearchRequest.researchTopic}",
        markdownReport = "# Test Report\n${userResearchRequest.researchTopic}",
        followUpQuestions = listOf("Follow up on ${userResearchRequest.researchTopic}?")
    )
}