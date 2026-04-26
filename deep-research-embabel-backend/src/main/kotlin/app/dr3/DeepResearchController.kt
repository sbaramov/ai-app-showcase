package app.dr3

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

/**
 * Controller for deep research using STOMP over WebSockets.
 */
@Controller
class DeepResearchController(
    private val agentPlatform: AgentPlatform,
    private val messagingTemplate: SimpMessagingTemplate
) {

    @MessageMapping("/research")
    fun handleResearchRequest(request: ResearchRequestMessage) {
        log.info("Received research request for topic: {}", request.researchTopic)

        val progressListener = ProgressEventListener(messagingTemplate)

        val resultType = ResearchReport::class.java

        val researchReportNext = AgentInvocation
            .create(agentPlatform, resultType)
            .withProcessOptions(ProcessOptions(listeners = listOf(progressListener)))
            .invokeAsync(UserResearchRequest(request.researchTopic))

        // When finished, send the final report to the result topic
        researchReportNext.thenApply { researchReport ->
            messagingTemplate.convertAndSend("/topic/research/result", researchReport)
        }
    }

    /**
     * Event listener that forwards progress updates to WebSocket clients.
     */
    private class ProgressEventListener(
        private val messagingTemplate: SimpMessagingTemplate
    ) : AgenticEventListener {

        override fun onProcessEvent(event: AgentProcessEvent) {
            when (event) {
                is ProgressUpdateEvent -> {
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
    }

    /**
     * Data class for incoming research requests via STOMP.
     */
    data class ResearchRequestMessage(
        val researchTopic: String = ""
    )

    companion object {
        private val log = LoggerFactory.getLogger(DeepResearchController::class.java)
    }
}
