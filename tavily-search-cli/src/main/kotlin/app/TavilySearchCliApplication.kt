package app

import org.baramov.search.tavily.TavilyClientConfig
import org.baramov.search.tavily.TavilySearchService
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients
import org.springframework.cloud.openfeign.FeignClient

@SpringBootApplication
@EnableFeignClients(clients = [TavilyClient::class])
class TavilySearchCliApplication

fun main(args: Array<String>) {
    runApplication<TavilySearchCliApplication>(*args)
}

@FeignClient(
    name = "tavily",
    configuration = [TavilyClientConfig::class]
)
interface TavilyClient : TavilySearchService