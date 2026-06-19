# ProManage - Project Management System Backend

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-blue.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/framework-Express.js-green.svg)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/orm-Prisma%207-indigo.svg)](https://www.prisma.io/)
[![Database](https://img.shields.io/badge/database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-ISC-orange.svg)](https://opensource.org/licenses/ISC)

A production-grade, secure, and highly optimized RESTful API backend built to power Project Management Systems. This project serves as an internship-ready backend skeleton demonstrating clean code structures, layered design architectures, strict multi-tenant user isolation, and security practices using standard modern backend tools.

---

## 🚀 Project Overview

ProManage is a multi-user project coordination platform. This backend microservice administers user authentication, project coordination workspaces, and task checklists. Designed under a strict **Controller-Service-Repository** layered architecture, the backend isolates user spaces completely to ensure that users only interact with projects and tasks they own.

### Key Highlights
- **Layered Architecture**: Separation of concerns between routing schemas, payload validations, business services, and database queries.
- **Strict Data Isolation**: Multi-tenant authorization guards preventing cross-user workspace enumeration or resource tampering.
- **Graceful Lifecycle Management**: Clean cleanup hooks disconnecting active Prisma and HTTP bindings on shutdown signals.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Core Platform** | **Node.js** (v18+) | Async event-driven JavaScript runtime. |
| **Web Framework** | **Express.js** | Minimalist web application router framework. |
| **ORM** | **Prisma 7** | Type-safe database client and migration mapping. |
| **Database** | **PostgreSQL** | Relational transactional database engine. |
| **Security Guard** | **JWT Authentication** | Stateless cryptographically signed user token context. |
| **Encryption** | **bcryptjs** | Salt-hashed password credentials storage. |
| **Validator** | **Express Validator** | Declarative request payload sanitizer and checker. |

---

## 📁 Directory Structure

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

## 🗄️ Database Schema Overview

The relational database maps users, projects, and task checklists with strict cascading referential actions.

```mermaid
erDiagram
    users {
        string id PK "UUID"
        string full_name
        string email UK
        string password
        timestamp created_at
    }
    projects {
        string id PK "UUID"
        string project_name
        string description
        enum status "NOT_STARTED | IN_PROGRESS | COMPLETED"
        timestamp start_date
        timestamp end_date
        string user_id FK
        timestamp created_at
    }
    tasks {
        string id PK "UUID"
        string task_name
        string description
        enum priority "LOW | MEDIUM | HIGH"
        enum status "PENDING | IN_PROGRESS | COMPLETED"
        timestamp due_date
        string project_id FK
        timestamp created_at
    }

    users ||--o{ projects : "owns (onDelete: Cascade)"
    projects ||--o{ tasks : "contains (onDelete: Cascade)"
```

- **User**: Represents registered accounts. Owns zero or more projects.
- **Project**: Represents workspaces. Belongs to a User (`user_id`). Deleting a user cascades to remove their projects.
- **Task**: Represents checklist items. Belongs to a Project (`project_id`). Deleting a project cascades to remove all nested tasks.

---

## 🔒 Security Features

1. **Password Hashing**: Protects credentials in transit and storage by salt-hashing user passwords using `bcryptjs` (10 rounds). Hashed keys are never logged or returned in responses.
2. **JWT Authentication**: Users receive stateless JSON Web Tokens upon verified login. Tokens expire automatically and are signed using a server-side secret key (`JWT_SECRET`).
3. **Protected Routes**: Restricts workspace and list queries using the `authenticate` middleware. Requests require a `Authorization: Bearer <JWT>` header.
4. **Input Validation**: Sanitizes payloads via declarative Express Validator arrays. Invalid fields trigger standard `400 Bad Request` messages showing errors for every failed rule before hitting services.
5. **Error Handling**: Centered error interceptor formats and filters system logs. Hides precise code traces in production and converts Prisma error codes (e.g. `P2002` duplicate unique constraints) into user-friendly validation reports.
6. **Strict User Separation**: All project and task CRUD endpoints filter queries matching the authenticated `userId`. Users can never access, edit, or delete workspaces owned by other accounts (yielding `404 Not Found` messages).

---

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher recommended)
- **PostgreSQL** active database instance

### Setup Instructions

1. **Install Project Dependencies**
   Navigate to the root workspace directory and run:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a local configuration file from the template:
   ```bash
   cp .env.example .env
   ```
   Open the newly created `.env` file and input your local database and port configurations:
   ```env
   PORT=5001
   NODE_ENV=development
   DATABASE_URL="postgresql://username:password@localhost:5432/db_name?schema=public"
   JWT_SECRET="generate-a-long-random-string-here"
   JWT_EXPIRES_IN="1d"
   ```

3. **Initialize Database Schema**
   Apply Prisma migrations or sync the schema to generate database tables:
   ```bash
   # Sync schema directly (recommended for quick development setups)
   npx prisma db push

   # Or run standard migration files
   npx prisma migrate dev --name init
   ```

4. **Start the Application**
   - **Development Mode** (auto-reload on code change via Nodemon):
     ```bash
     npm run dev
     ```
   - **Production Mode**:
     ```bash
     npm start
     ```
   The backend API will listen on port `5001` (Endpoint Base: `http://localhost:5001/api`).

---

## 📖 API Documentation & Examples

### Public Auth Endpoints

#### 1. Server Health Check
- **Endpoint**: `GET /api/health`
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "healthy",
      "timestamp": "2026-06-19T06:54:07.300Z",
      "services": {
        "server": "online",
        "database": "connected"
      },
      "uptime": 380.42,
      "memoryUsage": { "rss": 76414976, "heapTotal": 28635136 },
      "system": { "nodeVersion": "v24.13.1", "platform": "win32" }
    }
  }
  ```

#### 2. User Registration
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response Example (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "5ff9ff1d-69ec-41fb-88ce-98f503ea79a8",
        "fullName": "Jane Doe",
        "email": "jane@example.com",
        "createdAt": "2026-06-19T12:00:00.000Z"
      }
    }
  }
  ```

