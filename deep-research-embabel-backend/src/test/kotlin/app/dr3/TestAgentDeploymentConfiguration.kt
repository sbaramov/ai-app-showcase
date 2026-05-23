package app.dr3

import com.embabel.agent.api.annotation.support.AgentMetadataReader
import com.embabel.agent.core.AgentPlatform
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import jakarta.annotation.PostConstruct

/**
 * Embabel's [com.embabel.agent.spi.support.DelegatingAgentScanningBeanPostProcessor]
 * and [com.embabel.agent.spi.support.AgentScanningPostProcessorDelegate] are
 * annotated with @Profile("!test"), so they are disabled when the "test" profile
 * is active. This configuration replicates their behaviour for the test-scoped
 * [TestDeepResearchAgent] so that it is still deployed to the [AgentPlatform].
 */
@Configuration
@Profile("test")
class TestAgentDeploymentConfiguration(
    private val testDeepResearchAgent: TestDeepResearchAgent,
    private val agentPlatform: AgentPlatform
) {

    @PostConstruct
    fun deployTestAgent() {
        val reader = AgentMetadataReader()
        reader.createAgentMetadata(testDeepResearchAgent)?.let { agentPlatform.deploy(it) }
    }
}
