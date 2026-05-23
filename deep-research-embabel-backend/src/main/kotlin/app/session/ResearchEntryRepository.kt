package app.session

import org.springframework.data.repository.CrudRepository
import java.util.UUID

interface ResearchEntryRepository : CrudRepository<ResearchEntry, UUID> {
    fun findBySessionIdOrderByCreatedAtAsc(sessionId: UUID): List<ResearchEntry>
}
