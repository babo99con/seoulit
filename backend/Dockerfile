FROM gradle:8.11-jdk21 AS builder
WORKDIR /app

# Copy only the files needed to build to keep the image small
COPY build.gradle settings.gradle gradlew gradlew.bat ./
COPY gradle gradle
COPY src src

RUN chmod +x gradlew
RUN sed -i 's/\r$//' gradlew
RUN ./gradlew bootWar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=builder /app/build/libs/*.war app.war

EXPOSE 3001
ENTRYPOINT ["java", "-jar", "/app/app.war"]
