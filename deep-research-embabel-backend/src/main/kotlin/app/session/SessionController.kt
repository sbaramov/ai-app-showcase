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
    fun renameSession(@PathVariable id: UUID, @RequestBody body: RenameRequest): ResponseEntity<Unit> {
        sessionService.renameSession(id, body.name)
        return ResponseEntity.ok().build()
    }

    @PutMapping("/{id}/pin")
    fun pinSession(@PathVariable id: UUID, @RequestParam pinned: Boolean): ResponseEntity<Unit> {
        sessionService.pinSession(id, pinned)
        return ResponseEntity.ok().build()
    }

    @DeleteMapping("/{id}")
    fun deleteSession(@PathVariable id: UUID): ResponseEntity<Unit> {
        sessionService.markSessionForDeletion(id, true)
        return ResponseEntity.ok().build()
    }

    @PutMapping("/{id}/restore")
    fun restoreSession(@PathVariable id: UUID): ResponseEntity<Unit> {
        sessionService.markSessionForDeletion(id, false)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/{id}/entries")
    fun getEntries(@PathVariable id: UUID): List<ResearchEntry> = sessionService.getEntries(id)

    data class RenameRequest(val name: String)
}
