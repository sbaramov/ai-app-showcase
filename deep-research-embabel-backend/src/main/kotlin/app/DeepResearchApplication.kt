package app

import org.baramov.search.tavily.TavilyClientConfig
import org.baramov.search.tavily.TavilySearchService
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients
import org.springframework.cloud.openfeign.FeignClient

import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableFeignClients(clients = [TavilyClient::class])
@EnableConfigurationProperties(AppProperties::class)
@EnableScheduling
class DeepResearchApplication

fun main(args: Array<String>) {
    runApplication<DeepResearchApplication>(*args)
}

@FeignClient(
    name = "tavily",
    configuration = [TavilyClientConfig::class]
)
interface TavilyClient : TavilySearchService
