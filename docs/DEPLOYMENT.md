# Render and Vercel deployment

## Vercel

Create separate Vercel projects for `admin-frontend` and
`Infer-VA-Member-Frontend`. Both use `npm run build` and `dist` as the output
directory. The included `vercel.json` files provide the React Router fallback.

Set these public URLs in each Vercel project:

- Admin: `VITE_AUTH_URL` and `VITE_RAG_API_URL`
- Member: `VITE_API_BASE_URL` and `VITE_RAG_API_URL`

These `VITE_` values are included in browser code. Never put secrets in them.

## Render services

Create three Node services from the repository:

| Service | Root directory | Start command |
|---|---|---|
| Auth API | `Infera-Backend` | `node app.js` |
| RAG API | `Infera-RAG-Backend` | `npm start` |
| Ingestion worker | `Infera-RAG-Backend` | `npm run worker` |

Use the same pgvector PostgreSQL database for both APIs. The auth API accepts
`DATABASE_URL`; the RAG API accepts `DATABASE_URL` or the `DB_HOST`, `DB_PORT`,
`DB_USER`, `DB_PASSWORD`, and `DB_NAME` variables. Set `JWT_ACCESS_SECRET` to
the same value in both services. Configure `REDIS_URL` for the RAG API and
worker, plus `GEMINI_API_KEY`, `EMBEDDING_DIMENSION=1536`, and Cloudinary
credentials for the RAG service. Set `CORS_ORIGINS` / `CORS_ORIGIN` to both
deployed Vercel origins.
Keep the embedding dimension at 1536 to match the database's stored vectors;
changing it requires re-embedding documents before deployment.

Apply the auth schema files documented in `Infera-Backend/Readme.md` to the
production database. The RAG API initializes its idempotent RAG tables at
startup, including the document-version and full-text search migrations; the
API and worker must be able to create the `vector` extension and required
indexes. Use `/health/ready` as the RAG readiness check.

The worker is a separate always-on Render background service. It processes
queued document uploads and retries transient failures. The previous indexed
version remains current if replacement-version indexing fails. Both admin and
member chat use the authenticated `/api/rag/ask/stream` endpoint; chat history
and citations are saved only after a complete answer is generated.

Do not run `seed-test-admin.js` in production. Keep production credentials in
Render/Vercel environment settings, not in repository `.env` files.
