# Project 08: Database Lab (TypeScript)

Full hands-on implementation and performance comparison for four major database engines (SQLite3, PostgreSQL, MongoDB, and Redis) comparing **Raw SQL / Native Drivers vs Prisma ORM / Mongoose ODM**.

---

## Technical Scope & Architecture

| Database   | Model Type          | Driver / Client       | ORM / ODM Paradigm | Real-Life Use Case                                                   |
| ---------- | ------------------- | --------------------- | ------------------ | -------------------------------------------------------------------- |
| SQLite3    | Embedded Relational | sqlite3               | Prisma ORM Client  | Local desktop/CLI task store, WAL mode, ACID transactions            |
| PostgreSQL | Server Relational   | pg (Pool)             | Prisma ORM Client  | Centralized ACID store, Full-Text Search (tsvector), GIN JSONB index |
| MongoDB    | Document NoSQL      | mongodb (MongoClient) | Mongoose ODM       | Flexible document payloads, Aggregation Pipeline analytics           |
| Redis      | In-Memory Key-Value | ioredis               | N/A                | Cache-Aside layer, Sliding Window Rate Limiter, Session TTL, Pub/Sub |

---

## Environment & Prisma Setup

### 1. Environment Configuration File Setup

Before generating Prisma schemas or running tests, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

_(Or rename `.env.example` to `.env` in your file explorer to ensure database connection URLs are loaded properly)._

### 2. Docker Database Containers

```bash
# 1. PostgreSQL (Default user: postgres, pass: postgres, port: 5432, db: task_db)
docker run -d --name pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=task_db postgres:16

# 2. MongoDB (Default port: 27017)
docker run -d --name mongo -p 27017:27017 mongo:7

# 3. Redis (Default port: 6379)
docker run -d --name redis -p 6379:6379 redis:7
```

### 3. Initialize Prisma Client & Database Schemas

Generate Prisma Client models for both PostgreSQL and SQLite:

```bash
npm run prisma:gen
npm run prisma:push
```

---

## File Structure

```
projects/08-database-lab/TypeScript/
├── package.json
├── tsconfig.json
├── README.md
├── .env.example
├── prisma/
│   ├── schema.prisma        # PostgreSQL Prisma ORM model
│   └── schema.sqlite.prisma # SQLite Prisma ORM model
└── src/
    ├── config/
    │   └── config.ts        # Centralized environment loader & DB connection defaults
    ├── sqlite/
    │   ├── raw_sqlite.ts    # PRAGMA WAL, tables, parameterized SQL, ACID transactions
    │   └── orm_sqlite.ts    # Dedicated SQLite Prisma Client ORM implementation
    ├── postgres/
    │   ├── raw_postgres.ts  # Pool connection, JSONB indexing, Full-Text Search, CTEs
    │   └── orm_postgres.ts  # PostgreSQL Prisma Client ORM implementation
    ├── mongo/
    │   ├── raw_mongo.ts     # Native MongoClient, Aggregation Pipeline, $push subtasks
    │   └── odm_mongo.ts     # Mongoose Schema, validators, virtual progress calculation
    ├── redis/
    │   ├── redis_cache.ts   # Cache-Aside pattern, Pipelining, hash storage
    │   └── redis_features.ts# Rate Limiter (ZSET), Session TTL, Pub/Sub events
    └── benchmark/
        └── benchmark.ts     # Raw SQL vs Prisma ORM / Mongoose ODM benchmark suite
```

---

## Running Benchmarks & Tests

### 1. Install Dependencies

```bash
npm install
```

### 2. Standard Benchmark (100,000 Operations)

```bash
npm run bench
```

### 3. High Scale Benchmark (1,000,000 Operations)

```bash
npm run bench:1m
```

### 4. Individual Test Executions

- SQLite Raw SQL: `npm run test:sqlite:raw`
- SQLite Prisma ORM: `npm run test:sqlite:orm`
- PostgreSQL Raw SQL: `npm run test:postgres:raw`
- PostgreSQL Prisma ORM: `npm run test:postgres:orm`
- MongoDB Native Driver: `npm run test:mongo:raw`
- MongoDB Mongoose ODM: `npm run test:mongo:odm`
- Redis Cache Pipelined: `npm run test:redis:cache`
- Redis Features: `npm run test:redis:features`

