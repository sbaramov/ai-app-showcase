package app.session

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.data.jdbc.test.autoconfigure.DataJdbcTest
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureDataSourceInitialization
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers

@DataJdbcTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@AutoConfigureDataSourceInitialization
class ResearchSessionRepositoryTest {

    companion object {
        @Container
        @ServiceConnection
        val postgres = PostgreSQLContainer<Nothing>("postgres:17")
    }

    @Autowired lateinit var sessionRepo: ResearchSessionRepository
    @Autowired lateinit var entryRepo: ResearchEntryRepository

    @Test
    fun `save and find session by id`() {
        val session = sessionRepo.save(ResearchSession(name = "test session"))
        val found = sessionRepo.findById(session.id!!).orElse(null)
        assertNotNull(found)
        assertEquals("test session", found.name)
    }

    @Test
    fun `findBySessionId returns only entries for that session`() {
        val s1 = sessionRepo.save(ResearchSession(name = "s1"))
        val s2 = sessionRepo.save(ResearchSession(name = "s2"))
        entryRepo.save(ResearchEntry(sessionId = s1.id!!, query = "q1", reportJson = "{}"))
        entryRepo.save(ResearchEntry(sessionId = s2.id!!, query = "q2", reportJson = "{}"))

        val entries = entryRepo.findBySessionIdOrderByCreatedAtAsc(s1.id!!)

        assertEquals(1, entries.size)
        assertEquals("q1", entries[0].query)
    }

    @Test
    fun `findAllSummaries returns entry count per session`() {
        val s = sessionRepo.save(ResearchSession(name = "counted"))
        entryRepo.save(ResearchEntry(sessionId = s.id!!, query = "q1", reportJson = "{}"))
        entryRepo.save(ResearchEntry(sessionId = s.id!!, query = "q2", reportJson = "{}"))

        val summaries = sessionRepo.findAllSummaries()
        val summary = summaries.first { it.id == s.id }

        assertEquals(2, summary.entryCount)
    }
}
