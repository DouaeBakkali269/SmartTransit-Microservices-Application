# Stage 1: Build using an official Maven image (no mvnw required)
FROM maven:3.9.6-eclipse-temurin-17 as builder

WORKDIR /app

# Copy pom and source
COPY pom.xml ./
COPY src ./src

# Build the application (skip tests for faster image builds)
RUN mvn -B -DskipTests package

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-jamm

WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/target/*.jar /app/app.jar

EXPOSE 8088

ENTRYPOINT ["java", "-jar", "/app/app.jar"]