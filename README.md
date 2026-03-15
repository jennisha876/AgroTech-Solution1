# AgroTechSolution

AgroTechSolution is a full-stack agriculture marketplace and farm-management platform.

It supports:
- Buyer flows: search/filter products, cart, checkout simulation, delivery source tracking map, order history, and reviews.
- Farmer flows: crop management, weather insights/alerts, and TechGro AI assistant.
- Admin flows: `/admin` dashboard with system overview (users/orders/reviews/reset requests).
- Authentication: role-aware login, password hashing, forgot/reset password with token links.

## Tech Stack

### Frontend
- Language: TypeScript + React
- Framework/tooling: Vite
- Styling: Tailwind CSS + component primitives
- Routing: React Router
- Map: Leaflet

### Backend
- Language: JavaScript (Node.js, ESM)
- Framework: Express
- Validation: Zod
- Auth: JWT + bcryptjs

### Data Storage (Database)
- File-based JSON storage (no external DB server required)
- Data files under [backend/data](backend/data):
  - [backend/data/users.json](backend/data/users.json)
  - [backend/data/orders.json](backend/data/orders.json)
  - [backend/data/crops.json](backend/data/crops.json)
  - [backend/data/reviews.json](backend/data/reviews.json)
  - [backend/data/passwordResets.json](backend/data/passwordResets.json)

## Project Structure

- Frontend app: [src](src)
- Backend API: [backend/src](backend/src)
- Static assets (favicon/logo): [public/images](public/images)

## Environment Variables

Create `backend/.env` from `backend/.env.example` and set values as needed:
- `PORT=4000`
- `JWT_SECRET=...`
- `FRONTEND_ORIGIN=http://localhost:5173`
- `OPENAI_API_KEY=` (optional)
- `STRIPE_SECRET_KEY=` (optional)

## Setup and Run

### 1. Install dependencies

```bash
npm install
npm --prefix backend install
```

### 2. Run backend

```bash
npm --prefix backend run dev
```

Backend health endpoint:
- `http://localhost:4000/api/health`

### 3. Run frontend

```bash
npm run dev
```

Vite will print the active local URL (for example `http://localhost:5176`).

## Default Test Credentials

These seeded accounts are available in [backend/data/users.json](backend/data/users.json):

### Buyer
- Email: `buyer@test.local`
- Username: `testbuyer`
- Password: `Buyer@1234`
- Role: `buyer`

### Farmer
- Email: `farmer@test.local`
- Username: `testfarmer`
- Password: `Farmer@1234`
- Role: `farmer`

### Admin
- Email: `admin@test.local`
- Username: `testadmin`
- Password: `Admin@1234`
- Role: `admin`

Admin URL after login:
- `/admin`
- Example: `http://localhost:5176/admin`

## Password Reset Flow

1. Click `Forget Password?` on login.
2. Enter email or username.
3. System creates and stores a reset token in [backend/data/passwordResets.json](backend/data/passwordResets.json).
4. User opens `/reset-password?token=<token>`.
5. New password is hashed and saved.

## Branding Assets (Logo and Favicon)

Put your brand assets in [public/images](public/images):
- `favicon.svg` (or update `index.html` if using png/ico)
- `logomain.svg` (replace placeholder logo)

Current app references:
- Favicon: [index.html](index.html)
- Logo image usage in UI headers/components.

## Scripts

- `npm run dev` -> frontend dev server
- `npm run dev:backend` -> backend dev server
- `npm run dev:all` -> run frontend + backend together
- `npm run build` -> frontend production build

## Notes

- Payments are simulated when Stripe key is not configured.
- Weather uses public API fallback.
- TechGro AI supports conversational history and falls back gracefully without API key.
