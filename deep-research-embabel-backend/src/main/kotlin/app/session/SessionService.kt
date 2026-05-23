package app.session

import app.dr3.ResearchReport
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

@Service
class SessionService(
    private val sessionRepo: ResearchSessionRepository,
    private val entryRepo: ResearchEntryRepository,
    private val objectMapper: ObjectMapper
) {
    fun createSession(query: String): ResearchSession =
        sessionRepo.save(ResearchSession(name = query.take(60)))

    fun listSessions(): List<ResearchSessionSummary> =
        sessionRepo.findAllSummaries().map {
            ResearchSessionSummary(id = it.id, name = it.name, createdAt = it.createdAt, entryCount = it.entryCount)
        }

    fun renameSession(id: UUID, name: String) {
        val session = sessionRepo.findById(id).orElseThrow { NoSuchElementException("Session $id not found") }
        sessionRepo.save(session.copy(name = name, updatedAt = Instant.now()))
    }

    fun addEntry(sessionId: UUID, query: String, report: ResearchReport): ResearchEntry =
        entryRepo.save(ResearchEntry(sessionId = sessionId, query = query, reportJson = objectMapper.writeValueAsString(report)))

    fun getEntries(sessionId: UUID): List<ResearchEntry> =
        entryRepo.findBySessionIdOrderByCreatedAtAsc(sessionId)
}
