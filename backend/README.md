# Medicharm Backend (Spring Boot)

## Quick start

1. Install MySQL and create database `medicharm` or allow Spring to create it:
   - `CREATE DATABASE medicharm;`

2. Update `src/main/resources/application.properties` with your MySQL credentials (spring.datasource.username and spring.datasource.password).

3. Build and run:
   - `mvn spring-boot:run`

4. API endpoints:
   - POST /api/auth/signup
   - POST /api/auth/login
   - POST /api/appointments/schedule
   - GET /api/appointments/user/{userId}
   - GET /api/medicines
   - POST /api/orders
