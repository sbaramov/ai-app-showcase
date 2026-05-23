package app.session

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/sessions")
class SessionController(private val sessionService: SessionService) {

    @GetMapping
    fun listSessions(): List<ResearchSessionSummary> = sessionService.listSessions()

    @PatchMapping("/{id}")
    fun renameSession(@PathVariable id: UUID, @RequestBody body: RenameRequest): ResponseEntity<Void> {
        sessionService.renameSession(id, body.name)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/{id}/entries")
    fun getEntries(@PathVariable id: UUID): List<ResearchEntry> = sessionService.getEntries(id)

    data class RenameRequest(val name: String)
}
