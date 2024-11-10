# Use Maven image with OpenJDK 17 for the build stage
FROM maven:3.8-openjdk-17 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the pom.xml and source code to the container
COPY pom.xml .
COPY src ./src

# Run Maven build
RUN mvn clean install

# Use Eclipse Temurin JDK 17 for the runtime stage
FROM eclipse-temurin:17-jdk

# Set the working directory in the runtime container
WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/hackumass-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]





