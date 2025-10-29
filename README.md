# Smart-Transit — Urban Transport Microservices (Backend skeletons)

Concise project README generated from the provided project report. This repository contains lightweight Spring Boot (Maven) backend service skeletons for an urban transport microservices system.

## Purpose
This workspace provides a minimal, consistent starting point for backend services in the Smart-Transit system. Each service includes a tiny Spring Boot app, a controller with a health endpoint and a simple placeholder API, and a Maven `pom.xml`.

## Architecture (high level)
- Microservices (each service is an independent Spring Boot app)
- Services communicate over HTTP/REST (placeholders here)
- Embedded H2 is configured as a dev in-memory DB dependency in each service pom but not used by the controller skeletons

## Services included
- `auth-service`  — authentication / token management (skeleton)
- `user-service`  — passenger and user profile management (skeleton)
- `route-service` — routes and stops (skeleton)
- `vehicle-service` — vehicles and real-time vehicle metadata (skeleton)
- `trip-service`   — trips, schedules, and telemetry (skeleton)
- `booking-service` — ride bookings / reservations (skeleton)

Each service lives in its own folder at the repository root and uses package `com.smarttransit.<service>`.

## Basic APIs (skeleton)
Each service exposes a minimal controller with endpoints:
- `GET /actuator/health` (Spring Boot actuator, where enabled)
- `GET /api/<resource>/ping` — lightweight health/ping returning service name and simple JSON

Example (user-service):
GET /api/users/ping -> { "service":"user-service", "status":"ok" }

## How to build & run (per-service)
Open a terminal and run inside a service folder (e.g. `user-service`):

```powershell
cd 'C:/Users/Usuario/OneDrive/Desktop/Smart-Transit/user-service'
mvn clean package
mvn spring-boot:run
```

Each service has a different default port configured in `src/main/resources/application.properties`.

## Next steps / suggestions
- Replace controller placeholders with real DTOs, services, and repositories.
- Add API definitions (OpenAPI / Swagger) and an API gateway.
- Add inter-service communication patterns (REST client, message broker).
- Add CI pipeline and integration tests.

## Notes
- These skeletons are intentionally minimal. They provide a repeatable folder/package structure and example endpoints so you can quickly implement business logic.

---
Generated from the project report you provided (concise version). If you want, I can:
- Wire these to a shared parent pom
- Add Dockerfiles and docker-compose
- Add sample DTOs and repository CRUD methods
Tell me which of the above you'd like next.
