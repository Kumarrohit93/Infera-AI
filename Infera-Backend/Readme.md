## Basic Setup of Infera Backend 

## we install some 3rd party packages by the help of NPM using the command npm i express pg dotenv cors helmet jsonwebtoken bcryptjs zod multer

##2.) ## 2.) Run the backend

1. Create a PostgreSQL database named `infera` and run the tables:

```bash
psql -U <db_user> -d infera -f db/schema.sql
```

2. Create a `.env` file in `Infera-Backend` (private, never commit it):

```env
PORT=3000
DATABASE_URL=postgresql://<db_user>:<db_password>@localhost:5432/infera
JWT_ACCESS_SECRET=<random string>
JWT_REFRESH_SECRET=<another random string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

3. Start the server:

```bash
npm install
node app.js
```

## 3.) Auth APIs

| Method | URL | What it does |
|---|---|---|
| POST | `/api/auth/register-organization` | Creates an organization and its first Admin |
| POST | `/api/auth/login` | Gives an access token (valid for 15 minutes) |
| GET | `/api/auth/me` | Shows the current user. Header: `Authorization: Bearer <token>` |

Not done yet: refresh token, logout, invitations, Docker.