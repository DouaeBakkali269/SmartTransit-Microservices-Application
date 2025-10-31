
# Smart-Transit — Urban Mobility Microservices

Smart-Transit is an extensible microservices platform for urban mobility and public transport management. The repository contains backend service implementations and skeletons intended to model a production-like microservices architecture for routing, vehicle management, trips, ticketing, subscriptions, payments, geolocation tracking, notifications, user profiles, and authentication.

## Project goals
- Provide modular, independently deployable services for urban transit domains following domain-driven design principles.
- Demonstrate standard microservice patterns: REST APIs, persistence (JPA), DTO mapping, validation, pagination, partial updates, and automated tests.
- Support event-driven architecture for asynchronous communication between services (planned with Kafka integration).
- Provide a starting point for integration (API gateway, service discovery), CI/CD, and containerized deployment.

## High-level architecture
- **Services**: each backend service is a standalone Spring Boot (Maven) application. Services communicate via HTTP/REST for synchronous operations and will use Kafka for asynchronous event-driven communication.
- **Persistence**: services use JPA (Hibernate). By default the projects are configured with H2 in-memory for development and tests; swap to PostgreSQL/MySQL for production.
- **Mapping & validation**: DTOs use MapStruct for mapping and Jakarta Validation for request validation.
- **Testing**: unit tests for service logic, integration tests that start the Spring context and exercise REST endpoints.
- **Infrastructure**: Eureka service discovery and Spring Cloud Gateway for API routing and circuit breaking.

## Services and responsibilities

### Infrastructure Services
- **discovery-service** — Eureka service registry (port 8761) for service discovery and registration.
- **gateway-service** — Spring Cloud Gateway (port 8080) serving as the single entry point with routing, circuit breaking, and load balancing.

### Domain Services

#### Core Services
- **auth-service** (port TBD) — Manages user authentication (login, logout) and JWT token lifecycle. Validates tokens for the API Gateway and other services.
- **user-service** (port 8082) — Manages user profiles for passengers, drivers, and administrators. Full CRUD implementation with pagination, search, and PATCH partial updates. *Reference implementation with complete test coverage.*

#### Transport Management Services
- **route-service** (port TBD) — Manages static route data: transit lines, fixed stops, and route definitions. A route represents a template (e.g., "Line 42: Downtown ↔ Airport").
- **trip-service** (port TBD) — Manages dynamic trip instances: scheduled executions of routes with actual departure/arrival times, assigned vehicles, and real-time status updates. A trip is a specific journey on a route (e.g., "Bus 405 running Line 42 departing at 14:30").

> **Why separate Route and Trip services?**
> We split these domains to follow the **Template vs Instance** pattern:
> - **Routes** are static, long-lived templates that define "what" and "where" (the line, stops, and general schedule).
> - **Trips** are dynamic, time-bound instances that represent "when" and "how" (actual journeys happening with specific vehicles and times).
>
> This separation enables:
> - Independent scaling: trip operations (high-frequency updates) can scale separately from route configuration (low-frequency changes).
> - Clear bounded contexts: route planning teams work independently from operations teams managing daily trips.
> - Better data modeling: routes focus on geographic/network data while trips focus on temporal/operational data.

- **vehicle-service** (port TBD) — Manages vehicle fleet data: bus metadata, capacity, maintenance status, and assignments.

#### Ticketing and Payment Services
- **ticket-service** (port 8086) — Manages ticket lifecycle: purchase, cancellation, validation (used/unused), and history. Communicates with payment-service and publishes events for notifications. *Fully implemented with CRUD operations.*
- **subscription-service** (port 8087) — Manages subscription plans: creation, renewal, expiration, and recurring billing. Integrates with payment-service for transactions.
- **payment-service** (port 8089) — Processes financial transactions for tickets and subscriptions. Integrates with external payment gateways and publishes payment events (success/failure).

#### Real-time and Communication Services
- **geolocation-service** (port 8088) — Tracks real-time vehicle positions via GPS. Publishes location data continuously to Kafka for consumption by trip-service (ETA calculations) and notification-service (delay alerts).
- **notification-service** (port 8090) — Event-driven service that sends notifications (email, SMS, push) based on events from ticket-service, subscription-service, geolocation-service, and payment-service.

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


## Quickstart: Discovery + Gateway (local)

### Prerequisites
- All services use Spring Boot 3.1.6 (Java 17) in this repo.
- Spring Cloud 2023.0.5 for compatibility with Boot 3.1.6.

### Service Ports
- **discovery-service**: 8761
- **gateway-service**: 8080
- **user-service**: 8082
- **ticket-service**: 8086
- **subscription-service**: 8087
- **geolocation-service**: 8088
- **payment-service**: 8089
- **notification-service**: 8090
- **auth-service**, **route-service**, **trip-service**, **vehicle-service**: TBD (configure in application.properties)

### Run Order (PowerShell)

**1. Start Discovery Service (Eureka)**
```powershell
cd discovery-service
mvn -DskipTests spring-boot:run
```
Wait for Eureka to start, then verify at http://localhost:8761/

**2. Start Gateway Service**
```powershell
# in a new shell
cd gateway-service
mvn -DskipTests spring-boot:run
```

**3. Start Domain Services** (each in a new shell)
```powershell
# Core services
cd user-service
mvn -DskipTests spring-boot:run

cd auth-service
mvn -DskipTests spring-boot:run

# Transport management
cd route-service
mvn -DskipTests spring-boot:run

cd trip-service
mvn -DskipTests spring-boot:run

cd vehicle-service
mvn -DskipTests spring-boot:run

# Ticketing and payments
cd ticket-service
mvn -DskipTests spring-boot:run

cd subscription-service
mvn -DskipTests spring-boot:run

cd payment-service
mvn -DskipTests spring-boot:run

# Real-time and communication
cd geolocation-service
mvn -DskipTests spring-boot:run

cd notification-service
mvn -DskipTests spring-boot:run
```

### Testing

**Eureka Dashboard**: http://localhost:8761/ — view all registered service instances

**Gateway Routing Examples** (via http://localhost:8080):
- User management: `GET http://localhost:8080/user-service/api/users`
- Tickets: `GET http://localhost:8080/ticket-service/api/tickets`
- Subscriptions: `GET http://localhost:8080/subscription-service/api/subscriptions`
- Payments: `GET http://localhost:8080/payment-service/api/payments`
- Geolocation: `GET http://localhost:8080/geolocation-service/api/geolocations`
- Notifications: `GET http://localhost:8080/notification-service/api/notifications`

The gateway uses service discovery to automatically route requests to the appropriate microservice.

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

