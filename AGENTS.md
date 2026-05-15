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

