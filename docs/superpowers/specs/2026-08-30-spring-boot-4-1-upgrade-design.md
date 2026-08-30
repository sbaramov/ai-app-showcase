# Design Specification: Spring Boot 4.1 & Ecosystem Upgrade

- **Date**: 2026-08-30
- **Status**: Draft / Under Review
- **Target Version Baseline**:
  - Spring Boot: `4.1.1`
  - Spring Cloud: `2025.1.3`
  - Spring Shell: `4.0.3`
  - Embabel Agent Framework: `1.5.1`
  - SpringMockK: `5.0.1`

---

## 1. Overview & Goals

The goal of this upgrade is to modernize the multi-component mono-repository to **Spring Boot 4.1.1** along with its compatible Spring and Embabel ecosystem dependencies.

### Target Ecosystem Version Matrix

| Dependency / BOM | Current Version | Target Version | Repository / Provenance |
|---|---|---|---|
| `spring-boot-dependencies` | `3.5.16` | `4.1.1` | Maven Central |
| `spring-cloud-dependencies` | `2025.0.3` | `2025.1.3` | Maven Central |
| `spring-shell-dependencies` | `3.4.3` | `4.0.3` | Maven Central |
| `embabel-agent-dependencies` / starters | `1.0.0` | `1.5.1` | Maven Central / Embabel Artifactory |
| `springmockk` | `4.0.2` | `5.0.1` | Maven Central |

---

## 2. Module Impacts & Migration Architecture

### 2.1 Root Project (`pom.xml`)
- Update `<properties>` block:
  - `<spring-boot.version>4.1.1</spring-boot.version>`
  - `<spring-cloud.version>2025.1.3</spring-cloud.version>`
  - `<spring-shell.version>4.0.3</spring-shell.version>`
  - `<embabel-agent.version>1.5.1</embabel-agent.version>`
- Update test dependency management:
  - `<springmockk.version>5.0.1</springmockk.version>` in `deep-research-embabel-backend/pom.xml`

### 2.2 `tavily-search-client`
- Pure Kotlin library with Spring Web / Spring Context / Jackson.
- Verify that standard HTTP client & Jackson Kotlin bindings remain fully binary and source compatible under Spring Framework 7 / Spring Boot 4.1 runtime.
- Run unit test suite: `TavilySearchClientTest`.

### 2.3 `tavily-search-cli`
- Upgrades to `spring-shell-starter` `4.0.3` and `spring-cloud-starter-openfeign` `2025.1.3`.
- Verify command registrations, interactive prompt behavior, and Feign client interface bindings.
- Validate `spring-shell-starter-test` interactions.

### 2.4 `deep-research-embabel-backend`
- Core service utilizing:
  - `embabel-agent-starter` & `embabel-agent-starter-ollama` (`1.5.1`)
  - `embabel-agent-starter-observability` (`1.5.1`)
  - `spring-boot-starter-data-jdbc`, `postgresql`, `flyway-database-postgresql`
  - `spring-boot-starter-web`, `spring-boot-starter-websocket`, `spring-boot-starter-actuator`
  - `spring-boot-testcontainers`, `mockk-jvm`, `springmockk` (`5.0.1`)
- Verify compatibility of:
  - Embabel Agent actions, event publishers, and LLM provider bindings with Spring 7 / Boot 4.1.
  - Micrometer Observation -> OpenTelemetry bridge and tracing export.
  - Spring Data JDBC repository interfaces, scheduled tasks, and database migrations.
  - WebSocket broker message handling (`SimpleBrokerMessageHandler`).

---

## 3. Testing & Verification Strategy

1. **Compilation Check**:
   - `mvn clean compile` across all reactor modules to detect any deprecated or removed APIs.
2. **Unit & Slice Tests**:
   - Run unit tests for `tavily-search-client` and `tavily-search-cli`.
   - Run MockK/SpringMockK unit and slice tests for `deep-research-embabel-backend`.
3. **Integration Tests with Testcontainers**:
   - Run repository and application context integration tests (`DeepResearchApplicationTests`, `SessionServiceTest`, etc.) against PostgreSQL Testcontainers.
4. **Full Reactor Build**:
   - Execute `mvn clean test` across the full repository.

---

## 4. Risks & Mitigations

- **Risk**: API deprecations or class moves in Spring Boot 4.1 / Spring Framework 7.
  - *Mitigation*: Adjust imports and configuration classes according to Spring Boot 4.x migration guides.
- **Risk**: Embabel Agent 1.5.1 API changes in agent definition, streaming, or tools.
  - *Mitigation*: Verify and adapt any updated agent lifecycle or prompt runner interfaces.
