package org.baramov.search.tavily

import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.databind.json.JsonMapper
import org.springframework.context.annotation.Bean
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter

/**
 * A helper class used when configuration a FeignClient with Spring Cloud OpenFeign.
 * For example:
 * ```kotlin
 * @FeignClient(
 *     name = "tavily",
 *     configuration = [TavilyClientConfig::class]
 * )
 * interface TavilyClient : TavilySearchService
 * ```
 * The class customizes the JSON Converter to use the notation of snake case.
 */
open class TavilyClientConfig {

    /** Change the field mapping to snake case. */
    @Bean
    open fun tavilyJson2HttpMessageConverter(): MappingJackson2HttpMessageConverter {
        // renamed to JacksonJsonHttpMessageConverter in Spring Boot 4
        val mapper = JsonMapper.builder()
            .findAndAddModules()
            .propertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE)
            .build()
        return MappingJackson2HttpMessageConverter(mapper)
    }
}