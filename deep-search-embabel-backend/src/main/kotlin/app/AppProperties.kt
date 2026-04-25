package app

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app")
data class AppProperties(
    val systemPrompts: SystemPrompts = SystemPrompts()
) {
    data class SystemPrompts(
        val plan: String = "",
        val search: String = "",
        val report: String = ""
    )
}