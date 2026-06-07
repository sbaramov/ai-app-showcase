package app

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = [
    "embabel.observability.enabled=false",
    "management.langfuse.enabled=false"
])
class DeepResearchApplicationTests {

    @Test
    fun contextLoads() {
    }
}
