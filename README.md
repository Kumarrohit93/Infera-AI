# Infera AI

**Enterprise Knowledge Base and AI Document Question Answering**  
**Team:** Titans  
**Repository:** https://github.com/Kumarrohit93/Infera-AI  
**Documentation review:** 16 November 2026  
**Project status:** In development; the latest repository state has not been independently verified for this update.

## 1. About the project

Infera AI is a team project to help organizations organize internal documents and let authorized employees ask questions about them. The intended system uses **Retrieval-Augmented Generation (RAG)**: retrieve relevant passages from permitted documents, provide those passages to an AI model, and return a document-grounded answer with citations where supported.

**Example:** A member asks, “What is our company's leave policy?” The intended system searches the organization's approved HR documents and answers using the relevant policy text instead of guessing.

## 2. User roles and planned capabilities

| Role | Intended capabilities |
| --- | --- |
| **Admin** | Manage organization information, members, folders, documents, and permissions. |
| **Member** | Access permitted documents, ask questions through AI chat, and view sources/chat history. |

**Important:** These describe the intended product. They do not mean that every screen, integration, or security rule is complete.

## 3. Technology stack

| Area | Reported / designed technologies |
| --- | --- |
| Admin and member frontends | React, Vite, Tailwind CSS, Lucide React, Framer Motion |
| Backend | Node.js, Express |
| Database | PostgreSQL and the `pg` Node.js driver |
| Authentication and validation | JWT, `bcryptjs`, Zod (reported by backend documentation) |
| AI | RAG; specific model, embedding service, and live integration **not yet confirmed** |
| Deployment setup | Docker setup reported by team leader; exact run instructions **not yet confirmed** |
| Planned infrastructure from early system design | `pgvector`, Redis/BullMQ, object storage, OpenAI APIs — **do not assume implemented** |

## 4. Conceptual architecture

```text
Admin Frontend (React) ----\
                            >---- Express API ---- PostgreSQL
Member Frontend (React) ---/          |
                                     +---- RAG / document-answering component
```

Planned RAG sequence: **Upload → extract text → split into chunks → create embeddings/index → retrieve authorized passages → generate a grounded answer → show citations.** The exact pipeline and its working status still require code and test verification.

## 5. Backend setup (based on prior backend README)

**Prerequisites:** Git, Node.js/npm, PostgreSQL.

```bash
git clone https://github.com/Kumarrohit93/Infera-AI.git
cd Infera-AI
```

Locate the backend folder containing `app.js` and `package.json` (previous design names it `Infera-Backend/`), then run:

```bash
npm install
```

The backend README listed these packages:

```bash
npm install express pg dotenv cors helmet jsonwebtoken bcryptjs zod multer
```

Set up PostgreSQL and run the database scripts, **if present in your current checkout**, in the documented order:

1. `db/schema.sql` — organizations, users, organization members
2. `db/chat_schema.sql` — chats and messages
3. `db/invitations.sql` — invitation records

Create a local `.env` file using the environment-variable names expected by the checked-out code. **Never commit credentials or `.env`.** The previous backend documentation identifies the entry command as:

```bash
node app.js
```

The correct database connection settings, server port, scripts, and paths must be checked against the current backend files.

## 6. Frontend setup

Open each frontend application directory and inspect its `package.json` scripts. The frontends are built with React/Vite; a common Vite workflow is:

```bash
npm install
npm run dev
```

The older admin frontend README used a different start command. Use the **actual script from that application's `package.json`** rather than assuming both applications start identically.

## 7. Documented backend endpoints

These endpoints were **reported in the backend README**, not independently retested for this documentation update.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register-organization` | Register an organization and initial admin |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/accept-invitation` | Accept an organization invitation |
| GET | `/api/auth/me` | Read current authenticated user |
| POST | `/api/users/invitations` | Create an invitation (admin) |

The reported database tables include `organizations`, `users`, `organization_members`, `invitations`, `chats`, and `messages`.

## 8. Team responsibilities

| Member | Area |
| --- | --- |
| **Rohit Kumar** | Team lead; integration, PostgreSQL connection, Docker setup, UI coordination, and RAG work (reported) |
| **Sakshi** | Backend, database schemas, authentication and invitations |
| **Himanshu** | RAG development (individual implementation details need confirmation) |
| **Jiya** | Admin frontend |
| **Khushi** | Member frontend |
| **Sanjay Bhakhar** | Documentation, competitor research, progress reporting and QA preparation |

**Documentation correction:** Early design files identify a different team leader. The table above follows the later team update that identifies **Rohit Kumar** as leader. Exact RAG ownership should be confirmed with the team.

## 9. Development status (last documented evidence)

- **Backend:** Authentication and invitation endpoints and SQL schema files reported; API verification pending.
- **Member frontend:** React/Vite setup and a member login UI reported; live backend integration not confirmed.
- **Admin frontend:** Technology stack reported; completed screens not documented in the available update.
- **RAG:** Setup and implementation work reported; end-to-end retrieval and citation behavior not verified.
- **PostgreSQL/Docker/integration:** Setup or integration activity reported by team lead; working configuration not independently verified.
- **Documentation/QA:** Competitor research and progress tracking prepared. No completed QA test-run evidence was available in the previous report.
- **16 November 2026:** **New teammate commits and completed features not verified**. This README must be reconciled with the latest repository changes before the team marks it final.

For detailed statuses, outstanding questions, and the update log, see [`progress.md`](progress.md).

## 10. Collaboration

Work is divided across branches such as `be/auth-db`, `be/rag`, `fe/admin`, `fe/member`, and `docs/qa`. Use pull requests to merge reviewed changes into `main`. The precise branch ownership and merge rules should follow the team's current agreement.

## 11. Testing and documentation expectations

- Verify implemented features against running code, not only screenshots or README claims.
- Document positive and negative tests for login, invitations, document access, and AI answers.
- Check that members cannot access another organization's or unauthorized folders' content.
- Check that AI responses do not invent answers when evidence is missing.
- Record test steps, expected result, actual result, and any defect evidence.

## 12. Important limitations

This document is a **source-grounded draft** compiled from the team's earlier documentation and member reports. It is **not** a new audit of 16 November commits. Some items from the early architecture document (refresh tokens, Redis/BullMQ, pgvector, streaming chat, etc.) were only proposed and may have changed. Confirm the latest code, configuration, and ownership before claiming them as working.
