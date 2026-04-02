FROM eclipse-temurin:17-jdk

WORKDIR /app

# Install Maven (Render Docker deploy)
RUN apt-get update && apt-get install -y maven

# Copy all project files
COPY . .

# Build the project
RUN mvn clean package -DskipTests

# Run the Spring Boot app
# NOTE: Exec-form CMD does not expand wildcards; use the concrete jar name.
CMD ["java", "-jar", "target/marketai-suite-1.0.0-SNAPSHOT.jar"]