package app.dr3

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class DeepResearchAgentTest {

    @Test
    fun `parseRawReport parses valid XML-like tags and removes them from markdown`() {
        val rawText = """
            <shortSummary>
            This is a summary of findings.
            It spans two lines.
            </shortSummary>
            
            <followUpQuestions>
            - What is the next step?
            - How does it scale?
            </followUpQuestions>
            
            # Detailed Report
            Here is the rest of the report with some "quotes" and *formatting*.
        """.trimIndent()

        val report = parseRawReport(rawText)

        assertEquals("This is a summary of findings.\nIt spans two lines.", report.shortSummary)
        assertEquals(listOf("What is the next step?", "How does it scale?"), report.followUpQuestions)
        assertEquals("# Detailed Report\nHere is the rest of the report with some \"quotes\" and *formatting*.", report.markdownReport)
    }

    @Test
    fun `parseRawReport handles missing tags gracefully`() {
        val rawText = """
            # Report without tags
            Just markdown text.
        """.trimIndent()

        val report = parseRawReport(rawText)

        assertEquals("", report.shortSummary)
        assertNull(report.followUpQuestions)
        assertEquals("# Report without tags\nJust markdown text.", report.markdownReport)
    }
}
