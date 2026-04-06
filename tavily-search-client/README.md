# tavily-search-client

Reusable Spring Cloud OpenFeign client library for the [Tavily Search API](https://tavily.com).

## What's included

- `TavilySearchService` — interface declaring `search`, `quickSearch`, and `extract` endpoints
- `TavilyClientConfig` — Feign configuration that maps fields to/from snake_case JSON
- DTOs: `SearchQuery`, `QuickSearchQuery`, `SearchResult`, `ExtractQuery`, `ExtractResult`, and supporting types
- Enums: `SearchDepth` (`BASIC`, `FAST`, `ADVANCED`, `ULTRA_FAST`), `ExtractDepth`, `ExtractFormat`

## Setup

### 1. Add the dependency

```xml
<dependency>
    <groupId>org.baramov</groupId>
    <artifactId>tavily-search-client</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

You also need `spring-cloud-starter-openfeign` on the classpath.

### 2. Declare a Feign client

Extend `TavilySearchService` and annotate with `@FeignClient`. The `name` must match the key used in `application.yaml` (see step 3). Pass `TavilyClientConfig` as the configuration to enable snake_case JSON mapping.

```kotlin
@FeignClient(
    name = "tavily",
    configuration = [TavilyClientConfig::class]
)
interface TavilyClient : TavilySearchService
```

### 3. Enable Feign clients

```kotlin
@SpringBootApplication
@EnableFeignClients(clients = [TavilyClient::class])
class MyApplication
```

### 4. Configure `application.yaml`

The client name (`tavily`) under `spring.cloud.openfeign.client.config` must match the `name` in `@FeignClient`.

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          tavily:
            url: "https://api.tavily.com"
            connect-timeout: 5000       # ms, time to establish connection
            read-timeout: 10000         # ms, time to wait for a response
            default-request-headers:
              Authorization: "Bearer ${TAVILY_API_KEY}"
```

`TAVILY_API_KEY` must be set as an environment variable or provided via a properties file (e.g. `etc/.env.properties`).

## Usage

Inject `TavilyClient` and call the desired method:

```kotlin
// Full search with options
val result: SearchResult = tavilyClient.search(
    SearchQuery(query = "Kotlin coroutines", searchDepth = SearchDepth.ADVANCED, maxResults = 10)
)

// Quick search with defaults
val result: SearchResult = tavilyClient.quickSearch(QuickSearchQuery(query = "Spring Boot 3"))

// Extract content from URLs
val result: ExtractResult = tavilyClient.extract(
    ExtractQuery(urls = "https://example.com")
)
```

`SearchResult.results` contains ranked `SearchResultItem` entries with `title`, `url`, `content`, and `score`.
`SearchResult.answer` is populated only when `includeAnswer` is set in `SearchQuery`.
