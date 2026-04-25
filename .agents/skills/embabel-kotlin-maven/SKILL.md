---
name: embabel-kotlin-maven
description: Insights for building Kotlin + Spring Boot + Embabel Agent projects with Maven. Use when working on agent actions, event publishing, or Maven build issues.
---

# Embabel + Kotlin + Maven Insights

## Maven: kotlin-maven-plugin requires explicit executions

Without `compile` and `test-compile` executions the Kotlin compiler is never invoked and the jar contains no classes. Define them in the **parent POM's `<pluginManagement>`** so all modules inherit them:

```xml
<plugin>
    <groupId>org.jetbrains.kotlin</groupId>
    <artifactId>kotlin-maven-plugin</artifactId>
    <version>${kotlin.version}</version>
    <executions>
        <execution>
            <id>compile</id>
            <goals><goal>compile</goal></goals>
        </execution>
        <execution>
            <id>test-compile</id>
            <goals><goal>test-compile</goal></goals>
        </execution>
    </executions>
    ...
</plugin>
```

Child modules that use `spring-boot-starter-parent` as parent inherit these executions automatically (Spring Boot's parent POM already defines them). Custom parent POMs do not — they must define them explicitly.

## Embabel: Publishing progress events from agent actions

Use `context.processContext.onProcessEvent(event)` to publish events from within an `@Action`. The `ProcessContext` multicasts to all listeners registered via `ProcessOptions(listeners = ...)`.

```kotlin
context.processContext.onProcessEvent(
    ProgressUpdateEvent(
        agentProcess = context.agentProcess,
        name = "Searching: ${searchItem.query}",
        current = 1,
        total = 3
    )
)
```

## Embabel: Listening for ProgressUpdateEvent over WebSocket

`OutputChannelHighlightingEventListener` only handles `ToolCallRequestEvent` and `LlmRequestEvent` — it does **not** handle `ProgressUpdateEvent`. Implement a custom `AgenticEventListener`:

```kotlin
class ProgressEventListener(
    private val messagingTemplate: SimpMessagingTemplate
) : AgenticEventListener {
    override fun onProcessEvent(event: AgentProcessEvent) {
        when (event) {
            is ProgressUpdateEvent ->
                messagingTemplate.convertAndSend(
                    "/topic/research/progress",
                    ProgressOutputChannelEvent(
                        processId = event.processId,
                        message = "${event.name} (${event.current}/${event.total})"
                    )
                )
        }
    }
}
```

Register it via `ProcessOptions(listeners = listOf(progressListener))`.

## Embabel: Fan-out from a list inside an agent

Embabel does **not** automatically fan-out from `List<T>` to individual `T` items across separate `@Action` methods. A `Stream<T>` return type does not bridge the gap either — the planner skips actions it cannot connect.

**Solution:** Collapse the fan-out into a single action using `context.parallelMap`:

```kotlin
@Action
fun executeSearches(webSearchPlan: WebSearchPlan, context: OperationContext): SearchSummaryList {
    val summaries = context.parallelMap(
        items = webSearchPlan.searches,
        maxConcurrency = 3
    ) { searchItem ->
        context.ai()
            .withAutoLlm()
            .createObject("Search term: ${searchItem.query}", SearchSummary::class.java)
    }
    return SearchSummaryList(summaries)
}
```

This keeps the data flow visible to the planner as a single `WebSearchPlan → SearchSummaryList` edge.
