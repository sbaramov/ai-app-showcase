---
apply: always
---

# Agents Instructions

## Project Overview

Multi-components mono repository built with Java and TypeScript using Maven and Pnpm as package managers. 
Docker Compose is used for integration testing. 

**Modules:**
- `tavily-search-client` — Tavily Search Client library based on Spring Cloud OpenFeign client
- `tavily-search-cli` — Spring Shell CLI application to Demo the Tavily Search Client library
- `deep-research-embabel-backend` — Embabel Agent Framework REST API for deep research
- `deep-research-embabel-jsclient` - a simple JS script to test search function of the `deep-research-embabel-backend`
- `deep-research-frontend-ng` - a Angular based web application with a frontend for the `deep-research-embabel-backend`

**Tech stack:** Kotlin 2.3, Spring Boot 3.5, Spring Shell 3.4, Spring Cloud 2025.0.x, Embabel Agent 0.3.x, JUnit 5, Angular 21, TypeScript


**Architecture**

The core architecture is based on the Microservice Pattern where:
* `deep-research-embabel-backend` component exposes a Websocket interface used by the `deep-research-embabel-ng` frontend.
* `deep-research-embabel-backend` uses `tavily-search-client` to execute web searches through the Tavily Search Engine
* `deep-research-embabel-backend` uses Ollama as an inference engine and LLM provider


## Commit Rules
* Always Use conventional commits when writing the commit message
* Always squash the commit together as long as these are part of a single session and use simple summarizing message with the core essence of the task


## General Rules
* Always obtain explicit approval before transition from plan to implementation.
* Always follow Test-Driven Development and ensure the user reviews the test before proceeding with implementation.

---
## Context7
Use the `ctx7` CLI to fetch current documentation whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service -- even well-known ones like React, Next.js, Prisma, Express, Tailwind, Django, or Spring Boot. This includes API syntax, configuration, version migration, library-specific debugging, setup instructions, and CLI tool usage. Use even when you think you know the answer -- your training data may not reflect recent changes. Prefer this over web search for library docs.

Do not use for: refactoring, writing scripts from scratch, debugging business logic, code review, or general programming concepts.

## Steps

1. Resolve library: `npx ctx7@latest library <name> "<user's question>"` — use the official library name with proper punctuation (e.g., "Next.js" not "nextjs", "Customer.io" not "customerio", "Three.js" not "threejs")
2. Pick the best match (ID format: `/org/project`) by: exact name match, description relevance, code snippet count, source reputation (High/Medium preferred), and benchmark score (higher is better). If results don't look right, try alternate names or queries (e.g., "next.js" not "nextjs", or rephrase the question)
3. Fetch docs: `npx ctx7@latest docs <libraryId> "<user's question>"`
4. Answer using the fetched documentation

You MUST call `library` first to get a valid ID unless the user provides one directly in `/org/project` format. Use the user's full question as the query -- specific and detailed queries return better results than vague single words. Do not run more than 3 commands per question. Do not include sensitive information (API keys, passwords, credentials) in queries.

For version-specific docs, use `/org/project/version` from the `library` output (e.g., `/vercel/next.js/v14.3.0`).

If a command fails with a quota error, inform the user and suggest `npx ctx7@latest login` or setting `CONTEXT7_API_KEY` env var for higher limits. Do not silently fall back to training data.

---
## Angular Testing Guidelines (Vitest & JIT)

Since this project uses Vitest (which runs inside pure Node contexts without the Angular CLI stylesheet compilation asset pipelining), JIT compilation errors can occur when importing Standalone components with relative `templateUrl` or `styleUrls` decorators in spec suites.

### JIT Template Overrides
Always pre-override component templates inside your `beforeEach` block BEFORE compiling modules with `TestBed.configureTestingModule`:

```ts
beforeEach(async () => {
  // Override relative URLs for Standalone components to prevent Vitest compilation crashes
  TestBed.overrideComponent(SessionSidebarComponent, {
    set: {
      templateUrl: '',
      template: '<div class="sidebar-expanded"></div>', // Simple test-harness placeholder
      styleUrls: [],
      styles: []
    }
  });

  await TestBed.configureTestingModule({
    imports: [SessionSidebarComponent],
    providers: [ ... ]
  }).compileComponents();
});
```

### Browser Mocking in Vitest
If components access browser-level properties (such as `localStorage` or `sessionStorage`), mock them explicitly in `beforeEach` using `vi.stubGlobal`:

```ts
beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  });
});
```