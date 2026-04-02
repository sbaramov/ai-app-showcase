package org.baramov.search.tavily

import org.springframework.cloud.openfeign.EnableFeignClients
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.PropertySource

@Configuration
@EnableFeignClients(clients = [TavilyClient::class])
@PropertySource("classpath:tavily-client-defaults.properties")
class TavilyClientAutoConfiguration {
}
