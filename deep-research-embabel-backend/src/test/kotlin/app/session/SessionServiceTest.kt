package app.session

import app.dr3.ResearchReport
import com.fasterxml.jackson.databind.ObjectMapper
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.util.Optional
import java.util.UUID

class SessionServiceTest {

    private val sessionRepo = mockk<ResearchSessionRepository>()
    private val entryRepo = mockk<ResearchEntryRepository>()
    private val service = SessionService(sessionRepo, entryRepo, ObjectMapper())

    @Test
    fun `createSession truncates name to 60 chars`() {
        val saved = slot<ResearchSession>()
        every { sessionRepo.save(capture(saved)) } answers { saved.captured }

        service.createSession("a".repeat(80))

        assertEquals(60, saved.captured.name.length)
    }

    @Test
    fun `createSession uses full query when shorter than 60 chars`() {
        val saved = slot<ResearchSession>()
        every { sessionRepo.save(capture(saved)) } answers { saved.captured }

        service.createSession("short query")

        assertEquals("short query", saved.captured.name)
    }

    @Test
    fun `renameSession updates name`() {
        val id = UUID.randomUUID()
        every { sessionRepo.findById(id) } returns Optional.of(ResearchSession(id = id, name = "old"))
        val saved = slot<ResearchSession>()
        every { sessionRepo.save(capture(saved)) } answers { saved.captured }

        service.renameSession(id, "new name")

        assertEquals("new name", saved.captured.name)
    }

    @Test
    fun `renameSession throws when session not found`() {
        val id = UUID.randomUUID()
        every { sessionRepo.findById(id) } returns Optional.empty()

        assertThrows(NoSuchElementException::class.java) {
            service.renameSession(id, "new name")
        }
    }

    @Test
    fun `addEntry saves entry with correct sessionId and query`() {
        val sessionId = UUID.randomUUID()
        val report = ResearchReport(shortSummary = "s", markdownReport = "m", followUpQuestions = null)
        val saved = slot<ResearchEntry>()
        every { entryRepo.save(capture(saved)) } answers { saved.captured }

        service.addEntry(sessionId, "my query", report)

        assertEquals(sessionId, saved.captured.sessionId)
        assertEquals("my query", saved.captured.query)
    }

    @Test
    fun `getEntries delegates to repository`() {
        val sessionId = UUID.randomUUID()
        every { entryRepo.findBySessionIdOrderByCreatedAtAsc(sessionId) } returns emptyList()

        service.getEntries(sessionId)

        verify { entryRepo.findBySessionIdOrderByCreatedAtAsc(sessionId) }
    }
}
