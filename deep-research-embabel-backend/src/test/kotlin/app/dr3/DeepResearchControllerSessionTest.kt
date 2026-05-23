package app.dr3

import app.dr3.DeepResearchController.ResearchRequestMessage
import app.session.ResearchEntry
import app.session.ResearchSession
import app.session.SessionService
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.test.context.ActiveProfiles
import java.util.UUID

@SpringBootTest
@ActiveProfiles("test")
class DeepResearchControllerSessionTest {

    @Autowired lateinit var controller: DeepResearchController
    @MockkBean lateinit var sessionService: SessionService
    @MockkBean(relaxed = true) lateinit var messagingTemplate: SimpMessagingTemplate

    @Test
    fun `null sessionId creates new session and persists report`() {
        val newSession = ResearchSession(id = UUID.randomUUID(), name = "test topic")
        every { sessionService.createSession("test topic") } returns newSession
        val reportSlot = slot<ResearchReport>()
        every { sessionService.addEntry(newSession.id!!, "test topic", capture(reportSlot)) } returns mockk<ResearchEntry>()

        controller.handleResearchRequest(
            ResearchRequestMessage(researchTopic = "test topic", sessionId = null)
        ).get()

        verify { sessionService.createSession("test topic") }
        verify { sessionService.addEntry(newSession.id!!, "test topic", any()) }
        assertEquals("Test summary for: test topic", reportSlot.captured.shortSummary)
    }

    @Test
    fun `existing sessionId skips session creation and appends entry`() {
        val existingId = UUID.randomUUID()
        every { sessionService.addEntry(existingId, "follow up", any()) } returns mockk<ResearchEntry>()

        controller.handleResearchRequest(
            ResearchRequestMessage(researchTopic = "follow up", sessionId = existingId)
        ).get()

        verify(exactly = 0) { sessionService.createSession(any()) }
        verify { sessionService.addEntry(existingId, "follow up", any()) }
    }
}
