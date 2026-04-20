package app.dr3

import com.embabel.agent.api.annotation.Action
import com.embabel.agent.api.annotation.Agent
import com.embabel.agent.api.common.OperationContext
import org.slf4j.LoggerFactory
import java.util.*


@Agent(name = "PlanningAgent", description = "Agent that is planning a deep research query")
class PlanningAgent {

    private final val systemPrompt = """
                You are a helpful research assistant. Given a query, come up with a set of web searches
                to perform to best answer the query.
                """.trimIndent()

    @Action
    fun planSearch(userInput: UserResearchRequest, context: OperationContext): WebSearchPlan {
        context.bind("research_id", UUID.randomUUID().toString())
        log.info("Starting to plan a research on: '${userInput.researchTopic}'")
        return context.ai()
            .withLlm(LLModelId.PLAN.modelId)
            .withSystemPrompt(systemPrompt)
            .createObject(
                """
                Generate up to ${userInput.maxSearchPerQuery} search queries 
                on this research topic: ${userInput.researchTopic} 
                """.trimIndent(),
                WebSearchPlan::class.java
            )
    }

    companion object {
        private val log = LoggerFactory.getLogger(PlanningAgent::class.java)
    }
}

data class UserResearchRequest(val researchTopic: String, val maxSearchPerQuery: Int)

data class WebSearchItem(val reason: String, val query: String)

data class WebSearchPlan(val searches: List<WebSearchItem>)