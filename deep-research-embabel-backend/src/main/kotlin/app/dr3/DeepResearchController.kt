package app.dr3

import app.session.SessionService
import com.embabel.agent.api.channel.ProgressOutputChannelEvent
import com.embabel.agent.api.event.AgentProcessEvent
import com.embabel.agent.api.event.AgenticEventListener
import com.embabel.agent.api.event.ProgressUpdateEvent
import com.embabel.agent.api.invocation.AgentInvocation
import com.embabel.agent.core.AgentPlatform
import com.embabel.agent.core.ProcessOptions
import org.slf4j.LoggerFactory
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Controller
import java.util.UUID
import java.util.concurrent.CompletableFuture

@Controller
class DeepResearchController(
    private val agentPlatform: AgentPlatform,
    private val messagingTemplate: SimpMessagingTemplate,
    private val sessionService: SessionService
) {

    @MessageMapping("/research")
    fun handleResearchRequest(request: ResearchRequestMessage): CompletableFuture<ResearchReport> {
        log.info("Received research request for topic: {}", request.researchTopic)

        val session = if (request.sessionId == null) {
            sessionService.createSession(request.researchTopic)
        } else {
            null // existing session — no creation needed
        }
        val sessionId = request.sessionId ?: session!!.id!!

        val future = AgentInvocation
            .create(agentPlatform, ResearchReport::class.java)
            .withProcessOptions(ProcessOptions(listeners = listOf(ProgressEventListener(messagingTemplate))))
            .invokeAsync(UserResearchRequest(request.researchTopic))

        future.thenApply { report ->
            sessionService.addEntry(sessionId, request.researchTopic, report)
            messagingTemplate.convertAndSend("/topic/research/result", ResearchResultMessage(sessionId, report))
        }

        return future
    }

    private class ProgressEventListener(
        private val messagingTemplate: SimpMessagingTemplate
    ) : AgenticEventListener {
        override fun onProcessEvent(event: AgentProcessEvent) {
            if (event is ProgressUpdateEvent) {
                messagingTemplate.convertAndSend(
                    "/topic/research/progress",
                    ProgressOutputChannelEvent(
                        processId = event.processId,
                        message = "${event.name} (${event.current}/${event.total})"
                    )
                )
            }
        }
    }

    data class ResearchRequestMessage(
        val researchTopic: String = "",
        val sessionId: UUID? = null
    )

    data class ResearchResultMessage(
        val sessionId: UUID,
        val report: ResearchReport
    )

    companion object {
        private val log = LoggerFactory.getLogger(DeepResearchController::class.java)
    }
}
