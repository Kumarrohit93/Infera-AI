# Infera AI

**An AI-Powered Enterprise Knowledge Management Platform**

Infera AI is a team-based software development project designed to help organizations manage their internal knowledge and access information using Artificial Intelligence.

The platform aims to provide a centralized workspace where organizations can manage documents, control user access, and allow employees to ask questions about company information through an AI-powered chatbot.

The project uses **Retrieval-Augmented Generation (RAG)** to retrieve relevant information from organizational documents and generate context-based answers.

## 1. Project Overview

Organizations often store important information across multiple documents, files, and systems. Finding the right information manually can be time-consuming.

Infera AI aims to solve this problem by combining document management with AI-powered search and question answering.

The platform is designed around two main user roles:

- **Admin:** Manages organizational information, documents, and team members.
- **Member:** Accesses permitted organizational information and interacts with the AI chatbot.

## 2. Project Objectives

- Build a centralized platform for organizational knowledge.
- Make information retrieval faster using AI.
- Implement secure user authentication and organization management.
- Develop separate interfaces for administrators and members.
- Integrate Retrieval-Augmented Generation (RAG).
- Provide a scalable foundation for future enterprise features.

## 3. Key Features

The project includes both implemented components and features under development.

### Authentication and Organization Management

- Organization registration.
- User login using authentication APIs.
- JWT-based authentication.
- Organization member management.
- Invitation-based member registration.

### Admin Dashboard

The admin interface is being developed to support organizational management activities, including:

- Managing organizational members.
- Managing organizational documents.
- Controlling access to organizational information.
- Accessing administrative features through a dedicated interface.

### Member Dashboard

The member interface is being developed to provide:

- A dedicated member login page.
- Access to permitted organizational information.
- AI-powered document question answering.
- A responsive and user-friendly interface.

### AI-Powered Knowledge Retrieval

The RAG component is intended to:

1. Receive a question from a user.
2. Search relevant organizational document content.
3. Retrieve useful information.
4. Generate an answer using the retrieved context.
5. Provide source references where supported.

## 4. Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Styling | Tailwind CSS |
| UI and Animation | Lucide React, Framer Motion |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT, bcryptjs |
| Validation | Zod |
| AI | Retrieval-Augmented Generation (RAG) |
| Development Tools | Git, GitHub, NPM |
| Containerization | Docker |

Additional AI services and infrastructure components may be integrated as development continues.

## 5. System Architecture

Infera AI follows a modular architecture consisting of a frontend, backend, database, and AI retrieval component.

**Frontend:** Provides interfaces for administrators and organization members.

**Backend:** Handles API requests, authentication, organization management, and application logic.

**Database:** Stores organizational information, users, invitations, chats, and messages.

**RAG Component:** Supports AI-based retrieval and question answering using organizational knowledge.

### General Workflow

1. A user accesses the Infera AI platform.
2. The frontend sends requests to the backend.
3. The backend authenticates the user and processes the request.
4. Relevant information is retrieved from the database or knowledge retrieval system.
5. The result is returned to the frontend.

## 6. Backend Setup

### Prerequisites

Install the following software before running the project:

- Node.js and NPM
- PostgreSQL
- Git
- A code editor such as Visual Studio Code

### Step 1: Clone the Repository

```bash
git clone https://github.com/Kumarrohit93/Infera-AI.git
```

### Step 2: Open the Project

```bash
cd Infera-AI
```

### Step 3: Install Backend Dependencies

Navigate to the backend directory containing `package.json`.

Install dependencies using:

```bash
npm install
```

The backend uses the following third-party packages:

```bash
npm install express pg dotenv cors helmet jsonwebtoken bcryptjs zod multer
```

These packages provide functionality such as API development, PostgreSQL connectivity, authentication, password hashing, validation, and file handling.

### Step 4: Configure PostgreSQL

Create a PostgreSQL database named:

```text
infera
```

The backend documentation identifies the following SQL files:

- `db/schema.sql`
- `db/chat_schema.sql`
- `db/invitations.sql`

Run the required SQL scripts to create the database tables.

### Step 5: Configure Environment Variables

Create a `.env` file in the backend directory and configure the database connection, JWT secret, and other required application settings.

Use the environment variable names expected by the backend source code.

