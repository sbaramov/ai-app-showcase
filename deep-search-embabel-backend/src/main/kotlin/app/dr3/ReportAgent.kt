package app.dr3

import com.embabel.agent.api.annotation.Action
import com.embabel.agent.api.annotation.Agent
import com.embabel.agent.api.common.OperationContext
import com.fasterxml.jackson.annotation.JsonPropertyDescription
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@Agent(name = "ReportAgent", description = "Creates file search report")
class ReportAgent {
    private final val systemPrompt: String = """
            You are a senior researcher tasked with writing a cohesive report for a research query. 
            You will be provided with the original query, and some initial research done by a research assistant.\n
    
            You should first come up with an outline for the report that describes the structure and 
            flow of the report. Then, generate the report and return that as your final output.\n
            
            The final output should be in markdown format, and it should be lengthy and detailed. Aim 
            for 5-10 pages of content, at least 1000 words.
        """.trimIndent()

    @Action
    fun finalSearchReport(
        userResearchRequest: UserResearchRequest,
        researchResults: SearchSummaryList,
        context: OperationContext
    ): ResearchReport {
        val researchResultsText = researchResults.results.joinToString("\n---\n")
        val prompt =
            "Original query: $${userResearchRequest.researchTopic}\nSummarized search results: \n${researchResultsText}"

        log.info("Summarizing research")
        return context.ai()
            .withLlm(LLModelId.REPORT.modelId)
            .withSystemPrompt(systemPrompt)
            .createObject(
                prompt,
                ResearchReport::class.java
            )
    }

    companion object {
        val log: Logger = LoggerFactory.getLogger(ReportAgent::class.java)
    }
}

data class ResearchReport(
    @get:JsonPropertyDescription("A short 2-3 sentence summary of the findings.")
    val shortSummary: String,

    @get:JsonPropertyDescription("The final report in markdown format")
    val markdownReport: String,

    @get:JsonPropertyDescription("An array of strings with suggested topics to research further")
    val followUpQuestions: List<String>?
)
