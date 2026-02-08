# Job Importer – Queue Based Job Processing System

## Overview

This project is a scalable job importer system that fetches jobs from external XML-based APIs, processes them asynchronously using Redis queues, stores them in MongoDB, and tracks import history for each run.

The system consists of:
- A **Node.js backend** for feed fetching, queue processing, and database operations  
- A **Next.js admin UI** to view import history and job status

---

## Project Structure

job-importer/
├── client/                         # Next.js frontend (Admin UI)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── server/                         # Backend application (API, queue processing, workers)
│   ├── src/
│   │   ├── constants/              # Application-wide constant values (status codes, messages, configs)
│   │   │   └── constants.js
│   │   ├── controllers/            # API controllers (request/response handling)
│   │   │   └── getImportLog.js      # API to fetch import history logs
│   │   ├── cron/                   # Scheduled jobs
│   │   │   └── feedCron.js          # Cron job to fetch job feeds every hour
│   │   ├── dbconn/                 # Mongodb connection logic
│   │   │   └── conn.js             
│   │   ├── models/                 # MongoDB schemas
│   │   │   ├── jobSchema.js        
│   │   │   └── logSchema.js       
│   │   ├── queues/                 # Queue definitions and Redis setup
│   │   │   ├── jobQueue.js          # BullMQ queue for job processing
│   │   │   └── redis.js             # Redis connection configuration
│   │   ├── services/               # Business logic layer
│   │   │   └── feedService.js       # Job feed fetching and processing logic
│   │   ├── utils/                  # Utility/helper functions
│   │   │   └── xmlToJson.js       
│   │   └── workers/                # Queue workers
│   │       ├── importWorker.js     
│   │       └── deadWorker.js      
│   ├── app.js                      # Express app entry point
│   ├── .env                        # Backend environment variables
│   └── package.json               
│
└── docs/
    └── architecture.md



---

## Prerequisites

Ensure the following are installed on your system:

- Node.js (v18 or higher)
- MongoDB (Local or MongoDB Atlas)
- Redis (Local or Redis Cloud)
- Git

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Srushtipatel14/job-importer.git
cd job-importer


### 2. Backend Setup
cd server
npm install

### Create a .env file inside the server directory:

MONGO_URL=mongodb+srv://srushtipatel:srushtipatel@cluster0.ajhzhg1.mongodb.net/jobImport?appName=Cluster0
PORT=8000
REDIS_URL=rediss://default:AWI_AAIncDJmMjJhMGQ4MTc0YWM0Y2ViYWMyZjkxZGIzODY2NjhlNnAyMjUxNTE@renewed-chimp-25151.upstash.io:6379

### 3. Frontend Setup
cd ../client
npm install

### Create a .env.local file inside the client directory:

NEXT_PUBLIC_API_URL=http://localhost:8000


## Running the Application

### 1. Start Backend Server

cd server
npm run dev


### Backend will run on:

http://localhost:8000

### 2. Start Worker

cd server
npm run worker


### 3. Start Frontend Server
cd client
npm run dev

### Frontend will run on:

http://localhost:3000