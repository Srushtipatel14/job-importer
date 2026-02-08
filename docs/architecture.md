# System Architecture & Design Decisions

## 1. System Overview

The Job Importer system is designed to reliably ingest job data from multiple external XML-based feeds, process them asynchronously, and store them in MongoDB while maintaining a complete history of each import run.

The system follows a **producer–consumer architecture** using Redis-backed queues to ensure scalability, fault tolerance, and high throughput.

---

## 2. High-Level Architecture

### Components

1. **Cron Scheduler**
   - Triggers job import every 1 hour
   - Fetches job feeds from external APIs

2. **Queue Producer**
   - Pushes each job into a Redis-backed queue
   - Decouples ingestion from processing

3. **Queue Workers**
   - Consume jobs concurrently
   - Perform validation and upsert operations
   - Handle retries and failures

4. **Database**
   - MongoDB stores job records
   - Separate collection for import history (`importlogs`)

5. **Admin UI**
   - Displays import history and processing status

---

## 3. Technology Choices & Decision Making

### Frontend: Next.js

**Why Next.js?**
- Built-in routing and layouts
- Easy environment-based configuration
- Fast development for admin dashboards
- Suitable for future SSR or API integration

Used mainly as an **Admin UI**, not a public-facing app.

---

### Backend: Node.js (Express)

**Why Node.js with Express?**
- Non-blocking I/O for high-throughput ingestion
- Easy integration with queues and workers
- Mature ecosystem for Redis, MongoDB, and cron jobs
- Simple, explicit architecture (preferred over NestJS for this assignment)

---

### Database: MongoDB (Mongoose)

**Why MongoDB?**
- Schema flexibility for varied job feeds
- Supports fast upserts using indexed fields
- Horizontal scalability
- Well-suited for large datasets (1M+ records)

**Mongoose** is used for:
- Schema enforcement
- Validation
- Clean data modeling

---

## 4. Queue System: Bull vs BullMQ

### Bull (Older)
- Built on Redis
- Stable but **no longer actively developed**
- Uses older Redis commands
- Less modular
- Not optimized for Redis Cluster

### BullMQ (Chosen)

**Why BullMQ was chosen:**
- Modern rewrite of Bull
- Actively maintained
- Better performance and memory usage
- Native support for:
  - Worker threads
  - Retry strategies
  - Delayed jobs
  - Rate limiting
- Designed for Redis Cluster and cloud Redis

👉 **Decision:**  
BullMQ was selected to ensure **future-proofing, scalability, and better failure handling**.

---

## 5. Queue Processing Design

### Flow

1. Cron job fetches jobs from external APIs
4. Raw XML data is added to the BullMQ queue
3. Workers consume jobs from the queue
4. XML data is converted to JSON inside the worker
5. MongoDB upsert logic prevents duplicates
6. Import results are logged

---

### Concurrency Control

- Worker concurrency is configurable via environment variables
- Prevents database overload
- Allows horizontal scaling by adding more workers

---

## 6. Dead Letter Queue (DLQ) Design

### What is a Dead Letter Queue?

A Dead Letter Queue stores jobs that **failed permanently** after all retry attempts.

---

### Why DLQ is Required?

- Prevents infinite retry loops
- Enables debugging and reprocessing
- Improves system reliability
- Essential for large-scale ingestion systems

---

### DLQ Implementation in This System

- Jobs failing due to:
  - Validation errors
  - Database errors
  - Unexpected exceptions
- Are moved to a **Dead Worker**
- Failure details are logged in `import_logs`
- Each failed job includes:
  - Job ID
  - Failure reason
  - Timestamp

This ensures **no data loss** and **complete traceability**.

---

## 7. Import History Tracking

Each cron execution creates an import log entry containing:

- Feed URL (fileName)
- Timestamp
- Total jobs fetched
- New jobs created
- Jobs updated
- Failed jobs with reasons

This data is stored in the `importlogs` collection and displayed in the Admin UI.

---

## 8. Scalability Considerations

- Queue-based architecture decouples ingestion and processing
- Horizontal scaling by adding more workers
- MongoDB indexed upserts avoid duplicates
- Redis Cloud support for production environments
- Easy migration to microservices if needed

---
## 9. Future Enhancements

- **Separate Application & Worker Services**  
  Run the API server (cron + producers) and queue workers as **independent services**.  
  This allows:
  - Independent scaling of workers
  - Zero downtime deployments
  - Better fault isolation
  - Easier migration to microservices

- **Real-time updates using WebSockets / Server-Sent Events**  
  Stream import status and job progress to the Admin UI in real time.

- **Manual retry of failed jobs from Admin UI**  
  Allow reprocessing of jobs stored in the Dead Letter Queue (DLQ).

- **Feed-level rate limiting and throttling**  
  Prevent external API blocking by controlling request frequency per feed.

- **Metrics and monitoring (Prometheus / Grafana)**  
  Track job throughput, failure rates, worker performance, and queue latency.

- **Containerized deployment (Docker)**  
  Run API server, worker service, MongoDB, and Redis as separate containers for
  consistent and scalable deployments.


---

## 10. Summary

This architecture prioritizes:
- Scalability
- Fault tolerance
- Clear separation of concerns
- Production-ready patterns

The design ensures the system can handle **large volumes of data reliably**, while remaining easy to extend and maintain.
