
# Infera Backend

## 1.) Basic setup

Install the packages with NPM:

```bash
npm i express pg dotenv cors helmet jsonwebtoken bcryptjs zod multer
```

## 2.) Run the backend

1. Create a PostgreSQL database named `infera` and run the table files in this order:

```bash
psql -U <db_user> -d infera -f db/schema.sql
psql -U <db_user> -d infera -f db/migration_employees.sql
psql -U <db_user> -d infera -f db/chat_schema.sql
psql -U <db_user> -d infera -f db/invitations.sql
psql -U <db_user> -d infera -f db/auth_security.sql
```

If the database was already initialized, apply these idempotent schema files
against the same database to enable the employee directory and invitations:

```bash
psql -U <db_user> -d infera -f db/migration_employees.sql
psql -U <db_user> -d infera -f db/invitations.sql
```

2. Create a `.env` file in `Infera-Backend` (private, never commit it):

```env
PORT=3000
DATABASE_URL=postgresql://<db_user>:<db_password>@localhost:5432/infera
JWT_ACCESS_SECRET=<random string>
JWT_REFRESH_SECRET=<another random string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5001,http://localhost:5173
INVITATION_EXPIRES_DAYS=7
RESEND_API_KEY=<Resend API key>
EMAIL_FROM=Infera AI <verified-sender@example.com>
```

3. Start the server:

```bash
npm install
node app.js
```

The backend loads this folder's `.env` regardless of the terminal's current
directory and applies the idempotent invitation and authentication-security
schemas before listening.
Local admin (`localhost:5001`) and member (`localhost:5173`) frontends are
allowed by default; add deployed frontend origins to `CORS_ORIGINS` as needed.

## 3.) Tables

| File | Tables |
|---|---|
| `db/schema.sql` | organizations, users, departments, organization_members |
| `db/migration_employees.sql` | Adds employee columns and seeds seven standard departments for existing organizations |
| `db/chat_schema.sql` | chats, messages |
| `db/invitations.sql` | invitations |
| `db/auth_security.sql` | refresh_sessions, password_reset_tokens |

## 4.) Auth APIs

| Method | URL | Who | What it does |
|---|---|---|---|
| POST | `/api/auth/register-organization` | Public | Creates an organization and its first Admin |
| POST | `/api/auth/login` | Public | Gives an access token and sets an HttpOnly refresh cookie |
| POST | `/api/auth/refresh` | Public | Rotates the refresh cookie and issues a new access token |
| POST | `/api/auth/logout` | Public | Revokes the refresh session and clears its cookie |
| POST | `/api/auth/forgot-password` | Public | Sends a one-time reset link |
| POST | `/api/auth/reset-password` | Public | Consumes a one-time token and updates the password |
| POST | `/api/auth/accept-invitation` | Public | Accepts a one-time invitation and starts a session |
| GET | `/api/auth/me` | Logged in | Shows the current user. Header: `Authorization: Bearer <token>` |

## 5.) User APIs

| Method | URL | Who | What it does |
|---|---|---|---|
| POST | `/api/users/invitations` | Admin only | Invites a person by email. Body: `email`, `role` (`admin` or `member`) |

How invitations work:

- The invitation token is never returned in the API response.
- Only the SHA-256 hash of the token is saved in the database.
- A token works one time only and expires after 7 days.
- Resend sends invitation and password reset emails. In development, when email credentials are absent, links are printed in the server terminal.
- Wrong, used or expired token gives `410`.

## 6.) Operations

- Access tokens are short-lived. Refresh sessions are rotated and revoked by the
  server; browsers store the refresh token in an HttpOnly cookie.
- List and cancel invitations (`GET` and `DELETE /api/users/invitations`)
- Set `RESEND_API_KEY` and a verified `EMAIL_FROM` sender before enabling production email.
- Refresh cookies use `SameSite=None; Secure` in production; keep CORS origins restricted to the deployed frontends.
- Use `/health/ready` for the Render health check.
- Docker (done by the Team Leader)
