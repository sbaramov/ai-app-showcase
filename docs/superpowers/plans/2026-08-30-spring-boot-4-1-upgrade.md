# Spring Boot 4.1 & Ecosystem Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the multi-module reactor project to Spring Boot 4.1.1, Spring Cloud 2025.1.3, Spring Shell 4.0.3, Embabel Agent 1.5.1, and SpringMockK 5.0.1.

**Architecture:** Update the root BOM dependency management properties to align with Spring Boot 4.1 and the 2025/2026 ecosystem releases, resolve any API deprecations across the submodules, and run the test suites to ensure zero regressions.

**Tech Stack:** Spring Boot 4.1.1, Spring Cloud 2025.1.3, Spring Shell 4.0.3, Embabel Agent 1.5.1, Kotlin 2.3.21, Spring Data JDBC, Flyway, PostgreSQL Testcontainers, MockK 1.14.2, SpringMockK 5.0.1.

**Spec:** `docs/superpowers/specs/2026-08-30-spring-boot-4-1-upgrade-design.md`

## Global Constraints
- Spring Boot version: `4.1.1`
- Spring Cloud version: `2025.1.3`
- Spring Shell version: `4.0.3`
- Embabel Agent version: `1.5.1`
- SpringMockK version: `5.0.1`
- Multi-module reactor builds must stay clean and all existing unit/integration tests must pass.
- Conventional commits must be used for all commits.

---

### Task 1: Update Root and Submodule BOM Properties

**Files:**
- Modify: `pom.xml:40-48`
- Modify: `deep-research-embabel-backend/pom.xml:125-130`

**Interfaces:**
- Consumes: Maven Central & Embabel Artifactory version metadata.
- Produces: Updated root dependency management properties for Spring Boot 4.1.1, Spring Cloud 2025.1.3, Spring Shell 4.0.3, Embabel Agent 1.5.1, and SpringMockK 5.0.1.

- [ ] **Step 1: Update properties in root `pom.xml`**

Update the `<properties>` block in root `pom.xml`:
```xml
        <spring-shell.version>4.0.3</spring-shell.version>
        <spring-boot.version>4.1.1</spring-boot.version>
        <spring-cloud.version>2025.1.3</spring-cloud.version>
        <embabel-agent.version>1.5.1</embabel-agent.version>
```

- [ ] **Step 2: Update `springmockk` in `deep-research-embabel-backend/pom.xml`**

Update `springmockk` dependency version to `5.0.1`:
```xml
        <dependency>
            <groupId>com.ninja-squad</groupId>
            <artifactId>springmockk</artifactId>
            <version>5.0.1</version>
            <scope>test</scope>
        </dependency>
```

- [ ] **Step 3: Verify dependency tree and resolution**

Run: `mvn dependency:resolve`
Expected: Resolution succeeds without dependency conflict errors.

- [ ] **Step 4: Commit BOM property updates**

```bash
git add pom.xml deep-research-embabel-backend/pom.xml
git commit -m "build: upgrade spring boot 4.1.1 and ecosystem dependencies"
```

---

### Task 2: Verify and Migrate `tavily-search-client` and `tavily-search-cli`

**Files:**
- Modify: `tavily-search-client/src/...` (if any API changes required)
- Modify: `tavily-search-cli/src/...` (if any Spring Shell 4 / OpenFeign changes required)
- Test: `tavily-search-client/src/test/...`
- Test: `tavily-search-cli/src/test/...`

**Interfaces:**
- Consumes: `tavily-search-client` interfaces and `tavily-search-cli` Spring Shell commands.
- Produces: Fully compilable and tested client and CLI modules under Spring Boot 4.1.1.

- [ ] **Step 1: Compile `tavily-search-client` and `tavily-search-cli`**

Run: `mvn clean test-compile -pl tavily-search-client,tavily-search-cli`
Expected: SUCCESS or list of compilation issues to resolve.

- [ ] **Step 2: Address any API migrations in `tavily-search-client` and `tavily-search-cli`**

Adjust annotations or imports if Spring Shell 4 or Spring Cloud 2025.1.3 require updates.

- [ ] **Step 3: Run unit and slice tests for client and CLI**

Run: `mvn test -pl tavily-search-client,tavily-search-cli`
Expected: Tests run and PASS with 0 failures/errors.

- [ ] **Step 4: Commit client and CLI migration changes**

```bash
git add tavily-search-client/ tavily-search-cli/
git commit -m "feat(cli): ensure compatibility with spring boot 4.1 and spring shell 4"
```

---

### Task 3: Verify and Migrate `deep-research-embabel-backend`

**Files:**
- Modify: `deep-research-embabel-backend/src/...`
- Test: `deep-research-embabel-backend/src/test/...`

**Interfaces:**
- Consumes: Embabel Agent 1.5.1, Spring Data JDBC, WebSocket Broker, Actuator, Micrometer OTel.
- Produces: Backend service and test suite passing under Spring Boot 4.1.1 and Embabel Agent 1.5.1.

- [ ] **Step 1: Compile `deep-research-embabel-backend`**

Run: `mvn clean test-compile -pl deep-research-embabel-backend`
Expected: SUCCESS or compilation errors to diagnose and resolve.

- [ ] **Step 2: Fix any Embabel Agent 1.5.1 or Spring Boot 4.1 breaking changes**

Address any changed classes, updated prompt execution interfaces, or Spring Data JDBC / WebSocket changes in `deep-research-embabel-backend`.

- [ ] **Step 3: Run backend unit and integration test suite**

Run: `mvn test -pl deep-research-embabel-backend`
Expected: All backend unit, slice, and integration tests PASS.

- [ ] **Step 4: Commit backend migration changes**

```bash
git add deep-research-embabel-backend/
git commit -m "feat(backend): migrate embabel backend to spring boot 4.1 and embabel 1.5.1"
```

---

### Task 4: Full Multi-Module Reactor Regression & Graphify Update

**Files:**
- Verify: All repository modules (`tavily-search-client`, `tavily-search-cli`, `deep-research-embabel-backend`)

**Interfaces:**
- Consumes: Complete project reactor.
- Produces: Clean multi-module build and updated knowledge graph.

- [ ] **Step 1: Run complete multi-module test suite**

Run: `mvn clean test`
Expected: BUILD SUCCESS across all 4 reactor artifacts.

- [ ] **Step 2: Update graphify knowledge graph**

Run: `graphify update .`
Expected: Graph AST updated with current codebase structure.

- [ ] **Step 3: Final commit and verify git status**

```bash
git status
```