---

## Benchmark Results & Column Breakdown

### Table Column Definitions

| Column Name      | Definition                                                                                           | Metric Unit           | Desired Value    |
| ---------------- | ---------------------------------------------------------------------------------------------------- | --------------------- | ---------------- |
| **Database**     | Database engine being tested (SQLite3, PostgreSQL, MongoDB, Redis)                                   | Text                  | N/A              |
| **Architecture** | Specific paradigm tested (`Raw SQL`, `Prisma ORM`, `Native Driver`, `Mongoose ODM`, `Native Client`) | Text                  | N/A              |
| **Operation**    | Description of workload (bulk insert vs read) and total item count                                   | Text                  | N/A              |
| **Ops Count**    | Total number of operations executed in the test batch                                                | Integer               | Higher           |
| **Total Time**   | Total duration elapsed to process the full operation batch                                           | Milliseconds (ms)     | Lower is Faster  |
| **Latency**      | Average latency required to complete a single operation                                              | Milliseconds per Op   | Lower is Faster  |
| **Ops/s**        | Throughput capacity calculated as `(count / totalTimeMs) * 1000`                                     | Operations per Second | Higher is Better |
| **Status**       | Execution state of test run (`SUCCESS` vs `OFFLINE`)                                                 | Status Text           | SUCCESS          |

---

### Actual Benchmark Output: 100,000 Operations Scale (`npm run bench`)

| Database       | Architecture  | Operation                              | Ops Count | Total Time | Latency   | Ops/s    | Status  |
| -------------- | ------------- | -------------------------------------- | --------- | ---------- | --------- | -------- | ------- |
| **SQLite3**    | Raw SQL       | Bulk Insert (100,000 items)            | 100,000   | 1,504 ms   | 0.015 ms  | 66.5K/s  | SUCCESS |
| **SQLite3**    | Raw SQL       | Indexed Read (1,000 ops)               | 1,000     | 296 ms     | 0.296 ms  | 3.4K/s   | SUCCESS |
| **SQLite3**    | Prisma ORM    | Bulk Insert (100,000 items)            | 100,000   | 9,162 ms   | 0.0916 ms | 10.9K/s  | SUCCESS |
| **SQLite3**    | Prisma ORM    | Indexed Read (1,000 ops)               | 1,000     | 1,667 ms   | 1.667 ms  | 600/s    | SUCCESS |
| **PostgreSQL** | Raw SQL       | Bulk Insert (100,000 items)            | 100,000   | 15,319 ms  | 0.1532 ms | 6.5K/s   | SUCCESS |
| **PostgreSQL** | Raw SQL       | Indexed Read (1,000 ops)               | 1,000     | 3,872 ms   | 3.872 ms  | 258/s    | SUCCESS |
| **PostgreSQL** | Prisma ORM    | Bulk Insert (100,000 items)            | 100,000   | 14,396 ms  | 0.144 ms  | 6.9K/s   | SUCCESS |
| **PostgreSQL** | Prisma ORM    | Indexed Read (1,000 ops)               | 1,000     | 4,270 ms   | 4.27 ms   | 234/s    | SUCCESS |
| **MongoDB**    | Native Driver | Bulk Insert (100,000 items)            | 100,000   | 17,037 ms  | 0.1704 ms | 5.9K/s   | SUCCESS |
| **MongoDB**    | Native Driver | Document Read (1,000 ops)              | 1,000     | 2,700 ms   | 2.7 ms    | 370/s    | SUCCESS |
| **MongoDB**    | Mongoose ODM  | Bulk Insert (100,000 items)            | 100,000   | 20,203 ms  | 0.202 ms  | 5.0K/s   | SUCCESS |
| **MongoDB**    | Mongoose ODM  | Document Read (1,000 ops)              | 1,000     | 3,717 ms   | 3.717 ms  | 269/s    | SUCCESS |
| **Redis**      | Native Client | Pipelined Set (100,000 ops)            | 100,000   | 1,868 ms   | 0.0187 ms | 53.5K/s  | SUCCESS |
| **Redis**      | Native Client | Pipelined Get (100,000 ops, 100K hits) | 100,000   | 940 ms     | 0.0094 ms | 106.4K/s | SUCCESS |
