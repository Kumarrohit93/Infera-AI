# Infera AI

**AI-powered organizational knowledge management and document question answering**

**Project status:** Pre-deployment — the team reports that the project is mostly complete. Final integration, QA, security, and deployment checks are being confirmed.  
**Team:** Titans  
**Repository:** https://github.com/Kumarrohit93/Infera-AI

## Overview

Infera AI is an enterprise knowledge-base project that helps organizations organize internal documents and find information using natural-language questions. Its intended workflow combines document management, role-based access, and Retrieval-Augmented Generation (RAG) so employees can receive answers grounded in the documents they are authorized to access.

**Example:** Instead of manually searching a long HR policy, a member can ask, “How many casual leaves are available?” The AI workflow is designed to retrieve relevant policy sections and respond with supporting sources.

## Users and capabilities

| Role | Main capabilities |
| --- | --- |
| **Admin** | Manage organizational members, documents, folders, and permissions; monitor organization activity. |
| **Member** | Sign in, access permitted content, ask questions about documents, and review AI answers and citations. |

The full feature list above describes the project's **intended scope**. Individual feature readiness should be checked against the current application and tracked in `Infera_AI_Project_Progress_Updated.md`.

## Technology stack

| Area | Technologies documented by the team |
| --- | --- |
| Admin and member frontends | React, Vite, JavaScript, Tailwind CSS |
| UI elements | Lucide React, Framer Motion |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (`pg`) |
| Authentication and validation | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Zod |
| Other backend dependencies | `dotenv`, `cors`, `helmet`, `multer` |
| AI approach | Retrieval-Augmented Generation (RAG) |
| Containerization | Docker setup reported by the team lead |
| Collaboration | Git and GitHub |

The original design also proposed **pgvector, Redis/BullMQ, object storage, and an LLM API**. Verify which of those are present in the latest working build before listing them as implemented dependencies.

## High-level architecture

```text
Admin frontend          Member frontend
      \                     /
       \                   /
           Express API
           /        \
    PostgreSQL    RAG / document-processing component
                       |
                  AI answer + source references
```

1. A user signs in through the frontend.
2. The backend handles authentication and access checks.
3. Admins manage content and members; members use permitted content.
4. For document questions, the RAG component is designed to retrieve relevant passages and use them to produce grounded answers.
5. The frontend displays the response, including sources when supported.

## Getting started (local development)

**Prerequisites:** Git, Node.js with npm, and PostgreSQL. Some services may require additional configuration.

```bash
git clone https://github.com/Kumarrohit93/Infera-AI.git
cd Infera-AI
```

### Backend

The earlier backend documentation uses `Infera-Backend` and an `app.js` entry point:

```bash
cd Infera-Backend
npm install
```

Create a local `.env` file using the variable names actually referenced by the current source code. Configure the PostgreSQL connection, JWT secret, application port, and any required AI service credentials. **Never commit `.env` or API keys.**

The previously documented database setup files were:

```text
db/schema.sql
db/chat_schema.sql
db/invitations.sql
```

Run the SQL migrations/schema scripts required by your **current** backend version. Then, if `app.js` is still the entry point:

```bash
node app.js
```

### Frontends

The earlier team updates describe separate React/Vite admin and member frontends. In each frontend directory containing a `package.json`, run:

```bash
npm install
```

Then use the command listed in that application's `package.json` under `scripts` (often `npm run dev` for Vite). **Check the actual directory names and scripts in the current repository** before executing these instructions.

### Docker

A Docker setup has been reported. Use the current Docker or Compose configuration supplied by the team lead; the exact service names and commands have not been confirmed in this document.

## Previously documented backend endpoints

These endpoints appeared in the backend team's earlier update. Confirm they still match the current implementation.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register-organization` | Register an organization and initial admin |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/auth/accept-invitation` | Accept a member invitation |
| GET | `/api/auth/me` | Get current authenticated user information |
| POST | `/api/users/invitations` | Create a member invitation (admin) |

Earlier database tables included `organizations`, `users`, `organization_members`, `invitations`, `chats`, and `messages`. Other tables for documents, permissions, citations, and processing were specified in the system design; check current migrations for actual coverage.

## Development team

| Member | Responsibility |
| --- | --- |
| **Rohit Kumar** | Team lead, integration, database connectivity, Docker setup, and RAG development support |
| **Sakshi** | Backend, authentication APIs, and database schemas |
| **Himanshu** | RAG development |
| **Jiya** | Admin frontend |
| **Khushi** | Member frontend |
| **Sanjay Bhakhar** | Documentation, competitor research, progress tracking, and QA preparation |

## Development workflow

The project uses feature branches and pull requests. Historically documented branches include `be/auth-db`, `be/rag`, `fe/admin`, `fe/member`, and `docs/qa`. Changes should be reviewed before merging into `main`.

## Release readiness

The team reports that the application is **mostly complete and approaching deployment**. Before describing it as deployed or production-ready, confirm:

- [ ] Frontend-to-backend login, session handling, and logout behavior
- [ ] Admin and member permissions, including cross-organization isolation
- [ ] Document upload, processing, and supported file formats
- [ ] RAG relevance, citations, and appropriate “answer not found” handling
- [ ] Database schema/migrations and required environment variables
- [ ] Deployment configuration, secret management, and health checks
- [ ] End-to-end QA results, resolved blocking bugs, and successful build/run
- [ ] Live URL and deployment date, once the service is actually available

For member-by-member status and verification gaps, see [`Infera_AI_Project_Progress_Updated.md`](./Infera_AI_Project_Progress_Updated.md).

## Documentation

- **System design:** architecture, intended data flows, permissions, and major components (early draft; update to match final code).
- **Team workflow:** branch ownership, pull requests, and coordination rules (initial proposal).
- **Competitor research:** comparison of enterprise AI search and document Q&A platforms.
- **Progress tracker:** workstream updates and deployment checklist.

---

**Developed by Team Titans**  
*Last documentation update: 19 November 2026.*
