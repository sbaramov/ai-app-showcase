# Agents Instructions

A backend component/server provide a deep research functionality. 

## Key Functional Decisions
**Tech stack:** Kotlin 2.3, Spring Boot 3.5, Spring Shell 3.4, Spring Cloud 2025.0.x, Embabel Agent 0.3.x, JUnit 5

## Build / Test / Run Commands
- Always use `mvn verify` to run tests.
- Always use `mvn clean` when a file has been deleted or renamed

## Code Style

### Language & Formatting
- **Kotlin only** — no Java source files.
- Use **official Kotlin code style** (`kotlin.code.style=official`).
- **4-space indentation**, no tabs.
- **No wildcard imports** — import each class explicitly.
- **No trailing whitespace**; one blank line between top-level declarations.

### Naming Conventions
- **Classes / interfaces / objects**: `PascalCase` (e.g., `TavilyClient`, `SearchQuery`).
- **Functions / properties / variables**: `camelCase` (e.g., `quickSearch`, `maxResults`).
- **Constants / enum values**: `UPPER_SNAKE_CASE` (e.g., `SearchDepth.BASIC`).
- **Packages**: lowercase with dots, matching module purpose:
  - Client: `org.baramov.search.tavily`
  - CLI: `app`
  - Deep search: `app.domain`, `app.dr3`, `app.api`

### Types & Data Modeling
- Prefer **`data class`** for DTOs and value objects.
- Use **`val`** (immutable) by default; `var` only when state must mutate.
- Use **nullable types** (`String?`) for optional fields; avoid `!!` — use `?.let {}` or `?:`.
- Use **sealed classes / enums** for closed sets of values (e.g., `SearchDepth`).
- Jackson annotations (`@JsonValue`, `@JsonIgnoreProperties`) on DTOs for JSON mapping.
- Follow Domain Driven Design, structure packages by domain.

### Documentation
- **KDoc** on all public classes, data class properties, and non-trivial functions.
- Include `@property` tags for data class fields.
- Example JSON in KDoc is encouraged for API response models.
- Use Swagger annotations for REST controller classes.

### Dependency Injection & Spring
- Use **constructor injection** (no `@Autowired` on fields).
- Spring components: `@ShellComponent`, `@FeignClient`, `@Configuration`, `@RestController`.
- Keep CLI commands in `@ShellCommandGroup` groups with `@ShellMethod` descriptions.

### Embabel Agent Framework
- Use `@Agent` annotation for agent classes, `@Action` for individual steps.
- Use `@AchievesGoal` to mark the action that completes the agent's goal.
- Inject `Autonomy` for goal-based agent execution: `autonomy.chooseAndRunAgent(intent, ProcessOptions())`.
- Get results via `process.resultOfType(T::class.java)`.
- Use `context.ai().withLlm("ollama/gemma3:12b").createObject(prompt, T::class.java)` for structured LLM output.
- Use `T::class.java` (not `T::class`) when passing `Class<T>` to Embabel APIs.

### Error Handling
- Let Spring / OpenFeign propagate HTTP errors; do not swallow exceptions.
- Use Kotlin's type system (nullable returns, `Result<T>`) where appropriate.
- No raw `try/catch` blocks unless handling a specific recoverable case.

### Testing
- **JUnit 5** (`org.junit.jupiter.api.Test`) + `kotlin-test-junit5`.
- Use `@SpringBootTest` for context-loading tests.
- Test class names: `<ClassName>Tests` (e.g., `TavilySearchCliApplicationTests`).
- Test method names: descriptive, `camelCase` (e.g., `contextLoads`).

### Git & Commits
- Commit messages: imperative mood, concise (e.g., `Add extract endpoint to TavilyClient`).
- Do not commit secrets; use `etc/.env.properties` (see `.env.properties.example`).

