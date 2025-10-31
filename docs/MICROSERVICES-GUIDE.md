# Spring Boot Microservices Architecture Guide

This guide explains the core components, patterns, and best practices for building microservices with Spring Boot and Spring Cloud. Examples reference the Smart-Transit codebase.

---

## Table of Contents
1. [Microservices Architecture Overview](#microservices-architecture-overview)
2. [Service Discovery (Eureka)](#service-discovery-eureka)
3. [API Gateway](#api-gateway)
4. [Circuit Breaker Pattern](#circuit-breaker-pattern)
5. [Load Balancing](#load-balancing)
6. [Service Communication](#service-communication)
7. [Data Management Patterns](#data-management-patterns)
8. [Configuration Management](#configuration-management)
9. [Best Practices](#best-practices)
10. [Common Interview Questions](#common-interview-questions)

---

## Microservices Architecture Overview

### What is Microservices Architecture?

Microservices architecture is a design approach where an application is built as a collection of small, independent services that:
- Run in their own process
- Communicate via lightweight protocols (HTTP/REST, messaging)
- Are independently deployable
- Are organized around business capabilities
- Can use different databases and technologies

### Monolith vs Microservices

**Monolithic Architecture:**
```
┌─────────────────────────────────┐
│      Single Application         │
│  ┌───────────────────────────┐  │
│  │   Presentation Layer      │  │
│  ├───────────────────────────┤  │
│  │   Business Logic Layer    │  │
│  ├───────────────────────────┤  │
│  │   Data Access Layer       │  │
│  └───────────────────────────┘  │
│              ↓                  │
│      ┌──────────────┐           │
│      │   Database   │           │
│      └──────────────┘           │
└─────────────────────────────────┘
```

**Microservices Architecture:**
```
                 ┌─────────────────┐
                 │   API Gateway   │
                 └────────┬────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │ Service │      │ Service │      │ Service │
   │    A    │      │    B    │      │    C    │
   └────┬────┘      └────┬────┘      └────┬────┘
        │                │                │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │   DB_A  │      │   DB_B  │      │   DB_C  │
   └─────────┘      └─────────┘      └─────────┘
```

### Benefits
- **Independent deployment**: Deploy services without affecting others
- **Technology diversity**: Each service can use different tech stack
- **Scalability**: Scale individual services based on demand
- **Fault isolation**: Failure in one service doesn't crash entire system
- **Team autonomy**: Different teams can own different services

### Challenges
- **Distributed system complexity**: Network latency, partial failures
- **Data consistency**: Distributed transactions are difficult
- **Testing**: Integration testing is more complex
- **Operational overhead**: More services to monitor and deploy

---

## Service Discovery (Eureka)

### What is Service Discovery?

Service Discovery is a mechanism that allows services to find and communicate with each other without hardcoding network locations (IP addresses/ports).

### Why is it needed?

In a microservices environment:
- Services can be dynamically scaled (multiple instances)
- IP addresses change frequently (containers, cloud environments)
- Services need to discover available instances automatically
- Manual configuration doesn't scale

### Types of Service Discovery

**1. Client-Side Discovery:**
```
Client → Service Registry (get service locations) → Direct call to Service
```
- Client queries registry and chooses an instance
- Client is responsible for load balancing
- **Used by**: Netflix Eureka (our implementation)

**2. Server-Side Discovery:**
```
Client → Load Balancer → Service Registry → Service
```
- Load balancer queries registry
- Client doesn't know about multiple instances
- **Used by**: Kubernetes, AWS ELB

### Eureka Components

**Eureka Server** (Service Registry):
- Maintains registry of all service instances
- Services register on startup and send heartbeats
- Provides REST API to query registered services

**Eureka Client**:
- Embedded in each microservice
- Registers service on startup
- Sends heartbeat every 30 seconds (default)
- Fetches registry and caches locally

### Implementation in Smart-Transit

**Eureka Server (`discovery-service`):**

```java
@SpringBootApplication
@EnableEurekaServer  // Enables Eureka server
public class DiscoveryServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServiceApplication.class, args);
    }
}
```

**Configuration (`discovery-service/application.properties`):**
```properties
server.port=8761

# Don't register itself as a client
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false

# Hostname for the server
eureka.instance.hostname=localhost
```

**Eureka Client (in `user-service`, `booking-service`, etc.):**

```xml
<!-- pom.xml dependency -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

```properties
# application.properties
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.instance.prefer-ip-address=true
```

Spring Boot 3.x auto-registers the service - no `@EnableDiscoveryClient` annotation needed (though you can still use it).

### How it Works

1. **Startup**: Eureka Server starts on port 8761
2. **Registration**: Each microservice starts and registers with Eureka
   - Sends: service name, IP, port, health check URL
3. **Heartbeat**: Every 30s, clients send heartbeat to stay registered
4. **Discovery**: Services fetch registry from Eureka
5. **Communication**: Service A looks up Service B in registry, gets IP:port, makes call

### Service Registration Example

When `user-service` starts:
```
1. user-service → Eureka: "I'm USER-SERVICE at 192.168.1.10:8082"
2. Eureka stores: USER-SERVICE → [192.168.1.10:8082]
3. user-service periodically: "I'm still alive" (heartbeat)
```

When `booking-service` needs to call user-service:
```
1. booking-service → Eureka: "Where is USER-SERVICE?"
2. Eureka → booking-service: "USER-SERVICE is at 192.168.1.10:8082"
3. booking-service → user-service: HTTP call to 192.168.1.10:8082
```

### Key Concepts

- **Service ID**: Logical name (e.g., "USER-SERVICE") used for discovery
- **Instance ID**: Unique identifier for each instance
- **Health Check**: Eureka marks service as DOWN if heartbeats stop
- **Self-Preservation Mode**: If too many services miss heartbeats, Eureka assumes network issue and doesn't evict them

---

## API Gateway

### What is an API Gateway?

An API Gateway is a single entry point for all client requests. It routes requests to appropriate microservices and can handle cross-cutting concerns.

### Why Use an API Gateway?

**Without Gateway:**
```
Mobile App ──┬─→ User Service (port 8082)
             ├─→ Booking Service (port 8083)
Web App ─────┼─→ Route Service (port 8084)
             └─→ Trip Service (port 8085)
```
Problems:
- Clients must know all service endpoints
- Difficult to change service locations
- Cross-cutting concerns (auth, logging) duplicated

**With Gateway:**
```
Mobile App ──┐
             ├─→ API Gateway (port 8080) ──┬─→ User Service
Web App ─────┘                              ├─→ Booking Service
                                            ├─→ Route Service
                                            └─→ Trip Service
```

### API Gateway Responsibilities

1. **Routing**: Forward requests to appropriate services
2. **Load Balancing**: Distribute load across service instances
3. **Authentication/Authorization**: Centralized security
4. **Rate Limiting**: Prevent abuse
5. **Request/Response Transformation**: Modify requests/responses
6. **Protocol Translation**: HTTP to gRPC, REST to GraphQL
7. **Aggregation**: Combine multiple service calls into one response
8. **Circuit Breaking**: Handle service failures gracefully
9. **Logging/Monitoring**: Centralized logging
10. **Caching**: Cache responses

### Spring Cloud Gateway

Spring Cloud Gateway is a reactive, non-blocking gateway built on Spring WebFlux.

**Key Components:**

1. **Route**: Basic building block, consists of:
   - ID: Unique identifier
   - Destination URI: Where to route (e.g., `lb://USER-SERVICE`)
   - Predicates: Conditions to match requests
   - Filters: Modify requests/responses

2. **Predicate**: Matches HTTP request attributes (path, headers, params)

3. **Filter**: Modifies request/response (add headers, circuit breaker, retry)

### Implementation in Smart-Transit

**Gateway Service (`gateway-service`):**

```java
@SpringBootApplication
public class GatewayServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayServiceApplication.class, args);
    }
}
```

**Configuration (`gateway-service/application.properties`):**

```properties
server.port=8080

# Eureka integration
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

# Automatic route creation from Eureka
spring.cloud.gateway.discovery.locator.enabled=true
spring.cloud.gateway.discovery.locator.lower-case-service-id=true
```

### How Gateway Routes Requests

**Automatic Discovery-Based Routing:**

With `discovery.locator.enabled=true`, gateway automatically creates routes:

```
Request: GET http://localhost:8080/user-service/api/users
         ↓
Gateway looks up "user-service" in Eureka
         ↓
Eureka returns: 192.168.1.10:8082
         ↓
Gateway forwards: GET http://192.168.1.10:8082/api/users
```

**Manual Route Configuration (Java-based):**

```java
@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
            // Route to user-service
            .route("user-route", r -> r
                .path("/api/users/**")
                .filters(f -> f
                    .addRequestHeader("X-Gateway", "true")
                    .circuitBreaker(c -> c.setFallbackUri("/fallback"))
                )
                .uri("lb://USER-SERVICE")
            )
            // Route to booking-service
            .route("booking-route", r -> r
                .path("/api/bookings/**")
                .uri("lb://BOOKING-SERVICE")
            )
            .build();
    }
}
```

**Route Components Explained:**

- `path("/api/users/**")`: Predicate - matches any path starting with /api/users
- `addRequestHeader()`: Filter - adds custom header
- `circuitBreaker()`: Filter - applies circuit breaker pattern
- `lb://USER-SERVICE`: URI - load-balanced call to USER-SERVICE (via Eureka)

### Gateway Filters

**Pre-filters** (before forwarding to service):
```java
.filters(f -> f
    .addRequestHeader("X-Request-Source", "Gateway")
    .addRequestParameter("gateway", "true")
    .rewritePath("/external/(?<segment>.*)", "/api/${segment}")
)
```

**Post-filters** (after receiving response):
```java
.filters(f -> f
    .addResponseHeader("X-Response-Time", "10ms")
    .removeResponseHeader("X-Internal-Header")
)
```

### Fallback Controller

In `gateway-service/FallbackController.java`:

```java
@RestController
public class FallbackController {

    @GetMapping("/fallback")
    public ResponseEntity<Map<String, String>> fallback() {
        return ResponseEntity.status(503).body(
            Map.of(
                "error", "Service temporarily unavailable",
                "message", "Please try again later"
            )
        );
    }
}
```

---

## Circuit Breaker Pattern

### What is a Circuit Breaker?

A circuit breaker prevents cascading failures by stopping calls to a failing service and providing fallback responses.

**Analogy**: Like an electrical circuit breaker that stops current flow when it detects a fault, protecting the system.

### Why is it needed?

**Problem - Cascading Failures:**
```
User Request → Gateway → Service A → Service B (FAILING)
                                     ↓ (timeout 30s)
                         Service A waits...
             Gateway waits...
User waits... (30s timeout)

Multiple users → All threads blocked → System crashes
```

**Solution - Circuit Breaker:**
```
Circuit detects Service B failures → Opens circuit
User Request → Gateway → Service A → Circuit (OPEN) → Fallback response
                                     ↓ (immediate response)
Fast failure (no waiting)
```

### Circuit States

```
        ┌──────────┐
        │  CLOSED  │ ← Normal operation
        │  (OK)    │   Requests pass through
        └────┬─────┘
             │ Failures exceed threshold
             ↓
        ┌──────────┐
        │   OPEN   │ ← Circuit is open
        │ (Failed) │   Requests fail immediately → Fallback
        └────┬─────┘
             │ After timeout period
             ↓
        ┌──────────┐
        │   HALF   │ ← Testing recovery
        │   OPEN   │   Limited requests pass through
        └────┬─────┘
             │ If success → CLOSED
             │ If failure → OPEN
```

**State Transitions:**

1. **CLOSED** (Normal):
   - All requests pass through
   - Monitor failure rate
   - If failures > threshold → OPEN

2. **OPEN** (Failing):
   - Requests fail immediately with fallback
   - No calls to failing service
   - After timeout (e.g., 60s) → HALF_OPEN

3. **HALF_OPEN** (Testing):
   - Allow few requests through
   - If successful → CLOSED
   - If failure → OPEN

### Resilience4j Implementation

**Dependency (`gateway-service/pom.xml`):**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-reactor-resilience4j</artifactId>
</dependency>
```

**Configuration (`gateway-service/application.properties`):**
```properties
# Circuit breaker configuration
resilience4j.circuitbreaker.instances.defaultCircuitBreaker.registerHealthIndicator=true
resilience4j.circuitbreaker.instances.defaultCircuitBreaker.slidingWindowType=COUNT_BASED
resilience4j.circuitbreaker.instances.defaultCircuitBreaker.slidingWindowSize=10
resilience4j.circuitbreaker.instances.defaultCircuitBreaker.failureRateThreshold=50
resilience4j.circuitbreaker.instances.defaultCircuitBreaker.waitDurationInOpenState=60000
resilience4j.circuitbreaker.instances.defaultCircuitBreaker.permittedNumberOfCallsInHalfOpenState=3
```

**Configuration Explained:**

- `slidingWindowType=COUNT_BASED`: Track last N requests (vs TIME_BASED)
- `slidingWindowSize=10`: Consider last 10 requests
- `failureRateThreshold=50`: Open circuit if 50% fail
- `waitDurationInOpenState=60000`: Wait 60s before trying HALF_OPEN
- `permittedNumberOfCallsInHalfOpenState=3`: Allow 3 test requests in HALF_OPEN

**Usage in Gateway Routes:**

```java
.route("user-route", r -> r
    .path("/api/users/**")
    .filters(f -> f
        .circuitBreaker(c -> c
            .setName("defaultCircuitBreaker")
            .setFallbackUri("forward:/fallback")
        )
    )
    .uri("lb://USER-SERVICE")
)
```

### Example Scenario

**Timeline of Events:**

```
Time  | Requests | Successes | Failures | Circuit State | Response
------|----------|-----------|----------|---------------|----------
0s    | 10       | 10        | 0        | CLOSED        | 200 OK
10s   | 10       | 5         | 5        | CLOSED        | 200/500
15s   | 10       | 3         | 7        | OPEN (70% fail)| 503 Fallback
20s   | 10       | -         | -        | OPEN          | 503 Fallback
60s   | -        | -         | -        | HALF_OPEN     | -
61s   | 3        | 3         | 0        | CLOSED        | 200 OK
```

### Circuit Breaker vs Retry

- **Retry**: Attempt failed request again (useful for transient failures)
- **Circuit Breaker**: Stop trying after repeated failures (useful for sustained outages)
- **Best Practice**: Use both together (retry a few times, then circuit break)

---

## Load Balancing

### What is Load Balancing?

Load balancing distributes incoming requests across multiple service instances to:
- Prevent overload on single instance
- Improve availability (if one instance fails)
- Enable horizontal scaling

### Types of Load Balancing

**1. Server-Side Load Balancing:**
```
Client → Load Balancer (hardware/software) → Service Instances
```
- Centralized load balancer
- Examples: Nginx, HAProxy, AWS ELB

**2. Client-Side Load Balancing:**
```
Client (with LB logic) → Service Instances (chooses instance)
```
- Client chooses instance
- Used in microservices with service discovery
- **Spring Cloud LoadBalancer** (our implementation)

### Spring Cloud LoadBalancer

Replaced Netflix Ribbon (deprecated). Integrated with Spring Cloud Gateway and Eureka.

**How it Works:**

1. Service queries Eureka for available instances
2. LoadBalancer chooses instance using algorithm
3. Request is sent to chosen instance

**Load Balancing Algorithms:**

- **Round Robin** (default): Distribute requests equally in order
  ```
  Request 1 → Instance A
  Request 2 → Instance B
  Request 3 → Instance C
  Request 4 → Instance A (repeats)
  ```

- **Random**: Random instance selection

- **Weighted**: Assign weights to instances (e.g., more powerful servers get more traffic)

### Implementation in Smart-Transit

**In Gateway (`lb://` URI):**

```properties
# gateway-service/application.properties
spring.cloud.gateway.routes[0].uri=lb://USER-SERVICE
```

The `lb://` prefix tells Gateway to use LoadBalancer:

1. Gateway queries Eureka: "Where is USER-SERVICE?"
2. Eureka returns: [Instance1@8082, Instance2@8083, Instance3@8084]
3. LoadBalancer chooses instance (e.g., Round Robin)
4. Gateway sends request to chosen instance

**Custom Load Balancer Configuration:**

```java
@Configuration
public class LoadBalancerConfig {

    @Bean
    public ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory loadBalancerClientFactory) {

        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(
            loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name
        );
    }
}
```

### Multiple Service Instances Example

**Running multiple user-service instances:**

```powershell
# Terminal 1 - Instance 1
cd user-service
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8082"

# Terminal 2 - Instance 2
cd user-service
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8092"

# Terminal 3 - Instance 3
cd user-service
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8093"
```

**Eureka Registry:**
```
USER-SERVICE:
  - Instance 1: 192.168.1.10:8082
  - Instance 2: 192.168.1.10:8092
  - Instance 3: 192.168.1.10:8093
```

**Gateway distributes load:**
```
Request 1 → 192.168.1.10:8082
Request 2 → 192.168.1.10:8092
Request 3 → 192.168.1.10:8093
Request 4 → 192.168.1.10:8082 (Round Robin)
```

---

## Service Communication

### Communication Patterns

**1. Synchronous (Request-Response):**
- Service A calls Service B and waits for response
- **Protocols**: HTTP/REST, gRPC
- **Use case**: Real-time queries (get user details, check availability)

**2. Asynchronous (Event-Driven):**
- Service A publishes event, Service B processes later
- **Protocols**: Message queues (RabbitMQ, Kafka)
- **Use case**: Background processing (send email, update analytics)

### REST Communication in Smart-Transit

**Scenario**: `booking-service` needs to validate user before creating booking

**Option 1: Using RestTemplate (synchronous, blocking):**

```java
@Service
public class BookingService {

    private final RestTemplate restTemplate;

    public BookingService(RestTemplateBuilder builder) {
        this.restTemplate = builder.build();
    }

    public BookingDto createBooking(BookingDto booking) {
        // Call user-service to validate user exists
        String userServiceUrl = "http://USER-SERVICE/api/users/" + booking.getUserId();

        try {
            UserDto user = restTemplate.getForObject(userServiceUrl, UserDto.class);
            // User exists, proceed with booking
            return saveBooking(booking);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("User not found");
        }
    }
}
```

**Option 2: Using WebClient (reactive, non-blocking):**

```java
@Service
public class BookingService {

    private final WebClient webClient;

    public BookingService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://USER-SERVICE").build();
    }

    public Mono<BookingDto> createBooking(BookingDto booking) {
        return webClient.get()
            .uri("/api/users/{id}", booking.getUserId())
            .retrieve()
            .bodyToMono(UserDto.class)
            .flatMap(user -> {
                // User exists, proceed with booking
                return Mono.just(saveBooking(booking));
            })
            .onErrorResume(WebClientResponseException.NotFound.class, e ->
                Mono.error(new ResourceNotFoundException("User not found"))
            );
    }
}
```

**Option 3: Using Feign Client (declarative):**

```java
// Dependency
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>

// Feign Client Interface
@FeignClient(name = "USER-SERVICE")
public interface UserServiceClient {

    @GetMapping("/api/users/{id}")
    UserDto getUserById(@PathVariable("id") Long id);
}

// Service using Feign
@Service
public class BookingService {

    private final UserServiceClient userServiceClient;

    public BookingService(UserServiceClient userServiceClient) {
        this.userServiceClient = userServiceClient;
    }

    public BookingDto createBooking(BookingDto booking) {
        try {
            UserDto user = userServiceClient.getUserById(booking.getUserId());
            return saveBooking(booking);
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("User not found");
        }
    }
}

// Enable Feign in Application class
@SpringBootApplication
@EnableFeignClients
public class BookingServiceApplication {
    // ...
}
```

### Service Communication Best Practices

1. **Use Timeouts**: Prevent indefinite waiting
   ```java
   @Bean
   public RestTemplate restTemplate() {
       SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
       factory.setConnectTimeout(3000);  // 3 seconds
       factory.setReadTimeout(5000);     // 5 seconds
       return new RestTemplate(factory);
   }
   ```

2. **Handle Failures Gracefully**: Circuit breaker, fallback, retry
   ```java
   @CircuitBreaker(name = "userService", fallbackMethod = "getUserFallback")
   public UserDto getUser(Long id) {
       return userServiceClient.getUserById(id);
   }

   public UserDto getUserFallback(Long id, Exception e) {
       // Return cached data or default user
       return new UserDto(id, "Unknown", "Unknown");
   }
   ```

3. **Avoid Chatty Communication**: Minimize inter-service calls
   - Bad: 10 separate calls to get user details
   - Good: 1 call to get all user details

4. **Use API Versioning**: Prevent breaking changes
   ```java
   @GetMapping("/api/v1/users/{id}")
   public UserDto getUserV1(@PathVariable Long id) { ... }

   @GetMapping("/api/v2/users/{id}")
   public UserDtoV2 getUserV2(@PathVariable Long id) { ... }
   ```

---

## Data Management Patterns

### Database per Service

**Principle**: Each microservice has its own database. No direct database access between services.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │  Booking    │     │   Route     │
│  Service    │     │  Service    │     │  Service    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       ↓                   ↓                   ↓
  ┌─────────┐         ┌─────────┐         ┌─────────┐
  │ User DB │         │Book DB  │         │Route DB │
  └─────────┘         └─────────┘         └─────────┘
```

**Benefits:**
- Loose coupling: Services can't access other services' data directly
- Independent scaling: Scale databases independently
- Technology diversity: Different databases for different needs (SQL, NoSQL)

**Challenges:**
- Data consistency across services
- Joins across services are difficult
- Transactions across services are complex

### Data Consistency Patterns

**1. Saga Pattern** (for distributed transactions):

Instead of ACID transactions, use compensating transactions.

**Example**: Create booking (requires user validation and payment)

**Choreography-based Saga:**
```
1. Booking Service → Create booking (PENDING)
2. Booking Service → Publish "BookingCreated" event
3. User Service → Validate user → Publish "UserValidated" or "UserInvalid" event
4. Payment Service → Process payment → Publish "PaymentSucceeded" or "PaymentFailed"
5. Booking Service → Update booking (CONFIRMED or CANCELLED)

If any step fails → Compensating actions:
- Cancel booking
- Refund payment
```

**2. Event Sourcing**:

Store all changes as sequence of events instead of current state.

```java
// Instead of storing current balance
User: { id: 1, balance: 100 }

// Store events
UserCreated: { id: 1, initialBalance: 0 }
BalanceAdded: { id: 1, amount: 150 }
BalanceDeducted: { id: 1, amount: 50 }
// Current balance = 0 + 150 - 50 = 100
```

**3. CQRS (Command Query Responsibility Segregation)**:

Separate read and write models.

```
Write Model (Commands):        Read Model (Queries):
  CreateUser                     GetUserById
  UpdateUser                     SearchUsers
       ↓                              ↑
  [Write DB]  ──(sync)──→  [Read DB (optimized)]
```

### Handling Data Joins Across Services

**Scenario**: Display booking with user details and route information

**Option 1: API Composition (in real-time)**
```java
@GetMapping("/api/bookings/{id}")
public BookingDetailsDto getBookingDetails(@PathVariable Long id) {
    // 1. Get booking
    Booking booking = bookingRepository.findById(id);

    // 2. Call user-service
    UserDto user = userServiceClient.getUserById(booking.getUserId());

    // 3. Call route-service
    RouteDto route = routeServiceClient.getRouteById(booking.getRouteId());

    // 4. Combine
    return new BookingDetailsDto(booking, user, route);
}
```
- Pros: Always up-to-date
- Cons: Multiple service calls, latency, cascading failures

**Option 2: Data Replication (eventual consistency)**
```java
// Booking service maintains local cache of user/route data
@Entity
public class Booking {
    private Long id;
    private Long userId;
    private String userName;  // Replicated from user-service
    private String userEmail; // Replicated from user-service
    private Long routeId;
    private String routeName; // Replicated from route-service
}

// Listen to user update events and update local cache
@EventListener
public void onUserUpdated(UserUpdatedEvent event) {
    bookingRepository.updateUserInfo(event.getUserId(), event.getName(), event.getEmail());
}
```
- Pros: Fast reads, no inter-service calls
- Cons: Eventual consistency, data duplication

### Smart-Transit Data Model

Each service has independent JPA entities and H2 database:

**user-service:**
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    // ...
}
```

**booking-service** (when fully implemented):
```java
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;     // Foreign key by convention, not DB constraint
    private Long routeId;    // Foreign key by convention, not DB constraint
    private LocalDateTime bookingTime;
    // ...
}
```

Note: No foreign key constraints in database (different databases). Services maintain referential integrity via API calls.

---

## Configuration Management

### Configuration in Microservices

Each service needs configuration:
- Database URLs
- Service ports
- Eureka URLs
- API keys
- Feature flags

**Challenges:**
- Each service has its own `application.properties`
- Changing config requires rebuild/redeploy
- Different configs for dev/test/prod

### Configuration Strategies

**1. Local Configuration Files** (current Smart-Transit approach)

```
user-service/src/main/resources/application.properties
booking-service/src/main/resources/application.properties
```

**Pros:** Simple, no external dependencies
**Cons:** Must rebuild to change, no centralization

**2. Environment Variables**

```java
@Value("${DATABASE_URL}")
private String databaseUrl;
```

```powershell
# Windows
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/userdb"
mvn spring-boot:run

# Linux
DATABASE_URL="jdbc:postgresql://localhost:5432/userdb" mvn spring-boot:run
```

**3. Spring Cloud Config Server**

Centralized configuration server that services pull config from.

```
┌──────────────────┐
│  Config Server   │ ← Git repo with config files
└────────┬─────────┘
         │
    ┌────┼────┬────┐
    ↓    ↓    ↓    ↓
  [S1] [S2] [S3] [S4]  Services fetch config on startup
```

**Setup Config Server:**
```java
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication { }
```

```properties
# Config server application.properties
server.port=8888
spring.cloud.config.server.git.uri=https://github.com/org/config-repo
```

**Config Repository Structure:**
```
config-repo/
├── user-service.properties       # user-service specific
├── booking-service.properties    # booking-service specific
├── application.properties        # All services
├── application-dev.properties    # Dev environment
├── application-prod.properties   # Prod environment
```

**Services as clients:**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

```properties
# bootstrap.properties (loaded before application.properties)
spring.application.name=user-service
spring.cloud.config.uri=http://localhost:8888
spring.profiles.active=dev
```

**4. Kubernetes ConfigMaps/Secrets**

When deploying to Kubernetes:

```yaml
# ConfigMap
apiVersion: v1
kind: ConfigMap
metadata:
  name: user-service-config
data:
  application.properties: |
    server.port=8080
    eureka.client.service-url.defaultZone=http://eureka:8761/eureka/
```

```yaml
# Deployment references ConfigMap
spec:
  containers:
  - name: user-service
    envFrom:
    - configMapRef:
        name: user-service-config
```

### Profile-Based Configuration

Spring profiles allow different configs for different environments.

```properties
# application.properties (default)
spring.application.name=user-service
server.port=8082

# application-dev.properties (development)
spring.datasource.url=jdbc:h2:mem:userdb
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

# application-prod.properties (production)
spring.datasource.url=jdbc:postgresql://prod-db:5432/userdb
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
eureka.client.service-url.defaultZone=http://eureka.prod.internal:8761/eureka/
```

**Activating profiles:**
```powershell
# Command line
mvn spring-boot:run -Dspring-boot.run.profiles=prod

# Environment variable
$env:SPRING_PROFILES_ACTIVE="prod"
mvn spring-boot:run

# In application.properties
spring.profiles.active=dev
```

---

## Best Practices

### 1. Service Design

**Single Responsibility:**
- Each service owns one business domain
- Example: user-service manages users, NOT users + bookings

**API Design:**
- Use REST conventions (GET, POST, PUT, PATCH, DELETE)
- Version APIs (`/api/v1/users`)
- Use DTOs for API contracts, not entities
- Validate inputs with Jakarta Validation

**Example DTO with Validation:**
```java
public class UserDto {

    @NotNull(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be 2-50 characters")
    private String firstName;

    @NotNull(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number")
    private String phone;

    // getters/setters
}
```

### 2. Error Handling

**Global Exception Handler:**
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );

        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Validation failed",
            errors,
            Instant.now()
        );
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal server error",
            Instant.now()
        );
        return ResponseEntity.status(500).body(error);
    }
}
```

### 3. Logging and Monitoring

**Structured Logging:**
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public UserDto create(UserDto dto) {
        logger.info("Creating user with email: {}", dto.getEmail());

        try {
            User user = userRepository.save(mapper.toEntity(dto));
            logger.info("User created successfully with ID: {}", user.getId());
            return mapper.toDto(user);
        } catch (Exception e) {
            logger.error("Failed to create user: {}", e.getMessage(), e);
            throw e;
        }
    }
}
```

**Correlation IDs** (trace requests across services):
```java
@Component
public class CorrelationIdFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String correlationId = httpRequest.getHeader("X-Correlation-ID");

        if (correlationId == null) {
            correlationId = UUID.randomUUID().toString();
        }

        MDC.put("correlationId", correlationId);

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove("correlationId");
        }
    }
}
```

**Actuator Endpoints** (health checks, metrics):
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```properties
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always
```

Endpoints:
- `http://localhost:8082/actuator/health` - Health status
- `http://localhost:8082/actuator/metrics` - Application metrics
- `http://localhost:8082/actuator/info` - Application info

### 4. Testing

**Unit Tests** (test service logic in isolation):
```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository repository;

    @Mock
    private UserMapper mapper;

    @InjectMocks
    private UserServiceImpl service;

    @Test
    void testCreateUser() {
        UserDto dto = new UserDto("John", "Doe", "john@example.com");
        User entity = new User();
        entity.setId(1L);

        when(mapper.toEntity(dto)).thenReturn(entity);
        when(repository.save(any(User.class))).thenReturn(entity);
        when(mapper.toDto(entity)).thenReturn(dto);

        UserDto result = service.create(dto);

        assertNotNull(result);
        verify(repository).save(any(User.class));
    }
}
```

**Integration Tests** (test full request/response):
```java
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
class UserControllerIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testCreateUser() {
        UserDto dto = new UserDto("John", "Doe", "john@example.com");

        ResponseEntity<UserDto> response = restTemplate.postForEntity(
            "/api/users",
            dto,
            UserDto.class
        );

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getId());
    }
}
```

**Contract Testing** (test service contracts):
- Use Spring Cloud Contract or Pact
- Ensure service A's expectations match service B's API

### 5. Security

**Authentication with JWT:**

```java
// JWT Token structure
{
  "sub": "user123",           // Subject (user ID)
  "name": "John Doe",
  "email": "john@example.com",
  "roles": ["USER", "ADMIN"],
  "iat": 1609459200,          // Issued at
  "exp": 1609545600           // Expiration
}
```

**Gateway-level Authentication:**
```java
@Component
public class AuthenticationFilter implements GatewayFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");

        if (token == null || !isValidToken(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        return chain.filter(exchange);
    }
}
```

**Service-level Authorization:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .requestMatchers("/api/bookings/**").authenticated()
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt());

        return http.build();
    }
}
```

### 6. Deployment

**Containerization with Docker:**

```dockerfile
# user-service/Dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/user-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Docker Compose (local development):**

```yaml
version: '3.8'

services:
  discovery-service:
    build: ./discovery-service
    ports:
      - "8761:8761"
    networks:
      - smart-transit-network

  gateway-service:
    build: ./gateway-service
    ports:
      - "8080:8080"
    environment:
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://discovery-service:8761/eureka/
    depends_on:
      - discovery-service
    networks:
      - smart-transit-network

  user-service:
    build: ./user-service
    ports:
      - "8082:8082"
    environment:
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://discovery-service:8761/eureka/
    depends_on:
      - discovery-service
    networks:
      - smart-transit-network

networks:
  smart-transit-network:
    driver: bridge
```

**Kubernetes Deployment:**

```yaml
# user-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: smarttransit/user-service:1.0
        ports:
        - containerPort: 8082
        env:
        - name: EUREKA_CLIENT_SERVICEURL_DEFAULTZONE
          value: http://eureka-service:8761/eureka/
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8082
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health
            port: 8082
          initialDelaySeconds: 30
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
  - port: 8082
    targetPort: 8082
  type: ClusterIP
```

---

## Common Interview Questions

### Architecture Questions

**Q1: What are the main differences between monolithic and microservices architecture?**

**Answer:**
- **Monolithic**: Single deployable unit, tightly coupled, single database, scales as a whole
- **Microservices**: Multiple independent services, loosely coupled, database per service, independent scaling
- **Trade-offs**: Monoliths are simpler but less flexible; microservices are complex but more scalable and maintainable

**Q2: How do microservices communicate with each other?**

**Answer:**
- **Synchronous**: REST APIs (HTTP), gRPC - service waits for response
- **Asynchronous**: Message queues (RabbitMQ, Kafka), events - fire and forget
- **In Smart-Transit**: We use REST over HTTP with service discovery (Eureka) and load balancing

**Q3: What is the purpose of an API Gateway?**

**Answer:**
- Single entry point for all client requests
- **Responsibilities**: Routing, load balancing, authentication, rate limiting, request/response transformation
- **Benefits**: Hides service complexity, centralizes cross-cutting concerns, reduces client coupling
- **In Smart-Transit**: Spring Cloud Gateway routes requests to services via Eureka

### Service Discovery

**Q4: Explain how service discovery works.**

**Answer:**
- Services register with registry (Eureka) on startup with name, IP, port
- Services send heartbeats to stay registered
- Clients query registry to find service instances
- **Types**: Client-side (Eureka) vs Server-side (Kubernetes DNS)
- **In Smart-Transit**: Eureka Server at 8761, all services register, gateway uses discovery for routing

**Q5: What happens if Eureka server goes down?**

**Answer:**
- Services cache registry locally, continue working with cached data
- New services can't register, existing services can't discover new instances
- Eureka can run in HA mode (multiple instances) for resilience
- Self-preservation mode prevents mass de-registration during network issues

### Resilience

**Q6: Explain the Circuit Breaker pattern.**

**Answer:**
- Prevents cascading failures by stopping calls to failing service
- **States**: CLOSED (normal), OPEN (failing, immediate failure), HALF_OPEN (testing recovery)
- **Configuration**: Failure threshold, timeout, sliding window
- **In Smart-Transit**: Resilience4j in gateway with fallback endpoint, 50% failure threshold, 10 request window

**Q7: What's the difference between Circuit Breaker and Retry?**

**Answer:**
- **Retry**: Attempt same request again (useful for transient failures like network blips)
- **Circuit Breaker**: Stop trying after repeated failures (useful for sustained outages)
- **Best practice**: Use both - retry a few times, then circuit break if still failing

### Data Management

**Q8: How do you handle transactions across multiple microservices?**

**Answer:**
- **Challenge**: No distributed ACID transactions (different databases)
- **Solution**: Saga pattern - sequence of local transactions with compensating actions
- **Types**: Choreography (event-driven) vs Orchestration (central coordinator)
- **Example**: Booking creation → validate user → process payment → confirm booking (rollback if any step fails)

**Q9: How do you handle data consistency in microservices?**

**Answer:**
- **Approach**: Eventual consistency (not immediate consistency)
- **Patterns**:
  - Saga for distributed transactions
  - Event sourcing for audit trail
  - CQRS for read/write separation
  - Data replication with events
- **Trade-off**: Accept temporary inconsistency for availability and partition tolerance (CAP theorem)

### Spring Boot Specific

**Q10: What is the difference between @RestController and @Controller?**

**Answer:**
- `@Controller`: Returns view names (for Thymeleaf, JSP)
- `@RestController`: `@Controller` + `@ResponseBody`, returns JSON/XML directly
- Microservices use `@RestController` since they're APIs, not web apps

**Q11: Explain @Transactional annotation.**

**Answer:**
- Marks method to run in database transaction
- **Behavior**: All DB operations succeed or all rollback
- **Propagation**: REQUIRED (default, join existing or create), REQUIRES_NEW (always create new)
- **Isolation**: Controls concurrent transaction behavior
- **In Smart-Transit**: `UserServiceImpl` class has `@Transactional` for service layer

**Q12: What is MapStruct and why use it?**

**Answer:**
- Compile-time code generator for entity ↔ DTO mapping
- **Benefits**: Type-safe, fast, less boilerplate than manual mapping
- **Alternative**: ModelMapper (runtime reflection, slower)
- **In Smart-Transit**: `UserMapper` interface generates `UserMapperImpl` at compile time

### Testing

**Q13: What's the difference between unit and integration tests in microservices?**

**Answer:**
- **Unit Tests**: Test single component in isolation (mock dependencies)
  - Example: Test `UserService` with mocked `UserRepository`
  - Fast, no Spring context
- **Integration Tests**: Test full request/response flow
  - Example: POST to `/api/users`, verify 201 response with real DB
  - Slower, start Spring context with `@SpringBootTest`

**Q14: How do you test inter-service communication?**

**Answer:**
- **Contract Testing**: Verify service A's expectations match service B's API
- **Tools**: Spring Cloud Contract, Pact
- **Consumer-Driven Contracts**: Consumer defines expected API, producer verifies
- **Integration Tests**: Use WireMock to mock external services

### Deployment

**Q15: How do you deploy microservices?**

**Answer:**
- **Containerization**: Docker images for each service
- **Orchestration**: Kubernetes, Docker Swarm, AWS ECS
- **CI/CD**: GitHub Actions, Jenkins - build, test, deploy automatically
- **Service Mesh**: Istio, Linkerd for advanced routing, security, observability
- **In Smart-Transit**: Currently local Maven runs, production would use containers

**Q16: What are health checks and why are they important?**

**Answer:**
- Endpoints that report service health status
- **Liveness**: Is service alive? (restart if not)
- **Readiness**: Is service ready for traffic? (remove from load balancer if not)
- **Spring Boot Actuator**: `/actuator/health` endpoint
- **Kubernetes**: Uses probes to restart unhealthy pods

### Monitoring & Observability

**Q17: How do you monitor microservices?**

**Answer:**
- **Metrics**: Prometheus + Grafana (CPU, memory, request rate, latency)
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana) or Loki
- **Distributed Tracing**: Zipkin, Jaeger (trace request across services)
- **Correlation IDs**: Track single request across multiple services
- **Actuator**: Exposes metrics, health, info endpoints

**Q18: What is distributed tracing?**

**Answer:**
- Tracks request journey across multiple services
- Each request gets unique trace ID
- Each service adds span (operation) to trace
- **Example**:
  ```
  Trace ID: abc123
    - Gateway span (20ms)
    - User Service span (50ms)
    - Booking Service span (30ms)
  Total: 100ms
  ```
- **Tools**: Sleuth (instrumentation) + Zipkin (visualization)

### Security

**Q19: How do you secure microservices?**

**Answer:**
- **Authentication**: JWT tokens, OAuth2, centralized auth service
- **Authorization**: Role-based access control (RBAC)
- **Transport Security**: TLS/HTTPS for inter-service communication
- **API Gateway**: Centralized authentication/authorization
- **Secret Management**: Vault, Kubernetes Secrets (not hardcoded)
- **Network Security**: Service mesh, network policies

**Q20: What is OAuth2 and how does it work with microservices?**

**Answer:**
- Authorization framework for delegated access
- **Flow**:
  1. User authenticates with Auth Server (login)
  2. Auth Server issues JWT access token
  3. Client includes token in requests: `Authorization: Bearer <token>`
  4. Gateway validates token
  5. Services trust gateway-validated requests
- **Roles**: Resource Owner (user), Client (app), Authorization Server, Resource Server (API)

---

## Summary: Smart-Transit Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│              (Mobile App, Web App, etc.)                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
                   ┌─────────────────┐
                   │  API Gateway    │ (Port 8080)
                   │  Circuit Breaker│
                   │  Load Balancer  │
                   └────────┬────────┘
                            │
                            ↓
                   ┌─────────────────┐
                   │ Service Registry│ (Eureka: 8761)
                   │    (Eureka)     │
                   └────────┬────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ↓                  ↓                  ↓
    ┌─────────┐        ┌─────────┐       ┌─────────┐
    │  User   │        │ Booking │       │  Route  │
    │ Service │        │ Service │       │ Service │
    │ (8082)  │        │         │       │         │
    └────┬────┘        └────┬────┘       └────┬────┘
         │                  │                  │
    ┌────▼────┐        ┌────▼────┐       ┌────▼────┐
    │  H2 DB  │        │  H2 DB  │       │  H2 DB  │
    └─────────┘        └─────────┘       └─────────┘

Key Technologies:
- Spring Boot 3.1.6 + Java 17
- Spring Cloud 2023.0.5
- Netflix Eureka (Discovery)
- Spring Cloud Gateway
- Resilience4j (Circuit Breaker)
- JPA/Hibernate + H2
- MapStruct (DTO Mapping)
- Maven (Build)
```

---

This guide covers the essential concepts for understanding and building Spring Boot microservices. Use it as a reference for your Smart-Transit project and interview preparation.
