
# Smart-Transit — Urban Mobility Microservices

Smart-Transit is an extensible microservices platform for urban mobility and public transport management. The repository contains backend service implementations and skeletons intended to model a production-like microservices architecture for routing, vehicle management, trips, booking, user profiles, and authentication.

## Project goals
- Provide modular, independently deployable services for urban transit domains (users, routes, vehicles, trips, bookings, auth).
- Demonstrate standard microservice patterns: REST APIs, persistence (JPA), DTO mapping, validation, pagination, partial updates, and automated tests.
- Provide a starting point for integration (API gateway, service discovery), CI/CD, and containerized deployment.

## High-level architecture
- Services: each backend service is a standalone Spring Boot (Maven) application. Services communicate via HTTP/REST in this scaffold.
- Persistence: services use JPA (Hibernate). By default the projects are configured with H2 in-memory for development and tests; swap to PostgreSQL/MySQL for production.
- Mapping & validation: DTOs use MapStruct for mapping and Jakarta Validation for request validation.
- Testing: unit tests for service logic, integration tests that start the Spring context and exercise REST endpoints.

## Services and responsibilities
- auth-service — authentication and token lifecycle (login, token validation). Minimal skeleton provided.
- user-service — user and passenger profile management (full CRUD implemented, pagination, search and PATCH partial updates, tests included).
- route-service — route and stop management (skeleton).
- vehicle-service — vehicle metadata and telemetry (skeleton).
- trip-service — trips, schedules, and trip lifecycle (skeleton).
- booking-service — booking / reservation management (skeleton).

Each service lives in its own top-level folder (e.g. `user-service`) and follows the same Maven/Spring Boot layout.

## API conventions
- Endpoints are versionless REST endpoints under `/api/<resource>` (e.g. `/api/users`).
- List endpoints support pagination via `page` and `size` query params and simple search via `search`.
- Partial updates are supported via `PATCH /api/<resource>/{id}` (simple JSON map-based updates in the scaffold).

## How to build and run a service locally
From PowerShell (example: user-service):

```powershell
cd 'C:/Users/Usuario/OneDrive/Desktop/Smart-Transit/user-service'
mvn clean package
mvn spring-boot:run
```

Default dev ports are configured in each service `src/main/resources/application.properties`.

## Tests
- Run unit and integration tests with:

```powershell
mvn test
```

Integration tests start the Spring context on a random port and verify REST flows.

## Recommended next steps for production readiness
- Add an API Gateway (Spring Cloud Gateway) and centralize routing.
- Add service discovery (Eureka or Consul) and circuit breaker patterns.
- Replace in-memory DB with a managed database and add Flyway/Liquibase migrations.
- Add authentication (JWT) and RBAC for protected endpoints.
- Containerize services with Docker and orchestrate with docker-compose or Kubernetes.
- Add CI (GitHub Actions) to run build/test and publish images.

## Quickstart: Discovery + Gateway (local)
The repository now includes two new modules:

- `discovery-service` — a Eureka server (port 8761).
- `gateway-service` — a Spring Cloud Gateway (port 8080) configured to use service discovery and a sample circuit-breaker fallback endpoint.

Assumptions:
- All services use Spring Boot 3.1.6 (Java 17) in this repo.
- We used Spring Cloud 2023.0.5 for compatibility with Boot 3.1.6. If you manage dependencies centrally, adjust the BOM version as needed.

Run order (PowerShell):

```powershell
cd 'C:/Users/Usuario/OneDrive/Desktop/Smart-Transit-Microservices/discovery-service'
mvn -DskipTests package
mvn spring-boot:run

# in a new shell
cd 'C:/Users/Usuario/OneDrive/Desktop/Smart-Transit-Microservices/gateway-service'
mvn -DskipTests package
mvn spring-boot:run

# in other shells start the microservices (they will register to Eureka)
cd 'C:/Users/Usuario/OneDrive/Desktop/Smart-Transit-Microservices/user-service'
mvn -DskipTests spring-boot:run

cd 'C:/Users/Usuario/OneDrive/Desktop/Smart-Transit-Microservices/auth-service'
mvn -DskipTests spring-boot:run

# etc. for booking-service, trip-service, route-service, vehicle-service
```

Test the discovery UI: open http://localhost:8761/ to see registered instances.

Test routing through the gateway (example):
- If `user-service` registers as `USER-SERVICE`, you can call the gateway at:
	http://localhost:8080/user-service/api/users (gateway will use the discovery locator to forward to the service)

Circuit breaker (fallback) example:
- The gateway contains a `/fallback` endpoint used by route filters as a fallback URI when upstream calls fail.
- To exercise the circuit breaker, stop a backend service and call its route through the gateway; when failures exceed thresholds the configured fallback will be returned.

Next steps / hardening suggestions:
- Add health checks and readiness probes for container orchestration.
- Secure the gateway and discovery server in prod (TLS, authentication between services).
- Externalize configuration (Spring Cloud Config or Kubernetes secrets) and add logging/metrics exporters.


## Contributing
- Implement consistent DTOs and service contracts and add tests.
- Keep one commit per logical change and include unit + integration tests.