**Important:** Never upload the `.env` file or secret credentials to GitHub.

### Step 6: Start the Backend

After installing dependencies and configuring the database, run the backend entry point:

```bash
node app.js
```

Ensure the command is executed from the directory containing `app.js`.

## 7. Frontend Setup

The project contains separate frontend development work for administrators and members.

For each frontend application:

1. Open its respective directory.
2. Install the required packages.
3. Start the application using the script defined in its `package.json`.

Typical Vite-based development setup:

```bash
npm install
npm run dev
```

The exact command may differ depending on the frontend application's configuration.

## 8. Backend API Endpoints

The backend documentation currently identifies the following authentication and user-management endpoints:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register-organization` | Register an organization |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/auth/accept-invitation` | Accept an organization invitation |
| GET | `/api/auth/me` | Retrieve authenticated user information |
| POST | `/api/users/invitations` | Create an organization invitation |

Additional endpoints may be introduced as development progresses.

## 9. Database Design

The backend uses PostgreSQL for storing application data.

The documented database tables include:

- `organizations` – Stores organization information.
- `users` – Stores user account information.
- `organization_members` – Maintains organization membership.
- `invitations` – Stores organization invitation details.
- `chats` – Stores chat session information.
- `messages` – Stores individual chat messages.

The database structure may be extended as new features are implemented.

## 10. Team Members and Contributions

The project is being developed collaboratively by the **Titans** team.

| Team Member | Responsibility | Contributions |
|---|---|---|
| Rohit Kumar | Team Leader and Integration | Project coordination, branch integration, PostgreSQL connectivity, Docker setup, RAG development support, frontend coordination, and functionality testing |
| Sakshi | Backend Development | Authentication APIs, database schemas, organization registration, login, and invitation management |
| Himanshu | RAG Development | Development of the Retrieval-Augmented Generation component |
| Jiya | Admin Frontend | Admin interface development using React, Vite, Tailwind CSS, and UI libraries |
| Khushi | Member Frontend | Member login interface, reusable authentication components, responsive layouts, and frontend setup |
| Sanjay Bhakhar | Documentation and QA | Project documentation, competitor research, progress tracking, and QA test-case preparation |

## 11. Development Workflow

The team uses Git and GitHub for version control and collaboration.

Development responsibilities are separated into individual branches.

| Branch | Responsibility |
|---|---|
| `main` | Main project branch |
| `be/auth-db` | Backend authentication and database |
| `be/rag` | RAG development |
| `fe/admin` | Admin frontend |
| `fe/member` | Member frontend |
| `docs/qa` | Documentation and quality assurance |

Team members develop features on their assigned branches and integrate their work through GitHub pull requests.

## 12. Project Status

**Status: Under Active Development**

The project has made progress in the following areas:

- Backend authentication and organization APIs.
- PostgreSQL database design and connectivity.
- Admin and member frontend development.
- Initial member login interface.
- RAG component setup and development.
- Docker environment setup.
- Integration of team contributions.
- Project documentation and competitor research.

### Ongoing and Planned Work

- Completing frontend and backend integration.
- Completing document management functionality.
- Finalizing AI-powered question answering.
- Implementing and validating user permissions.
- Testing complete application workflows.
- Improving error handling and application security.
- Preparing the application for deployment.

Features described as planned or under development should not be considered production-ready.

## 13. Future Scope

Future improvements may include:

- Advanced document search and filtering.
- Improved AI-generated answers with source citations.
- Enhanced role-based access control.
- Support for additional document formats.
- Improved performance and scalability.
- Analytics and usage monitoring.
- Cloud deployment and production monitoring.

## 14. Documentation and Testing

Project documentation and quality assurance activities include:

- Competitor research and feature analysis.
- Technical and functional documentation.
- Development progress tracking.
- Test-case preparation.
- API and application workflow testing as features become available.
- Reporting and tracking identified issues.

Testing results will be documented as the application reaches integration and validation stages.

## 15. Repository

**GitHub Repository:** https://github.com/Kumarrohit93/Infera-AI

The repository contains the collaborative development work of the Infera AI team.

---

**Developed by Team Titans**

*Infera AI – Making Organizational Knowledge Easier to Access with Artificial Intelligence.*