#### 3. User Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "5ff9ff1d-69ec-41fb-88ce-98f503ea79a8",
        "fullName": "Jane Doe",
        "email": "jane@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

---

### Protected Endpoints (Requires `Authorization: Bearer <JWT_TOKEN>`)

#### 4. Projects Management

##### List User's Projects (`GET /api/projects`)
- **Query Parameters**:
  - `page` (optional, default: `1`)
  - `limit` (optional, default: `10`)
  - `status` (optional, choices: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`)
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "08b2e762-0897-4216-ad03-aa52793eb86a",
        "projectName": "App Build",
        "description": "Express app",
        "status": "IN_PROGRESS",
        "startDate": "2026-06-18T10:00:00.000Z",
        "endDate": "2026-09-18T10:00:00.000Z",
        "createdAt": "2026-06-18T10:00:00.000Z",
        "userId": "5ff9ff1d-69ec-41fb-88ce-98f503ea79a8",
        "_count": { "tasks": 3 }
      }
    ],
    "pagination": {
      "totalCount": 1,
      "totalPages": 1,
      "currentPage": 1,
      "limit": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
  ```

##### Create Project (`POST /api/projects`)
- **Request Body**:
  ```json
  {
    "projectName": "Mobile Client Integration",
    "description": "Setup React Native workspace",
    "status": "NOT_STARTED",
    "startDate": "2026-07-01T10:00:00Z"
  }
  ```
- **Response Example (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Project created successfully",
    "data": {
      "project": {
        "id": "a93bc2f5-4122-45e3-a123-bc9876fa5432",
        "projectName": "Mobile Client Integration",
        "description": "Setup React Native workspace",
        "status": "NOT_STARTED",
        "startDate": "2026-07-01T10:00:00.000Z",
        "endDate": null,
        "createdAt": "2026-06-19T13:00:00.000Z",
        "userId": "5ff9ff1d-69ec-41fb-88ce-98f503ea79a8"
      }
    }
  }
  ```

##### Delete Project (`DELETE /api/projects/:id`)
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Project deleted successfully"
  }
  ```

---

#### 5. Tasks Management

##### Create Task under Project (`POST /api/tasks`)
- **Request Body**:
  ```json
  {
    "taskName": "Setup Database Schema",
    "description": "Draft tables and relations",
    "priority": "HIGH",
    "status": "PENDING",
    "projectId": "08b2e762-0897-4216-ad03-aa52793eb86a"
  }
  ```
- **Response Example (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Task created successfully",
    "data": {
      "task": {
        "id": "145a1146-4675-40f4-bc98-d573e46bc0a9",
        "taskName": "Setup Database Schema",
        "description": "Draft tables and relations",
        "priority": "HIGH",
        "status": "PENDING",
        "dueDate": null,
        "createdAt": "2026-06-19T13:05:00.000Z",
        "projectId": "08b2e762-0897-4216-ad03-aa52793eb86a"
      }
    }
  }
  ```

##### List Tasks (`GET /api/tasks`)
- **Query Parameters**:
  - `projectId` (optional, filters tasks to a single project workspace)
  - `status` (optional, choices: `PENDING`, `IN_PROGRESS`, `COMPLETED`)
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "tasks": [
        {
          "id": "145a1146-4675-40f4-bc98-d573e46bc0a9",
          "taskName": "Setup Database Schema",
          "description": "Draft tables and relations",
          "priority": "HIGH",
          "status": "PENDING",
          "dueDate": null,
          "createdAt": "2026-06-19T13:05:00.000Z",
          "projectId": "08b2e762-0897-4216-ad03-aa52793eb86a"
        }
      ]
    }
  }
  ```

---

## 🔮 Future Enhancements

The following extensions are planned to enhance the application for enterprise-level deployments:
- **Team Collaboration**: Shared workspace projects mapping permissions across multiple user accounts.
- **Role-Based Access Control (RBAC)**: Enforcing precise permission models (e.g. `Owner`, `Project Manager`, `Task Assignee`).
- **File Attachments**: Integration with AWS S3 / Cloudinary to upload images, media, and spec docs directly into tasks.
- **Email Notifications**: Alert pipelines updating users on task deadlines and modifications via Nodemailer / SendGrid.
- **Analytics Dashboard**: Aggregated performance timelines, burndown charts, and progress completion metrics.
