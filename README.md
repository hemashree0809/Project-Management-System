# Project Management System Backend

This is the backend API for a Project Management System built with **Node.js**, **Express.js**, **PostgreSQL**, and **Prisma 7 ORM**.

## Features

- **User Authentication**: Secure signup and login using `bcryptjs` for password hashing and **JSON Web Tokens (JWT)** for authentication.
- **Projects Module**: Full CRUD APIs for managing projects with strict user data isolation, pagination, and status-based filtering.
- **Tasks Module**: Full CRUD APIs for tasks belonging to projects, cascading deletes, and task filtering.
- **Input Validation**: Request payload filtering and validation via `express-validator`.
- **Global Error Handling**: Centered middleware capturing Prisma exceptions and application errors.
- **Graceful Shutdown**: Listeners for closing the HTTP server and database connections safely on exit signals.

---

## Directory Structure

```text
ISMO/
├── prisma/
│   └── schema.prisma         # Database schema mapping models and enums
├── src/
│   ├── config/
│   │   └── db.js             # Singleton Prisma Client with PostgreSQL pg Pool
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── health.controller.js
│   │   ├── project.controller.js
│   │   └── task.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js # JWT Auth Guard
│   │   ├── error.middleware.js # Centered Error Handler
│   │   └── validate.middleware.js # Express Validator inspector
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── health.routes.js
│   │   ├── index.js          # API Routes aggregator
│   │   ├── project.routes.js
│   │   └── task.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── project.service.js
│   │   └── task.service.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── project.validator.js
│   │   └── task.validator.js
│   └── app.js                # Express app setup and middleware pipeline
├── .env                      # Local Environment configurations (git-ignored)
├── .env.example              # Template Environment config
├── .gitignore                # Node.js standard git ignore rules
├── package.json              # NPM scripts and dependencies
├── prisma.config.ts          # Prisma 7 configurations block
└── server.js                 # App startup entry point
```

---

## Prerequisites

- **Node.js** (v18.x or higher recommended)
- **PostgreSQL** running database server

---

## Getting Started

### 1. Clone the project and Install Dependencies
Navigate to the root directory and run:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to a new file named `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your actual settings:
- Update `DATABASE_URL` with your PostgreSQL credentials (e.g., `postgresql://postgres:password@localhost:5432/my_database?schema=public`).
- Customize `PORT` (defaults to `5001` to avoid system port conflicts).
- Configure a strong `JWT_SECRET` for token signing.

### 3. Generate Prisma Client & Run Database Migrations
Create your database tables and compile the Prisma client types by running:
```bash
# Push schema directly (for development)
npx prisma db push

# OR run standard migrations
npx prisma migrate dev --name init
```

### 4. Start the Application

#### Development Mode (with Nodemon hot-reloading)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

Once started, the API will be available at: `http://localhost:5001/api`.

---

## API Documentation

### Public Endpoints

#### 1. Server Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Returns server metrics, node environment details, and verifies database connectivity.

#### 2. User Registration
- **Endpoint**: `POST /api/auth/register`
- **Payload**:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```

#### 3. User Login
- **Endpoint**: `POST /api/auth/login`
- **Payload**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**: Returns user details and a signed JWT `token`.

#### 4. User Logout
- **Endpoint**: `POST /api/auth/logout`
- **Description**: Standard API logout response. The client application is responsible for discarding the JWT token.

---

### Protected Endpoints (Requires Header: `Authorization: Bearer <JWT_TOKEN>`)

#### 5. Projects Management
- **Create Project**: `POST /api/projects`
  - *Payload*: `{"projectName": "App Build", "description": "Express app", "status": "IN_PROGRESS", "startDate": "2026-06-18T10:00:00Z", "endDate": "2026-09-18T10:00:00Z"}`
- **List User's Projects**: `GET /api/projects`
  - *Query Params (Optional)*: `page` (default 1), `limit` (default 10), `status` (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`)
- **Get Project by ID**: `GET /api/projects/:id`
  - *Note*: Returns project details along with its tasks.
- **Update Project**: `PUT /api/projects/:id`
- **Delete Project**: `DELETE /api/projects/:id`
  - *Note*: Cascade deletes all tasks belonging to the project.

#### 6. Tasks Management
- **Create Task**: `POST /api/tasks`
  - *Payload*: `{"taskName": "Setup Database", "description": "Run prisma db push", "priority": "HIGH", "status": "PENDING", "projectId": "UUID_HERE"}`
- **List Tasks**: `GET /api/tasks`
  - *Query Params (Optional)*: `projectId` (filters list to one project), `status` (`PENDING`, `IN_PROGRESS`, `COMPLETED`)
- **Get Task by ID**: `GET /api/tasks/:id`
- **Update Task**: `PUT /api/tasks/:id`
- **Delete Task**: `DELETE /api/tasks/:id`
