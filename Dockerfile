# Builds the Spring Boot API from the monorepo root (Railway Root Directory = /).
# For frontend or NLP, use separate services — see RAILWAY_SETUP.md.

FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY backend/ .
RUN chmod +x mvnw && ./mvnw -DskipTests package -q

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/mentorlink-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
