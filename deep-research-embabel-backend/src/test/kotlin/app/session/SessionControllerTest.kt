package app.session

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import io.mockk.justRun
import io.mockk.verify
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.patch
import org.springframework.test.web.servlet.put
import org.springframework.test.web.servlet.delete
import java.time.Instant
import java.util.UUID

@WebMvcTest(SessionController::class)
class SessionControllerTest {

    @Autowired lateinit var mockMvc: MockMvc
    @Autowired lateinit var objectMapper: ObjectMapper
    @MockkBean lateinit var sessionService: SessionService

    @Test
    fun `GET sessions returns list`() {
        val id = UUID.randomUUID()
        every { sessionService.listSessions() } returns listOf(
            ResearchSessionSummary(id = id, name = "Test", pinned = false, createdAt = Instant.now(), entryCount = 2)
        )

        mockMvc.get("/api/sessions").andExpect {
            status { isOk() }
            jsonPath("$[0].name") { value("Test") }
            jsonPath("$[0].entryCount") { value(2) }
        }
    }

    @Test
    fun `PATCH sessions renames session`() {
        val id = UUID.randomUUID()
        justRun { sessionService.renameSession(id, "new name") }

        mockMvc.patch("/api/sessions/$id") {
            contentType = MediaType.APPLICATION_JSON
            content = objectMapper.writeValueAsString(mapOf("name" to "new name"))
        }.andExpect { status { isOk() } }

        verify { sessionService.renameSession(id, "new name") }
    }

    @Test
    fun `GET session entries returns entries`() {
        val sessionId = UUID.randomUUID()
        every { sessionService.getEntries(sessionId) } returns listOf(
            ResearchEntry(id = UUID.randomUUID(), sessionId = sessionId, query = "test query", reportJson = "{}", createdAt = Instant.now())
        )

        mockMvc.get("/api/sessions/$sessionId/entries").andExpect {
            status { isOk() }
            jsonPath("$[0].query") { value("test query") }
        }
    }

    @Test
    fun `PUT pin toggles pinned status`() {
        val id = UUID.randomUUID()
        justRun { sessionService.pinSession(id, true) }

        mockMvc.put("/api/sessions/$id/pin?pinned=true").andExpect {
            status { isOk() }
        }

        verify { sessionService.pinSession(id, true) }
    }

    @Test
    fun `DELETE session marks it for deletion`() {
        val id = UUID.randomUUID()
        justRun { sessionService.markSessionForDeletion(id, true) }

        mockMvc.delete("/api/sessions/$id").andExpect {
            status { isOk() }
        }

        verify { sessionService.markSessionForDeletion(id, true) }
    }

    @Test
    fun `PUT restore unmarks session for deletion`() {
        val id = UUID.randomUUID()
        justRun { sessionService.markSessionForDeletion(id, false) }

        mockMvc.put("/api/sessions/$id/restore").andExpect {
            status { isOk() }
        }

        verify { sessionService.markSessionForDeletion(id, false) }
    }
}
