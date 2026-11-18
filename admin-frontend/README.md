# Infera AI — Admin Console

Infera AI is an enterprise B2B SaaS platform that enables organizations to securely manage internal documents and verify AI-grounded citations.

## Tech Stack
- **Frontend:** React, Vite
- **Styling:** Tailwind CSS (Custom Beige & Brown Palette)
- **Icons & Animation:** Lucide React, Framer Motion

## Local setup

1. Configure the admin frontend API URLs in `admin-frontend/.env`:

   ```env
   VITE_AUTH_URL=http://localhost:9000/api
   VITE_RAG_API_URL=http://localhost:7000/api
   ```

2. Configure and start both backends:
   - `Infera-Backend` on port `9000`
   - `Infera-RAG-Backend` on port `7000`
   - Set `CORS_ORIGIN=http://localhost:5001` in each backend environment.
   - Set the same `JWT_ACCESS_SECRET` in both backends so the login token works for both APIs.

3. Install dependencies and run the admin frontend:

   ```powershell
   cd admin-frontend
   npm install
   npm run dev
   ```

   Vite serves the admin frontend at `http://localhost:5001`.

The admin console uses the auth backend for login, employees, departments, and organization members; the RAG backend handles documents, folders, and conversations. Feedback, invitation email delivery/acceptance UI, external integrations, analytics, and settings writes are not exposed by the current backend APIs and are shown as unavailable rather than being saved locally.