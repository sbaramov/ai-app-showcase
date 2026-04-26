package app.dr3

import com.fasterxml.jackson.annotation.JsonPropertyDescription

data class ResearchReport(
    @get:JsonPropertyDescription("A short 2-3 sentence summary of the findings.")
    val shortSummary: String,

    @get:JsonPropertyDescription("The final report in markdown format")
    val markdownReport: String,

    @get:JsonPropertyDescription("An array of strings with suggested topics to research further")
    val followUpQuestions: List<String>?
)
