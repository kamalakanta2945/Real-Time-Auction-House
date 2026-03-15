# Real-Time Auction House (Concurrent Bidding)

This project is a web-based platform that allows multiple users to participate in auctions and place bids on items in real-time. It features a React frontend and a Spring Boot backend connected to a PostgreSQL database.

## Concurrency Control Strategy

To safely handle concurrent bids and prevent race conditions, the system uses optimistic locking provided by Spring Data JPA.

The `Auction` entity contains a version field annotated with `@Version`:

```java
@Version
private Long version;
```

### How Optimistic Locking Works:
1. When a user reads an auction record to place a bid, the current version number is retrieved.
2. When the backend attempts to update the auction with a new highest bid, Hibernate includes the version in the `WHERE` clause of the SQL `UPDATE` statement.
3. If another user has already placed a bid (and thus updated the auction), the version number in the database will have incremented.
4. Hibernate detects that the version has changed (the `UPDATE` affects 0 rows) and throws an `OptimisticLockException`.
5. The system catches this exception, rejects the outdated bid, and returns an error message to the user ("Another user has already placed a higher bid").
6. This guarantees that only one valid update succeeds concurrently, ensuring the highest bid is accurately maintained without the performance overhead of pessimistic locking.

## Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Java 17+
- Maven
- Node.js & npm

### 1. Start Database
Run the following command in the root directory to start the PostgreSQL database:
```bash
docker-compose up -d
```

### 2. Start Backend
Navigate to the `backend` directory and run the Spring Boot application:
```bash
cd backend
mvn spring-boot:run
```

### 3. Start Frontend
Navigate to the `frontend` directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).
