package app.session

import org.springframework.data.jdbc.repository.query.Modifying
import org.springframework.data.jdbc.repository.query.Query
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.query.Param
import java.time.Instant
import java.util.UUID

interface ResearchSessionRepository : CrudRepository<ResearchSession, UUID> {
    @Query("SELECT id, name, pinned, created_at, updated_at, (SELECT COUNT(*) FROM research_entry e WHERE e.session_id = s.id) AS entry_count FROM research_session s WHERE s.marked_for_deletion = FALSE ORDER BY s.pinned DESC, s.created_at DESC")
    fun findAllSummaries(): List<ResearchSessionSummaryRow>

    @Modifying
    @Query("DELETE FROM research_session WHERE marked_for_deletion = TRUE AND updated_at < :time")
    fun deleteByMarkedForDeletionTrueAndUpdatedAtBefore(@Param("time") time: Instant)
}

data class ResearchSessionSummaryRow(
    val id: UUID,
    val name: String,
    val pinned: Boolean,
    val createdAt: Instant,
    val entryCount: Int
)
