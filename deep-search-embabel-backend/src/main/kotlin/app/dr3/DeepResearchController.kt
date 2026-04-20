package app.dr3

import com.embabel.agent.api.channel.OutputChannel
import com.embabel.agent.api.channel.OutputChannelEvent
import com.embabel.agent.api.event.progress.OutputChannelHighlightingEventListener
import com.embabel.agent.api.invocation.AgentInvocation
import com.embabel.agent.core.AgentPlatform
import com.embabel.agent.core.ProcessOptions
import org.slf4j.LoggerFactory
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.SendTo
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

        // Progress listener sends intermediate events to a specific topic
        val progressListener = OutputChannelHighlightingEventListener(object : OutputChannel {
            override fun send(event: OutputChannelEvent) {
                messagingTemplate.convertAndSend("/topic/research/progress", event)
            }
        })

        // TODO val resultType = ResearchReport::class.java
        val resultType = WebSearchPlan::class.java

        val researchReportNext = AgentInvocation
            .create(agentPlatform, resultType)
            .withProcessOptions(ProcessOptions(listeners = listOf(progressListener)))
            .invokeAsync(UserResearchRequest(request.researchTopic, 3)) // TODO Parameterize this

        // When finished, send the final report to the result topic
        researchReportNext.thenApply { researchReport ->
            messagingTemplate.convertAndSend("/topic/research/result", researchReport)
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
