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

fun parseRawReport(rawText: String): ResearchReport {
    val summaryRegex = Regex("<shortSummary>(.*?)</shortSummary>", RegexOption.DOT_MATCHES_ALL)
    val followUpRegex = Regex("<followUpQuestions>(.*?)</followUpQuestions>", RegexOption.DOT_MATCHES_ALL)

    val shortSummary = summaryRegex.find(rawText)?.groupValues?.get(1)?.trim() ?: ""
    val followUpText = followUpRegex.find(rawText)?.groupValues?.get(1)?.trim() ?: ""

    val followUpQuestions = followUpText.lines()
        .map { it.trim().removePrefix("-").removePrefix("*").trim() }
        .filter { it.isNotEmpty() }
        .takeIf { it.isNotEmpty() }

    // Remove the tags from the markdown content
    val markdownReport = rawText
        .replace(Regex("<shortSummary>.*?</shortSummary>", RegexOption.DOT_MATCHES_ALL), "")
        .replace(Regex("<followUpQuestions>.*?</followUpQuestions>", RegexOption.DOT_MATCHES_ALL), "")
        .trim()

    return ResearchReport(
        shortSummary = shortSummary,
        markdownReport = markdownReport,
        followUpQuestions = followUpQuestions
    )
}

