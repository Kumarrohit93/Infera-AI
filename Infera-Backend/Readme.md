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
psql -U <db_user> -d infera -f db/chat_schema.sql
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
FRONTEND_URL=http://localhost:5001
INVITATION_EXPIRES_DAYS=7
```

3. Start the server:

```bash
npm install
node app.js
```

## 3.) Tables

| File | Tables |
|---|---|
| `db/schema.sql` | organizations, users, organization_members |
| `db/chat_schema.sql` | chats, messages |
| `db/invitations.sql` | invitations |

## 4.) Auth APIs

| Method | URL | Who | What it does |
|---|---|---|---|
| POST | `/api/auth/register-organization` | Public | Creates an organization and its first Admin |
| POST | `/api/auth/login` | Public | Gives an access token (valid for 15 minutes) |
| POST | `/api/auth/accept-invitation` | Public | Member sets name and password using the invitation token. Creates the account and gives an access token |
| GET | `/api/auth/me` | Logged in | Shows the current user. Header: `Authorization: Bearer <token>` |

## 5.) User APIs

| Method | URL | Who | What it does |
|---|---|---|---|
| POST | `/api/users/invitations` | Admin only | Invites a person by email. Body: `email`, `role` (`admin` or `member`) |

How invitations work:

- The invitation token is never returned in the API response.
- Only the SHA-256 hash of the token is saved in the database.
- A token works one time only and expires after 7 days.
- Email sending is not set up yet. In development the invite link is printed in the server terminal.
- Wrong, used or expired token gives `410`.

## 6.) Not done yet

- Logout is handled on the client side. Refresh token is not planned for now.
- List and cancel invitations (`GET` and `DELETE /api/users/invitations`)
- Sending the invitation email
- Rate limit, Helmet and CORS setup
- Docker (done by the Team Leader)