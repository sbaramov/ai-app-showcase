package app.session

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.Instant
import java.util.UUID

@Table("research_session")
data class ResearchSession(
    @Id val id: UUID? = null,
    val name: String,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)

@Table("research_entry")
data class ResearchEntry(
    @Id val id: UUID? = null,
    val sessionId: UUID,
    val query: String,
    val reportJson: String,
    val createdAt: Instant = Instant.now()
)

data class ResearchSessionSummary(
    val id: UUID,
    val name: String,
    val createdAt: Instant,
    val entryCount: Int
)
