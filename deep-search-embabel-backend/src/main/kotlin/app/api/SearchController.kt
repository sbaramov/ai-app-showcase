package app.api

import app.domain.DeepSearchResult
import app.domain.SearchRequest
import com.embabel.agent.api.common.autonomy.AgentProcessExecution
import com.embabel.agent.api.common.autonomy.Autonomy
import com.embabel.agent.core.ProcessOptions
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/search")
class SearchController(
    private val autonomy: Autonomy
) {

    @PostMapping("/deep")
    fun deepSearch(@RequestBody request: SearchRequest): DeepSearchResult {
        val execution: AgentProcessExecution = autonomy.chooseAndRunAgent(
            intent = "Complete deep search with synthesized answer and sources",
            processOptions = ProcessOptions(),
        )
        return execution.agentProcess.resultOfType(DeepSearchResult::class.java)
            ?: DeepSearchResult(
                query = request.query,
                summary = "Search completed without result.",
                sources = emptyList(),
                iterations = 0,
                confidence = 0.0
            )
    }
}
