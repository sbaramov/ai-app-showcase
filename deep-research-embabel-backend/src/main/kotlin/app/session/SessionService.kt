package app.session

import app.dr3.ResearchReport
import tools.jackson.databind.ObjectMapper
import org.springframework.stereotype.Service
import java.time.Instant
import java.util.UUID

import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.annotation.Transactional

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
            ResearchSessionSummary(id = it.id, name = it.name, pinned = it.pinned, createdAt = it.createdAt, entryCount = it.entryCount)
        }

    @Transactional
    fun renameSession(id: UUID, name: String) {
        val session = sessionRepo.findById(id).orElseThrow { NoSuchElementException("Session $id not found") }
        sessionRepo.save(session.copy(name = name, updatedAt = Instant.now()))
    }

    @Transactional
    fun pinSession(id: UUID, pinned: Boolean) {
        val session = sessionRepo.findById(id).orElseThrow { NoSuchElementException("Session $id not found") }
        sessionRepo.save(session.copy(pinned = pinned, updatedAt = Instant.now()))
    }

    @Transactional
    fun markSessionForDeletion(id: UUID, marked: Boolean) {
        val session = sessionRepo.findById(id).orElseThrow { NoSuchElementException("Session $id not found") }
        sessionRepo.save(session.copy(markedForDeletion = marked, updatedAt = Instant.now()))
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    fun deleteMarkedSessions() {
        val cutoff = Instant.now().minusSeconds(10)
        sessionRepo.deleteByMarkedForDeletionTrueAndUpdatedAtBefore(cutoff)
    }

    fun addEntry(sessionId: UUID, query: String, report: ResearchReport): ResearchEntry =
        entryRepo.save(ResearchEntry(sessionId = sessionId, query = query, reportJson = objectMapper.writeValueAsString(report)))

    fun getEntries(sessionId: UUID): List<ResearchEntry> =
        entryRepo.findBySessionIdOrderByCreatedAtAsc(sessionId)
}
