# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`tenthplayer` is a ticket seat-swap service for Doosan Bears fan club members. Users register their pre-sale tickets and swap seats with others to form groups of 3–4.

**Deployment targets:**
- Frontend: Vite + React + Tailwind → **Vercel**
- Backend: Spring Boot → **Railway**
- Database: **Supabase** (PostgreSQL)

**Core features:** Kakao OAuth2 login, ticket registration, swap listings, swap request/accept, in-app chat (5s polling REST API).

## Build & Run Commands

```bash
# Build
./gradlew build

# Run the application
./gradlew bootRun

# Run all tests
./gradlew test

# Run a single test class
./gradlew test --tests "com.tenthplayer.SomeTestClass"

# Run a single test method
./gradlew test --tests "com.tenthplayer.SomeTestClass.someMethod"
```

## Stack

- **Java 21**, Spring Boot 4.0.6
- **Spring MVC** (webmvc, not WebFlux — servlet-based)
- **Spring Data JPA** + **PostgreSQL**
- **Spring Security**
- **Lombok** (use `@Data`, `@Builder`, `@RequiredArgsConstructor`, etc. freely)

## Structure

All application code lives under `src/main/java/com/tenthplayer/`. The entry point is `TenthplayerApplication.java`.

## Database

PostgreSQL is the runtime database. You'll need a running PostgreSQL instance and should configure connection details in `src/main/resources/application.properties` (currently only sets `spring.application.name=tenthplayer`).
