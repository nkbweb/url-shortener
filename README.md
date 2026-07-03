<div align="center">
  <h1>🔗 URL Shortener API</h1>
  <p>
    <strong>A production-grade URL shortening service built with Express, TypeScript, Prisma &amp; PostgreSQL</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Express-5.2-000000?logo=express" alt="Express 5.2"/>
    <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Prisma-7.8-2D3748?logo=prisma" alt="Prisma 7.8"/>
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql" alt="PostgreSQL"/>
    <img src="https://img.shields.io/badge/Redis-BullMQ-DC382D?logo=redis" alt="Redis + BullMQ"/>
  </p>
</div>

---

## ✨ Features

- **URL Shortening** — Generate short, unique codes for any valid URL
- **Click Analytics** — Track every click with referrer, user-agent, IP & timestamp
- **User Authentication** — Email/password registration & login with JWT (access + refresh tokens)
- **Rate Limiting** — Protect endpoints from abuse with configurable rate limits
- **Background Jobs** — Asynchronous processing via BullMQ (Redis-backed queue)
- **Password Reset** — Secure password reset flow with time-limited tokens sent via email (Resend)
- **API Documentation** — Interactive Swagger UI at `/api-docs`
- **Security** — Helmet headers, CORS, bcrypt password hashing, Zod input validation
- **Dockerized** — One-command setup with `docker compose up`
- **Health Check** — `/health` endpoint for monitoring

---

## 🧱 Tech Stack

| Layer          | Technology                                                         |
| -------------- | ------------------------------------------------------------------ |
| **Runtime**    | Node.js + TypeScript                                               |
| **Framework**  | Express 5                                                          |
| **Database**   | PostgreSQL 16 via Prisma ORM                                       |
| **Cache / Queue** | Redis + BullMQ                                                 |
| **Auth**       | bcrypt + JSON Web Tokens (access & refresh)                        |
| **Validation** | Zod                                                                |
| **Email**      | Resend API                                                         |
| **Docs**       | Swagger (OpenAPI) via swagger-jsdoc                                |
| **Container**  | Docker & Docker Compose                                            |

---

## 📁 Project Structure

```
src/
├── config/          # Swagger configuration
├── controllers/     # Route handlers (auth, url)
├── lib/             # Prisma client, Redis, BullMQ queue
├── middleware/      # Auth guard, rate limiter, validation
├── routes/          # Express route definitions
├── services/        # Business logic (auth, url, analytics, email)
├── types/           # TypeScript type definitions
├── utils/           # Short-code generator, URL reachability checker
├── validators/      # Zod schemas for request validation
├── app.ts           # Express app setup (middleware, routes)
├── server.ts        # Entry point — starts HTTP server
└── worker.ts        # BullMQ worker for background jobs
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL 16
- Redis
- npm

### 1. Clone & Install

```bash
git clone https://github.com/<your-org>/url-shortener.git
cd url-shortener
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

| Variable            | Description                            | Default                          |
| ------------------- | -------------------------------------- | -------------------------------- |
| `PORT`              | Server port                            | `3000`                           |
| `NODE_ENV`          | Environment                            | `development`                    |
| `DATABASE_URL`      | PostgreSQL connection string           | `postgresql://postgres:postgres@localhost:5432/url_shortener` |
| `JWT_SECRET`        | Secret for signing tokens              | —                                |
| `JWT_ACCESS_SECRET` | Access-token signing key               | —                                |
| `JWT_REFRESH_SECRET`| Refresh-token signing key              | —                                |
| `REDIS_HOST`        | Redis host                             | `localhost`                      |
| `REDIS_PORT`        | Redis port                             | `6379`                           |
| `REDIS_PASSWORD`    | Redis password (optional)              | —                                |
| `RESEND_API_KEY`    | Resend API key for transactional email | —                                |
| `FRONTEND_URL`      | Frontend origin (CORS)                 | `http://localhost:3001`          |
| `BASE_URL`          | Public base URL of this API            | `http://localhost:3000`          |

### 3. Database

```bash
npx prisma migrate dev
```

### 4. Start Development

```bash
# Terminal 1 — API server
npm run dev

# Terminal 2 — Background worker
npm run worker
```

Server starts at **http://localhost:3000**  
Swagger docs at **http://localhost:3000/api-docs**

### 🐳 Docker (Alternative)

```bash
docker compose up --build
```

This spins up the API, PostgreSQL, and Redis automatically.

---

## 📡 API Overview

| Method | Endpoint                     | Description            | Auth     |
| ------ | ---------------------------- | ---------------------- | -------- |
| POST   | `/auth/register`             | Create an account      | ❌      |
| POST   | `/auth/login`                | Log in                 | ❌      |
| POST   | `/auth/logout`               | Log out                | ✅      |
| POST   | `/auth/refresh`              | Refresh access token   | ❌      |
| POST   | `/auth/forgot-password`      | Request password reset | ❌      |
| POST   | `/auth/reset-password`       | Reset password         | ❌      |
| POST   | `/url/shorten`               | Create a short URL     | ❌      |
| GET    | `/url/:shortCode`            | Redirect to original   | ❌      |
| DELETE | `/url/:shortCode`            | Delete a short URL     | ✅      |
| GET    | `/url/analytics/:shortCode`  | Get click analytics    | ✅      |
| GET    | `/health`                    | Health check           | ❌      |

> Full request/response schemas are documented inline via Swagger at `/api-docs`.

---

## ⚙️ Background Worker

The BullMQ worker (`src/worker.ts`) handles asynchronous tasks such as:

- Enriching click metadata (geolocation, device detection)
- Periodic analytics aggregation
- Expired token cleanup

Start the worker separately in production:

```bash
npm run worker
```

---

## 🧪 Lint & Format

```bash
npm run lint          # ESLint
npm run lint:fix      # Auto-fix
npm run format        # Prettier
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT © [Nishchay Bhardwaj]
